import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, TrendingDown, AlertTriangle, CheckCircle, Clock, Activity, Brain } from 'lucide-react';

interface StudentPattern {
  studentId: string;
  studentName: string;
  preferredTime: string;
  sessionDuration: number;
  focusSubjects: string[];
  studyDays: string[];
  breaksPreference: string;
  environmentPreference: string;
  goals: string;
  consistency: number;
  lastActivity: string;
  recentLogsCount: number;
}

interface InterventionAction {
  id: string;
  studentId: string;
  actionType: 'nudge' | 'coaching' | 'schedule_change' | 'topic_focus';
  content: string;
  recommended: boolean;
  createdAt: string;
}

export default function StudentStudyPatternAnalyzer() {
  const { userProfile } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentPatterns, setStudentPatterns] = useState<StudentPattern[]>([]);
  const [interventionHistory, setInterventionHistory] = useState<InterventionAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionText, setActionText] = useState('');
  const [actionType, setActionType] = useState<'nudge' | 'coaching' | 'schedule_change' | 'topic_focus'>('nudge');

  useEffect(() => {
    if (userProfile?.id) {
      fetchStudentPatterns();
    }
  }, [userProfile]);

  const fetchStudentPatterns = async () => {
    if (!userProfile?.id) return;
    setLoading(true);

    try {
      const { data: connections } = await supabase
        .from('mentorship_connections')
        .select('mentee_id, mentee:mentee_id (id, full_name)')
        .eq('mentor_id', userProfile.id)
        .eq('status', 'active');

      if (!connections || connections.length === 0) {
        setStudentPatterns([]);
        return;
      }

      const patterns: StudentPattern[] = [];

      for (const conn of connections) {
        const { data: pattern } = await supabase
          .from('study_patterns')
          .select('*')
          .eq('user_id', conn.mentee_id)
          .maybeSingle();

        const { data: logs } = await supabase
          .from('study_logs')
          .select('date, created_at, duration_minutes')
          .eq('user_id', conn.mentee_id)
          .order('created_at', { ascending: false })
          .limit(30);

        let consistency = 0;
        if (logs && logs.length > 0) {
          consistency = Math.min(100, (logs.length / 30) * 100);
        }

        const lastLog = logs && logs.length > 0 ? logs[0].date || logs[0].created_at : null;
        const menteeData = Array.isArray(conn.mentee) ? conn.mentee[0] : conn.mentee;

        patterns.push({
          studentId: conn.mentee_id,
          studentName: menteeData?.full_name || 'Unknown',
          preferredTime: pattern?.preferred_time_of_day || 'Not set',
          sessionDuration: pattern?.session_duration || 60,
          focusSubjects: pattern?.focus_subjects || [],
          studyDays: pattern?.study_days || [],
          breaksPreference: pattern?.breaks_preference || 'Not set',
          environmentPreference: pattern?.environment_preference || 'Not set',
          goals: pattern?.goals || 'No goals set',
          consistency,
          lastActivity: lastLog || 'No activity',
          recentLogsCount: logs?.length || 0
        });
      }

      setStudentPatterns(patterns);
      if (patterns.length > 0) {
        setSelectedStudent(patterns[0].studentId);
        fetchInterventionHistory(patterns[0].studentId);
      }
    } catch (error) {
      console.error('Error fetching student patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterventionHistory = async (studentId: string) => {
    try {
      const { data: notes } = await supabase
        .from('mentor_student_notes')
        .select('*')
        .eq('mentee_id', studentId)
        .eq('mentor_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const actions: InterventionAction[] = notes?.map((note: any) => {
        const baseType = note.note_type === 'action_item' ? 'nudge' : note.note_type === 'intervention' ? 'coaching' : 'nudge';
        return {
          id: note.id,
          studentId,
          actionType: baseType as 'nudge' | 'coaching' | 'schedule_change' | 'topic_focus',
          content: note.content,
          recommended: note.note_type === 'action_item',
          createdAt: note.created_at
        };
      }) || [];

      setInterventionHistory(actions);
    } catch (error) {
      console.error('Error fetching intervention history:', error);
    }
  };

  const handleAddIntervention = async () => {
    if (!selectedStudent || !userProfile?.id || !actionText.trim()) return;

    try {
      await supabase
        .from('mentor_student_notes')
        .insert([{
          mentor_id: userProfile.id,
          mentee_id: selectedStudent,
          note_type: actionType === 'nudge' ? 'action_item' : 'observation',
          content: actionText,
          tags: [actionType]
        }]);

      setActionText('');
      fetchInterventionHistory(selectedStudent);
      alert('✅ Intervention recorded successfully!');
    } catch (error) {
      console.error('Error adding intervention:', error);
      alert('Failed to record intervention');
    }
  };

  const selectedPattern = studentPatterns.find(p => p.studentId === selectedStudent);

  const getConsistencyColor = (consistency: number) => {
    if (consistency >= 80) return 'text-emerald-400';
    if (consistency >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getConsistencyBg = (consistency: number) => {
    if (consistency >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (consistency >= 50) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Student Study Pattern Analysis
          </CardTitle>
          <CardDescription>Analyze study patterns and intervention history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentPatterns.length > 0 ? (
              studentPatterns.map((student) => (
                <div
                  key={student.studentId}
                  onClick={() => {
                    setSelectedStudent(student.studentId);
                    fetchInterventionHistory(student.studentId);
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedStudent === student.studentId
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white">{student.studentName}</h3>
                    <Badge className={`${getConsistencyBg(student.consistency)}`}>
                      {Math.round(student.consistency)}%
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Time: {student.preferredTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span>{student.recentLogsCount} logs (30 days)</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <div className="text-gray-400 space-y-2">
                  {loading ? (
                    <p>Loading patterns...</p>
                  ) : (
                    <>
                      <AlertTriangle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                      <p className="font-semibold text-white">No active mentees yet</p>
                      <p className="text-sm">Accept mentorship requests in the Requests tab to analyze study patterns</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPattern && (
        <>
          {selectedPattern.recentLogsCount === 0 ? (
            <Card className="bg-neutral-900 border border-amber-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-5 h-5" />
                  No Study Data Yet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-300">
                    {selectedPattern.studentName} hasn't recorded any study logs yet. Once they start logging their study sessions, you'll be able to see:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                    <li>Study consistency and patterns</li>
                    <li>Preferred study times and environments</li>
                    <li>Focus subjects and session durations</li>
                    <li>Days of high and low activity</li>
                  </ul>
                  <p className="text-sm text-gray-400 mt-4">
                    Share the study tracking feature with them to get started!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-neutral-900 border border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  {selectedPattern.studentName}'s Study Pattern
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                    <p className="text-sm text-gray-400 mb-1">Preferred Study Time</p>
                    <p className="text-white font-semibold capitalize">{selectedPattern.preferredTime}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                    <p className="text-sm text-gray-400 mb-1">Session Duration</p>
                    <p className="text-white font-semibold">{selectedPattern.sessionDuration} minutes</p>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                    <p className="text-sm text-gray-400 mb-1">Break Style</p>
                    <p className="text-white font-semibold capitalize">{selectedPattern.breaksPreference.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                    <p className="text-sm text-gray-400 mb-1">Study Environment</p>
                    <p className="text-white font-semibold capitalize">{selectedPattern.environmentPreference}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${getConsistencyBg(selectedPattern.consistency)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${getConsistencyColor(selectedPattern.consistency)}`}>
                      Consistency: {Math.round(selectedPattern.consistency)}%
                    </p>
                    {selectedPattern.consistency >= 80 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : selectedPattern.consistency >= 50 ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedPattern.consistency >= 80 ? 'bg-emerald-500' : selectedPattern.consistency >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedPattern.consistency}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                  <p className="font-semibold text-white">Record Intervention</p>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 text-sm"
                  >
                    <option value="nudge">Nudge (Quick reminder)</option>
                    <option value="coaching">Coaching (Deep guidance)</option>
                    <option value="schedule_change">Schedule Change</option>
                    <option value="topic_focus">Topic Focus</option>
                  </select>
                  <textarea
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder="Describe the intervention..."
                    className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 text-sm"
                    rows={3}
                  />
                  <Button onClick={handleAddIntervention} className="w-full bg-green-600 hover:bg-green-700">
                    Record Intervention
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-300">Recent Actions</p>
                  {interventionHistory.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {interventionHistory.map((action) => (
                        <div key={action.id} className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                          <div className="flex items-start justify-between mb-1">
                            <Badge
                              className={`${
                                action.actionType === 'nudge'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : action.actionType === 'coaching'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : action.actionType === 'schedule_change'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-green-500/20 text-green-300'
                              } border-0 text-xs`}
                            >
                              {action.actionType.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">{new Date(action.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-300">{action.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No interventions recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
