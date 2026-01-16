import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// File upload (PDF) - memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Middleware
app.use(cors({
  origin: ['http://localhost:5176', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

// SemSense AI endpoint (supports optional timetable PDF upload)
app.post('/api/semsense-ai', upload.single('timetable'), async (req, res) => {
  try {
    console.log('📥 Incoming SemSense AI request', {
      contentType: req.headers['content-type'],
      hasFile: !!req.file,
      bodyKeys: Object.keys(req.body || {})
    });
    // Handle both JSON and multipart/form-data payloads
    // When multipart, complex fields arrive as strings; parse if necessary
    let {
      semesterNumber,
      subjects,
      weeklyAvailableHours,
      studentInterests,
      academicCalendar,
      studentName = 'Student'
    } = req.body;

    if (typeof subjects === 'string') {
      try { subjects = JSON.parse(subjects); } catch {}
    }
    if (typeof studentInterests === 'string') {
      try { studentInterests = JSON.parse(studentInterests); } catch {}
    }
    if (typeof academicCalendar === 'string') {
      try { academicCalendar = JSON.parse(academicCalendar); } catch {}
    }
    if (typeof semesterNumber === 'string') semesterNumber = parseInt(semesterNumber, 10);
    if (typeof weeklyAvailableHours === 'string') weeklyAvailableHours = parseInt(weeklyAvailableHours, 10);

    const isValidSemester = Number.isFinite(semesterNumber) && semesterNumber > 0;
    const isValidWeeklyHours = Number.isFinite(weeklyAvailableHours) && weeklyAvailableHours > 0;
    const isValidSubjects = Array.isArray(subjects) && subjects.length > 0;

    if (!isValidSemester || !isValidSubjects || !isValidWeeklyHours) {
      console.warn('⚠️  Validation failed', {
        semesterNumber,
        weeklyAvailableHours,
        subjectsType: typeof subjects,
        subjectsLength: Array.isArray(subjects) ? subjects.length : 'n/a'
      });
      return res.status(400).json({
        error: 'Missing required fields: semesterNumber, subjects, weeklyAvailableHours'
      });
    }

    // Validate Groq API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Groq API key not configured'
      });
    }

    // Extract PDF timetable text if uploaded
    let timetableText = '';
    if (req.file && req.file.buffer) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        timetableText = parsed?.text || '';
      } catch (pdfErr) {
        console.warn('⚠️  Failed to parse uploaded PDF:', pdfErr?.message || pdfErr);
      }
    }

    // Build the prompt for Gemini
    const subjectsList = subjects
      .map(s => `- ${s.name} (${s.credits} credits, Difficulty: ${s.difficulty})`)
      .join('\n');

    const interestsList = studentInterests && Array.isArray(studentInterests)
      ? `Student interests: ${studentInterests.join(', ')}`
      : 'Student interests: Not provided';

    const calendarInfo = academicCalendar
      ? `Provided Academic Calendar (manual): ${JSON.stringify(academicCalendar)}`
      : 'No manual calendar provided';

    const timetableInfo = timetableText
      ? `
UNIVERSITY SEMESTER TIMETABLE (PDF EXTRACT):
${timetableText.substring(0, 15000)}
      `
      : '\nNo PDF timetable uploaded.\n';

     const prompt = `
  You are an expert academic advisor helping a student plan their semester intelligently.

  STUDENT PROFILE:
  - Name: ${studentName}
  - Semester: ${semesterNumber}
  - Weekly Available Study Hours: ${weeklyAvailableHours} hours
  - ${interestsList}

  SUBJECTS THIS SEMESTER:
  ${subjectsList}

  ${calendarInfo}
  ${timetableInfo}

  TASK:
  Analyze this semester using the provided timetable (if any) and produce holiday-aware guidance. Do ALL of the following:

  1) TIMETABLE UNDERSTANDING
    - Identify semester duration (start/end), exam periods, short breaks (<=3 days), medium breaks (4-7 days), long breaks (>7 days), and light academic weeks.

  2) WORKLOAD ANALYSIS
    - Overall difficulty (Low/Medium/High) and realistic weekly time per subject.
    - Flag high-risk periods (exam clusters, heavy weeks).

  3) HOLIDAY-AWARE ROADMAP
    - Build a semester roadmap highlighting: academic focus weeks and holiday opportunity windows.
    - For each holiday window: classify as Mini (short), Intermediate (medium), or Flagship (long) and give 1-2 realistic project ideas with expected outcomes.

  4) PROJECT & SKILL RECOMMENDATIONS (TREND-AWARE)
    - Match to subjects and interests; consider current engineering trends.
    - Recommend exactly 1 primary skill and 1 supporting skill for the semester (practical, achievable).

  5) REVISION & UPSKILLING WINDOWS
    - Detect weeks suitable for revision and upskilling (avoid heavy exam weeks).

  BEHAVIOR RULES
  - Do not overload the student. Keep suggestions semester-bound and sustainable.
  - Use calm, supportive tone; avoid competition language.
  - No chatty conversation—return clear sections with bullet points and short paragraphs.

  FORMAT STRICTLY AS:
  ## Semester Timeline Summary
  ... (duration, exams, light weeks)

  ## Holiday Windows (Classified)
  - Window 1 (type, dates): ...
    - Project idea(s): ...
    - Expected outcomes: ...

  ## Weekly Study Plan (16 weeks)
  - Week 1-2: ...

  ## Skills (Primary + Supporting)
  - Primary: ... | Why now: ...
  - Supporting: ... | Why now: ...

  ## Trends To Watch
  - Trend: ... | Relevance: ...

  ## Notes (Balance & Recovery)
  - ...
  `;

    console.log('📨 Sending prompt to Groq...');
    console.log('Semester:', semesterNumber, '| Subjects:', subjects.length, '| Available Hours:', weeklyAvailableHours);

    // Validate Groq API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: 'Groq API key not configured'
      });
    }

    // Call Groq API - using llama-3.3-70b-versatile (latest available model)
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048
    });

    const text = completion.choices[0]?.message?.content || '';

    console.log('✅ Groq response received successfully');

    // Return structured response
    res.json({
      success: true,
      data: {
        semesterNumber,
        studentName,
        analysisTimestamp: new Date().toISOString(),
        aiAnalysis: text,
        subjectsCount: subjects.length,
        weeklyAvailableHours
      }
    });

  } catch (error) {
    console.error('💥 Error in SemSense AI endpoint:', error.message);

    // Handle specific Groq errors
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Groq API key is invalid or missing',
        details: error.message
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'API rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Failed to generate semester plan',
      details: error.message,
      hint: 'Check backend logs for more information'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📝 SemSense AI endpoint: POST http://localhost:${PORT}/api/semsense-ai`);
  console.log(`🏥 Health check: GET http://localhost:${PORT}/api/health`);
  
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY not set in environment variables');
  }
});

