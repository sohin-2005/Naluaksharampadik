import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BookOpen, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'study_log' | 'note' | 'streak';
  title: string;
  description?: string;
  duration?: number;
  icon: string;
}

interface Student {
  id: string;
  name: string;
  lastActivityDate: string;
}

export default function StudentTimelineView() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'mentor') {
      fetchMentees();
    }
  }, [userProfile]);

  const fetchMentees = async () => {
    try {
      const { data: connections, error } = await supabase
        .from('mentorship_connections')
        .select(`
          mentee_id,
          mentee:mentee_id (id, full_name)
        `)
        .eq('mentor_id', userProfile?.id)
        .eq('status', 'active');

      if (error) throw error;

      // Fetch last activity for each mentee
      const studentList = await Promise.all(
        (connections || []).map(async (c: any) => {
          const { data: lastLog } = await supabase
            .from('study_logs')
            .select('created_at')
            .eq('user_id', c.mentee_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: c.mentee_id,
            name: c.mentee?.full_name,
            lastActivityDate: lastLog?.created_at || 'Never'
          };
        })
      );

      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const fetchTimeline = async (studentId: string) => {
    setIsLoading(true);
    try {
      // Fetch study logs
      const { data: logs, error: logsError } = await supabase
        .from('study_logs')
        .select('id, user_id, topic, notes, duration_minutes, date, created_at')
        .eq('user_id', studentId)
        .order('date', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Error fetching study logs:', logsError);
        // Continue with empty logs instead of throwing
      }

      // Fetch mentor notes
      const { data: notes, error: notesError } = await supabase
        .from('mentor_student_notes')
        .select('*')
        .eq('mentee_id', studentId)
        .eq('mentor_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Fetch streak data
      const { data: streak, error: streakError } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', studentId)
        .single();

      if (streakError) throw streakError;

      // Build timeline
      const events: TimelineEvent[] = [];

      // Add study logs
      logs?.forEach((log: any) => {
        events.push({
          id: log.id,
          date: log.date || log.created_at,
          type: 'study_log',
          title: `${log.topic || 'Study Session'}`,
          description: log.notes || `Duration: ${log.duration_minutes || 0} minutes`,
          duration: log.duration_minutes,
          icon: '📚'
        });
      });

      // Add mentor notes
      notes?.forEach((note: any) => {
        events.push({
          id: note.id,
          date: note.created_at,
          type: 'note',
          title: 'Mentor Note',
          description: note.observation_notes,
          icon: '✏️'
        });
      });

      // Add current streak marker
      if (streak?.current_streak) {
        events.unshift({
          id: 'streak',
          date: new Date().toISOString(),
          type: 'streak',
          title: `🔥 ${streak.current_streak}-Day Streak`,
          description: `Longest streak: ${streak.longest_streak} days`,
          icon: '🏆'
        });
      }

      // Sort by date
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Detect gaps
      const withGaps = detectGaps(events);
      setTimeline(withGaps);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectGaps = (events: TimelineEvent[]): TimelineEvent[] => {
    const result: TimelineEvent[] = [];
    let lastDate: Date | null = null;

    events.forEach((event) => {
      const currentDate = new Date(event.date);

      if (lastDate && (lastDate.getTime() - currentDate.getTime()) > (3 * 24 * 60 * 60 * 1000)) {
        // Gap of more than 3 days
        result.push({
          id: `gap-${event.id}`,
          date: event.date,
          type: 'study_log',
          title: '⚠️ Inactivity Gap',
          description: `No activity for ${Math.ceil((lastDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000))} days`,
          icon: '⚠️'
        });
      }

      result.push(event);
      lastDate = currentDate;
    });

    return result;
  };

  const handleStudentSelect = async (studentId: string) => {
    setSelectedStudent(studentId);
    await fetchTimeline(studentId);
  };

  const selectedStudentInfo = students.find(s => s.id === selectedStudent);
  const daysSinceLastActivity = selectedStudent ? 
    Math.floor((new Date().getTime() - new Date(selectedStudentInfo?.lastActivityDate || new Date()).getTime()) / (24 * 60 * 60 * 1000)) : 0;

  const hasGaps = timeline.some(e => e.title.includes('Inactivity'));

  return (
    <Card className="bg-neutral-900 border border-neutral-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Student Timeline View
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-sm text-indigo-200">
            Track student activity chronologically, including study logs, mentor notes, and consistency gaps
          </p>
        </div>

        {/* Student Selector */}
        {students.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white"
            >
              <option value="">Choose a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Student Status */}
        {selectedStudentInfo && (
          <div className={`p-3 rounded-lg border ${
            daysSinceLastActivity > 3
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-green-500/10 border-green-500/20'
          }`}>
            <p className={`text-sm ${
              daysSinceLastActivity > 3 ? 'text-red-200' : 'text-green-200'
            }`}>
              {daysSinceLastActivity > 3 ? '⚠️ No activity for' : '✓ Last activity'} {daysSinceLastActivity} {daysSinceLastActivity === 1 ? 'day' : 'days'} ago
            </p>
          </div>
        )}

        {/* Gap Warning */}
        {hasGaps && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-200">
                <strong>Consistency Gaps Detected</strong>
              </p>
              <p className="text-xs text-amber-300 mt-1">
                Multiple inactivity gaps detected. Consider reaching out with encouragement or assistance.
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {selectedStudent && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-300">Activity Timeline</h4>
            {isLoading ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">Loading timeline...</p>
              </div>
            ) : timeline.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative">
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-3 top-8 h-6 w-0.5 bg-neutral-700" />
                    )}

                    {/* Event */}
                    <div className="flex gap-3 p-3 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition">
                      {/* Icon */}
                      <div className="text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        {event.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h5 className="font-semibold text-white text-sm truncate">
                            {event.title}
                          </h5>
                          <Badge className={`text-xs ${
                            event.type === 'study_log'
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500/30'
                              : event.type === 'note'
                              ? 'bg-purple-600/30 text-purple-300 border-purple-500/30'
                              : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {event.type === 'study_log' ? '📚 Log'
                              : event.type === 'note' ? '✏️ Note'
                              : '🔥 Streak'}
                          </Badge>
                        </div>

                        {event.description && (
                          <p className="text-xs text-gray-400 mb-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {event.duration && (
                          <p className="text-xs text-gray-500">
                            ⏱️ {event.duration} min
                          </p>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">No activity recorded yet</p>
              </div>
            )}
          </div>
        )}

        {!selectedStudent && students.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No mentees connected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
