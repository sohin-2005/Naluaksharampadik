import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface StudentStatus {
  id: string;
  name: string;
  status: 'stable' | 'attention' | 'critical';
  lastUpdate: string;
  currentStreak: number;
  recentLogs: number;
}

const statusColors = {
  stable: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  attention: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' },
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300', dot: 'bg-red-400' }
};

export default function AcademicRadarPanel() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<StudentStatus[]>([]);

  useEffect(() => {
    fetchStudentStatus();
  }, [userProfile]);

  const fetchStudentStatus = async () => {
    try {
      // Get mentor's active connections
      const { data: connections, error: connError } = await supabase
        .from('mentorship_connections')
        .select(`
          mentee_id,
          mentee:mentee_id (id, full_name)
        `)
        .eq('mentor_id', userProfile?.id)
        .eq('status', 'active');

      if (connError) throw connError;

      if (!connections || connections.length === 0) {
        setStudents([]);
        return;
      }

      // Get study logs for each student to determine status
      const studentPromises = connections.map(async (conn: any) => {
        const { data: logs, error: logsError } = await supabase
          .from('study_logs')
          .select('id, date, created_at, duration_minutes')
          .eq('user_id', conn.mentee_id)
          .order('date', { ascending: false })
          .limit(7);

        if (logsError) {
          console.error(`Error fetching logs for ${conn.mentee_id}:`, logsError);
        }

        const { data: streak, error: streakError } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', conn.mentee_id)
          .single();

        if (streakError && streakError.code !== 'PGRST116') {
          console.error(`Error fetching streak for ${conn.mentee_id}:`, streakError);
        }

        const recentLogsCount = logs?.length || 0;
        const lastLogDate = logs && logs.length > 0 ? logs[0].date || logs[0].created_at : null;
        let status: 'stable' | 'attention' | 'critical' = 'stable';

        if (recentLogsCount === 0) {
          status = 'critical';
        } else if (recentLogsCount < 3) {
          status = 'attention';
        }

        return {
          id: conn.mentee_id,
          name: conn.mentee?.full_name || 'Unknown',
          status,
          lastUpdate: lastLogDate || 'N/A',
          currentStreak: streak?.current_streak || 0,
          recentLogs: recentLogsCount
        };
      });

      const studentData = await Promise.all(studentPromises);
      setStudents(studentData);
    } catch (error) {
      console.error('Error fetching student status:', error);
    }
  };

  const stableCount = students.filter(s => s.status === 'stable').length;
  const attentionCount = students.filter(s => s.status === 'attention').length;
  const criticalCount = students.filter(s => s.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900 border border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase">Stable</p>
                <p className="text-3xl font-bold text-emerald-400">{stableCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase">Needs Attention</p>
                <p className="text-3xl font-bold text-amber-400">{attentionCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase">Critical</p>
                <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-lg shadow-red-400/50"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Radar List */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Student Status Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.length > 0 ? (
              students.map((student) => {
                const colors = statusColors[student.status];
                return (
                  <div
                    key={student.id}
                    className={`p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all hover:shadow-lg hover:shadow-purple-500/10`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${colors.dot} shadow-lg`}></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{student.name}</h4>
                          <p className="text-xs text-gray-400">
                            {student.recentLogs === 0 ? 'No recent activity' : `${student.recentLogs} logs this week`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Streak</p>
                          <p className={`text-lg font-bold ${colors.text}`}>{student.currentStreak}</p>
                        </div>
                        <Badge className={`${colors.text} ${colors.bg} border ${colors.border}`}>
                          {student.status === 'stable' ? 'On Track' : student.status === 'attention' ? 'Check In' : 'Action Needed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No active mentees yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
