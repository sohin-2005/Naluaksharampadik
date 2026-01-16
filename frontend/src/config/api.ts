// API configuration for backend endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  SEMSENSE_AI: `${API_BASE_URL}/api/semsense-ai`
};

// Helper function to call SemSense AI
export async function callSemSenseAI(
  semesterData: {
  semesterNumber: number;
  studentName?: string;
  subjects: Array<{
    name: string;
    credits: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }>;
  weeklyAvailableHours: number;
  studentInterests?: string[];
  academicCalendar?: Record<string, any>;
},
  timetableFile?: File | null
) {
  try {
    console.log('📨 Calling SemSense AI endpoint...');
    let response: Response;

    if (timetableFile) {
      // Send multipart/form-data when a PDF is included
      const form = new FormData();
      form.append('semesterNumber', String(semesterData.semesterNumber));
      if (semesterData.studentName) form.append('studentName', semesterData.studentName);
      form.append('subjects', JSON.stringify(semesterData.subjects));
      form.append('weeklyAvailableHours', String(semesterData.weeklyAvailableHours));
      if (semesterData.studentInterests) form.append('studentInterests', JSON.stringify(semesterData.studentInterests));
      if (semesterData.academicCalendar) form.append('academicCalendar', JSON.stringify(semesterData.academicCalendar));
      form.append('timetable', timetableFile);

      response = await fetch(API_ENDPOINTS.SEMSENSE_AI, {
        method: 'POST',
        body: form
      });
    } else {
      // Default to JSON payload when no file is provided
      response = await fetch(API_ENDPOINTS.SEMSENSE_AI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(semesterData)
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to call SemSense AI');
    }

    const data = await response.json();
    console.log('✅ SemSense AI response received:', data);
    return data;
  } catch (error) {
    console.error('💥 Error calling SemSense AI:', error);
    throw error;
  }
}

// Health check
export async function checkBackendHealth() {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH);
    return response.ok;
  } catch {
    return false;
  }
}
