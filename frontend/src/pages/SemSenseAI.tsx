import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Brain, Loader2, Download, Share2, Save, Calendar, Target, TrendingUp, Lightbulb, Clock, Award, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { callSemSenseAI } from '../config/api';
import jsPDF from 'jspdf';

interface Subject {
  name: string;
  credits: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface AnalysisResult {
  success: boolean;
  data: {
    semesterNumber: number;
    studentName: string;
    analysisTimestamp: string;
    aiAnalysis: string;
    subjectsCount: number;
    weeklyAvailableHours: number;
  };
}

export function SemSenseAI() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [step, setStep] = useState<'form' | 'analysis'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Form state
  const [semester, setSemester] = useState('4');
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: '', credits: 3, difficulty: 'Medium' }
  ]);
  const [weeklyHours, setWeeklyHours] = useState('25');
  const [interests, setInterests] = useState('');
  const [calendarEvents, setCalendarEvents] = useState('');
  const [timetableFile, setTimetableFile] = useState<File | null>(null);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', credits: 3, difficulty: 'Medium' }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const updated = [...subjects];
    (updated[index] as any)[field] = value;
    setSubjects(updated);
  };

  const handleAnalyze = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!semester || subjects.length === 0 || !weeklyHours) {
        throw new Error('Please fill in all required fields');
      }

      if (subjects.some(s => !s.name)) {
        throw new Error('All subjects must have a name');
      }

      const interestsList = interests
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      console.log('📊 Sending semester data to backend...');

      const result = await callSemSenseAI({
        semesterNumber: parseInt(semester),
        studentName: userProfile?.full_name || 'Student',
        subjects,
        weeklyAvailableHours: parseInt(weeklyHours),
        studentInterests: interestsList.length > 0 ? interestsList : undefined,
        academicCalendar: calendarEvents
          ? { events: calendarEvents.split('\n').filter(e => e.trim()) }
          : undefined
      }, timetableFile);

      console.log('✅ Analysis received:', result);
      setAnalysisResult(result as AnalysisResult);
      setStep('analysis');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate semester plan';
      setError(message);
      console.error('💥 Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!analysisResult) return;

    try {
      // TODO: Save to database
      console.log('💾 Saving semester plan...');
      alert('✅ Semester plan saved! You can sync it with your mentor.');
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Failed to save plan');
    }
  };

  const handleDownloadPlan = () => {
    if (!analysisResult) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(139, 92, 246); // Purple
      doc.text('SemSense AI - Semester Plan', margin, yPos);
      yPos += 15;

      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Student: ${analysisResult.data.studentName}`, margin, yPos);
      yPos += 6;
      doc.text(`Semester: ${analysisResult.data.semesterNumber}`, margin, yPos);
      yPos += 6;
      doc.text(`Generated: ${new Date(analysisResult.data.analysisTimestamp).toLocaleDateString()}`, margin, yPos);
      yPos += 6;
      doc.text(`Weekly Hours Available: ${analysisResult.data.weeklyAvailableHours}`, margin, yPos);
      yPos += 12;

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // AI Analysis Content
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const analysisText = analysisResult.data.aiAnalysis;
      const lines = doc.splitTextToSize(analysisText, maxWidth);
      
      lines.forEach((line: string) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        // Format headers (lines starting with ##)
        if (line.startsWith('##')) {
          yPos += 5;
          doc.setFontSize(14);
          doc.setTextColor(139, 92, 246);
          doc.text(line.replace('##', '').trim(), margin, yPos);
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          yPos += 8;
        } else if (line.trim()) {
          doc.text(line, margin, yPos);
          yPos += 6;
        } else {
          yPos += 3;
        }
      });

      // Footer on last page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated by SemSense AI - Naalu Aksharam Padikk | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          285,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`SemPlan_Sem${analysisResult.data.semesterNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  // Parse AI markdown-style response into structured sections
  const parseAIAnalysis = (text: string) => {
    const sections: Record<string, string[]> = {};
    let currentSection = '';
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').trim();
        sections[currentSection] = [];
      } else if (currentSection && line.trim()) {
        sections[currentSection].push(line);
      }
    }

    return sections;
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {step === 'form' ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-purple-500" />
              <h1 className="text-4xl font-bold">SemSense AI</h1>
            </div>
            <p className="text-gray-400">Plan your semester wisely with AI-powered guidance</p>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Semester Plan</h1>
            <p className="text-gray-400">
              Semester {analysisResult?.data.semesterNumber} • Generated {new Date(analysisResult?.data.analysisTimestamp || '').toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        {error && (
          <Card className="bg-red-900/20 border-red-800 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-300">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {step === 'form' ? (
          <div className="space-y-6">
            {/* Semester Setup Card */}
            <Card className="bg-neutral-900 border border-neutral-800">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">1</span>
                  Semester Setup
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Semester Number *</label>
                    <Input
                      type="number"
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white"
                      min="1"
                      max="8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Weekly Available Hours *</label>
                    <Input
                      type="number"
                      value={weeklyHours}
                      onChange={e => setWeeklyHours(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-white"
                      min="1"
                      max="168"
                    />
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Your Subjects *</label>
                  <div className="space-y-3">
                    {subjects.map((subject, idx) => (
                      <div key={idx} className="flex gap-3">
                        <Input
                          placeholder="Subject name (e.g., Data Structures)"
                          value={subject.name}
                          onChange={e => updateSubject(idx, 'name', e.target.value)}
                          className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                        />
                        <Input
                          type="number"
                          placeholder="Credits"
                          value={subject.credits}
                          onChange={e => updateSubject(idx, 'credits', parseInt(e.target.value))}
                          className="w-20 bg-neutral-800 border-neutral-700 text-white"
                          min="1"
                          max="6"
                        />
                        <select
                          value={subject.difficulty}
                          onChange={e => updateSubject(idx, 'difficulty', e.target.value)}
                          className="px-3 bg-neutral-800 border border-neutral-700 text-white rounded-md text-sm"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                        {subjects.length > 1 && (
                          <Button
                            onClick={() => removeSubject(idx)}
                            variant="outline"
                            className="border-red-800 text-red-400"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addSubject}
                    variant="outline"
                    className="mt-3 border-purple-600 text-purple-400 hover:bg-purple-600/10"
                  >
                    + Add Subject
                  </Button>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Interests (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g., Machine Learning, Web Development, Open Source"
                    value={interests}
                    onChange={e => setInterests(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Help AI suggest relevant projects and skills
                  </p>
                </div>

                {/* Calendar Events */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Academic Calendar Events (optional)
                  </label>
                  <Textarea
                    placeholder="e.g.,&#10;Mid Exams: March 15&#10;End Exams: May 20&#10;Holidays: Jan 26"
                    value={calendarEvents}
                    onChange={e => setCalendarEvents(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white text-sm"
                    rows={3}
                  />
                </div>

                {/* Timetable PDF Upload */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    University Timetable PDF (optional)
                  </label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setTimetableFile(e.target.files?.[0] || null)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We only extract text locally and send it for analysis. Remove file to revert to text-only mode.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Generate My Semester Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-800/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Semester</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {analysisResult?.data.semesterNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Subjects</p>
                    <p className="text-2xl font-bold text-indigo-400">
                      {analysisResult?.data.subjectsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Weekly Hours</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {analysisResult?.data.weeklyAvailableHours}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="bg-neutral-900 border border-neutral-800">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI-Powered Semester Analysis
                </h2>
              </CardHeader>
              <CardContent>
                {(() => {
                  const sections = parseAIAnalysis(analysisResult?.data.aiAnalysis || '');
                  
                  return (
                    <div className="space-y-8">
                      {/* Semester Timeline Summary */}
                      {sections['Semester Timeline Summary'] && (
                        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-800/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-xl font-bold text-white">Semester Timeline Summary</h3>
                          </div>
                          <div className="space-y-2 text-gray-300">
                            {sections['Semester Timeline Summary'].map((line, idx) => (
                              <p key={idx} className="leading-relaxed">{line}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Holiday Windows */}
                      {sections['Holiday Windows (Classified)'] && (
                        <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-800/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Sun className="w-6 h-6 text-amber-400" />
                            <h3 className="text-xl font-bold text-white">Holiday Windows & Project Opportunities</h3>
                          </div>
                          <div className="grid gap-4">
                            {sections['Holiday Windows (Classified)'].map((line, idx) => {
                              if (line.trim().startsWith('-') && !line.includes('Project idea') && !line.includes('Expected outcomes')) {
                                // Main holiday window
                                const match = line.match(/Window \d+|Mini|Intermediate|Flagship/i);
                                const type = match ? match[0] : '';
                                const color = type.includes('Flagship') || type.includes('long') ? 'emerald' :
                                             type.includes('Intermediate') || type.includes('medium') ? 'blue' : 'purple';
                                
                                return (
                                  <div key={idx} className={`bg-${color}-900/20 border border-${color}-800/40 rounded-lg p-4`}>
                                    <div className="flex items-start gap-3">
                                      <Badge className={`bg-${color}-600 mt-1`}>{type}</Badge>
                                      <p className="text-gray-200 flex-1">{line.replace(/^-\s*/, '')}</p>
                                    </div>
                                  </div>
                                );
                              } else if (line.includes('Project idea') || line.includes('Expected outcomes')) {
                                return (
                                  <div key={idx} className="ml-8 text-gray-400 text-sm">
                                    {line.replace(/^\s*-\s*/, '• ')}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Workload Analysis */}
                      {sections['Workload Analysis'] && (
                        <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-800/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-red-400" />
                            <h3 className="text-xl font-bold text-white">Workload Analysis</h3>
                          </div>
                          <div className="space-y-2 text-gray-300">
                            {sections['Workload Analysis'].map((line, idx) => (
                              <p key={idx} className="leading-relaxed">{line.replace(/^-\s*/, '• ')}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weekly Study Plan */}
                      {sections['Weekly Study Plan (16 weeks)'] && (
                        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-800/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-indigo-400" />
                            <h3 className="text-xl font-bold text-white">16-Week Study Roadmap</h3>
                          </div>
                          <div className="space-y-3">
                            {sections['Weekly Study Plan (16 weeks)'].map((line, idx) => (
                              <div key={idx} className="bg-neutral-800/50 rounded-lg p-3 border-l-4 border-indigo-500">
                                <p className="text-gray-300">{line.replace(/^-\s*/, '')}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills Section */}
                      {sections['Skills (Primary + Supporting)'] && (
                        <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-800/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Award className="w-6 h-6 text-green-400" />
                            <h3 className="text-xl font-bold text-white">Key Skills to Master</h3>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {sections['Skills (Primary + Supporting)'].map((line, idx) => {
                              const isPrimary = line.toLowerCase().includes('primary');
                              const isSupporting = line.toLowerCase().includes('supporting');
                              
                              if (isPrimary || isSupporting) {
                                return (
                                  <div key={idx} className={`${isPrimary ? 'bg-green-900/30' : 'bg-teal-900/30'} rounded-lg p-4 border ${isPrimary ? 'border-green-700/50' : 'border-teal-700/50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={isPrimary ? 'bg-green-600' : 'bg-teal-600'}>
                                        {isPrimary ? 'Primary' : 'Supporting'}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-200 text-sm">{line.replace(/^-\s*(Primary:|Supporting:)\s*/i, '')}</p>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Trends To Watch */}
                      {sections['Trends To Watch'] && (
                        <div className="bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 border border-violet-800/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-6 h-6 text-violet-400" />
                            <h3 className="text-xl font-bold text-white">Industry Trends & Relevance</h3>
                          </div>
                          <div className="space-y-3">
                            {sections['Trends To Watch'].map((line, idx) => (
                              <div key={idx} className="bg-violet-900/20 rounded-lg p-4 border-l-4 border-violet-500">
                                <p className="text-gray-300">{line.replace(/^-\s*/, '🔥 ')}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes / Balance & Recovery */}
                      {sections['Notes (Balance & Recovery)'] && (
                        <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-800/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-xl font-bold text-white">Balance & Recovery Tips</h3>
                          </div>
                          <div className="space-y-2 text-gray-300">
                            {sections['Notes (Balance & Recovery)'].map((line, idx) => (
                              <p key={idx} className="leading-relaxed">{line.replace(/^-\s*/, '💡 ')}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback: If no sections parsed, show raw */}
                      {Object.keys(sections).length === 0 && (
                        <div className="bg-neutral-800 p-6 rounded-lg whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                          {analysisResult?.data.aiAnalysis}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={handleSavePlan}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save className="w-4 h-4" />
                Save Plan
              </Button>
              <Button
                onClick={handleDownloadPlan}
                className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={() => {
                  alert('Share feature coming soon! Share with your mentor to get feedback.');
                }}
                className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                <Share2 className="w-4 h-4" />
                Share with Mentor
              </Button>
            </div>

            {/* Quick Tips */}
            <Card className="bg-neutral-900 border border-neutral-800">
              <CardHeader>
                <h3 className="text-lg font-bold text-white">💡 How to Use This Plan</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <Badge className="bg-purple-600">1</Badge>
                  <p className="text-gray-300">Review the workload analysis to understand the semester difficulty</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-purple-600">2</Badge>
                  <p className="text-gray-300">Follow the weekly academic plan as a guideline for study intensity</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-purple-600">3</Badge>
                  <p className="text-gray-300">Save your plan and sync it with your mentor for personalized feedback</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-purple-600">4</Badge>
                  <p className="text-gray-300">Use project suggestions to build portfolio alongside academics</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-purple-600">5</Badge>
                  <p className="text-gray-300">Track your progress with study logs and adjust as needed</p>
                </div>
              </CardContent>
            </Card>

            {/* Back to Form */}
            <Button
              onClick={() => {
                setStep('form');
                setError(null);
              }}
              variant="outline"
              className="w-full border-neutral-700 text-gray-400 hover:text-gray-300"
            >
              ← Plan Another Semester
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
