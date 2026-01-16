import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, Clock, Heart, MessageCircle, Moon, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  created_at: string;
  read_status: boolean;
}

interface Intervention {
  id: string;
  type: 'note' | 'plan';
  title: string;
  description?: string;
  created_at: string;
  mentor_name?: string;
}

interface PatternInsight {
  label: string;
  message: string;
  tone: 'positive' | 'watch' | 'risk';
}

interface HealthStatus {
  status: 'stable' | 'attention' | 'critical';
  streak: number;
  recentLogs: number;
  message: string;
}

interface MentorInfo {
  name: string;
  availability?: string;
  capacity?: number;
}

export function StudentInsightsPanel() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ status: 'stable', streak: 0, recentLogs: 0, message: 'Loading...' });
  const [mentorInfo, setMentorInfo] = useState<MentorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;
    fetchAllData();
  }, [userProfile?.id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMessages(),
        fetchInterventions(),
        analyzeOwnPatterns(),
        calculateHealthStatus(),
        fetchMentorInfo()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read_status,
          sender:sender_id (full_name)
        `)
        .eq('receiver_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMessages((data || []).map((m: any) => ({
        id: m.id,
        content: m.content,
        sender_name: m.sender?.full_name || 'Mentor',
        created_at: m.created_at,
        read_status: m.read_status
      })));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchInterventions = async () => {
    try {
      const [notesRes, plansRes] = await Promise.all([
        supabase
          .from('mentor_student_notes')
          .select(`
            id,
            content,
            note_type,
            created_at,
            mentor:mentor_id (full_name)
          `)
          .eq('mentee_id', userProfile?.id)
          .order('created_at', { ascending: false })
          .limit(15),
        supabase
          .from('catch_up_plans')
          .select('id, title, status, deadline, created_at')
          .eq('user_id', userProfile?.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const items: Intervention[] = [];
      notesRes.data?.forEach((n: any) => {
        items.push({
          id: n.id,
          type: 'note',
          title: n.note_type ? `${n.note_type} observation` : 'Mentor Note',
          description: n.content,
          created_at: n.created_at,
          mentor_name: n.mentor?.full_name
        });
      });

      plansRes.data?.forEach((p: any) => {
        items.push({
          id: p.id,
          type: 'plan',
          title: p.title,
          description: p.deadline ? `Due ${new Date(p.deadline).toLocaleDateString()}` : 'Catch-up plan',
          created_at: p.created_at
        });
      });

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setInterventions(items);
    } catch (err) {
      console.error('Error fetching interventions:', err);
    }
  };

  const analyzeOwnPatterns = async () => {
    try {
      const { data: logs } = await supabase
        .from('study_logs')
        .select('created_at, duration_minutes')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(60);

      if (!logs || logs.length === 0) {
        setPatterns([{
          label: 'Getting Started',
          message: 'No study patterns yet. Start logging your sessions to get personalized insights.',
          tone: 'watch'
        }]);
        return;
      }

      const lateNight = logs.filter((l: any) => {
        const h = new Date(l.created_at).getHours();
        return h >= 22 || h <= 5;
      }).length;

      const durations = logs.map((l: any) => l.duration_minutes || 0);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / Math.max(1, durations.length);

      const dayBuckets: Record<string, number> = {};
      logs.forEach((l: any) => {
        const day = new Date(l.created_at).getDay();
        dayBuckets[day] = (dayBuckets[day] || 0) + 1;
      });
      const spread = Object.values(dayBuckets);
      const maxDay = Math.max(...spread, 0);
      const minDay = Math.min(...spread, 0);
      const inconsistent = maxDay - minDay >= 3;

      const insights: PatternInsight[] = [];

      if (lateNight >= 5) {
        insights.push({
          label: 'Late-night sessions',
          message: 'You study late often. Try shifting to earlier hours for better retention and rest.',
          tone: 'risk'
        });
      }

      if (inconsistent) {
        insights.push({
          label: 'Variable schedule',
          message: 'Your study days vary. Building a consistent 3-day weekly rhythm can improve results.',
          tone: 'watch'
        });
      }

      if (avgDuration >= 90) {
        insights.push({
          label: 'Long sessions',
          message: 'Average session is quite long. Consider 45-60 minute blocks with breaks to maintain focus.',
          tone: 'watch'
        });
      }

      if (insights.length === 0) {
        insights.push({
          label: 'Healthy habits',
          message: 'Your study pattern looks balanced. Keep up the consistent effort!',
          tone: 'positive'
        });
      }

      setPatterns(insights);
    } catch (err) {
      console.error('Error analyzing patterns:', err);
    }
  };

  const calculateHealthStatus = async () => {
    try {
      const { data: logs } = await supabase
        .from('study_logs')
        .select('created_at')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(7);

      const { data: streak } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userProfile?.id)
        .single();

      const recentLogsCount = logs?.length || 0;
      const currentStreak = streak?.current_streak || 0;
      const lastLogDate = logs?.[0]?.created_at ? new Date(logs[0].created_at) : null;
      const daysSinceLog = lastLogDate ? (Date.now() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24) : 999;

      let status: 'stable' | 'attention' | 'critical' = 'stable';
      let message = 'You are on track. Keep up the steady progress.';

      if (recentLogsCount === 0 || daysSinceLog > 4) {
        status = 'critical';
        message = 'No recent activity. Your mentor may reach out to help you restart.';
      } else if (recentLogsCount < 3 || currentStreak < 3) {
        status = 'attention';
        message = 'Light activity detected. Consider logging more sessions to build momentum.';
      }

      setHealthStatus({
        status,
        streak: currentStreak,
        recentLogs: recentLogsCount,
        message
      });
    } catch (err) {
      console.error('Error calculating health status:', err);
    }
  };

  const fetchMentorInfo = async () => {
    try {
      const { data } = await supabase
        .from('mentorship_connections')
        .select(`
          mentor:mentor_id (id, full_name)
        `)
        .eq('mentee_id', userProfile?.id)
        .eq('status', 'active')
        .single();

      if (data?.mentor && !Array.isArray(data.mentor)) {
        const mentorId = data.mentor.id;
        const saved = localStorage.getItem(`mentor_availability_${mentorId}`);
        const availability = saved ? JSON.parse(saved) : null;

        setMentorInfo({
          name: data.mentor.full_name,
          availability: availability?.window,
          capacity: availability?.capacity
        });
      }
    } catch (err) {
      console.error('Error fetching mentor info:', err);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('id', messageId);

      setMessages(messages.map(m =>
        m.id === messageId ? { ...m, read_status: true } : m
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const statusColors = {
    stable: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300' },
    attention: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300' },
    critical: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300' }
  };

  const colors = statusColors[healthStatus.status];

  return (
    <div className="space-y-6">
      {/* Health Status Overview */}
      <Card className={cn('border', colors.bg, colors.border)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={cn('w-5 h-5', colors.text)} />
                <h3 className="font-semibold text-white">Your Academic Health</h3>
              </div>
              <p className="text-sm text-gray-300 mb-3">{healthStatus.message}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>🔥 Streak: {healthStatus.streak} days</span>
                <span>📚 Recent logs: {healthStatus.recentLogs}</span>
              </div>
            </div>
            <Badge className={cn('text-xs', colors.bg, colors.border, colors.text)}>
              {healthStatus.status === 'stable' ? 'On Track' : healthStatus.status === 'attention' ? 'Needs Focus' : 'Action Needed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList className="bg-neutral-900 border border-neutral-800">
          <TabsTrigger value="messages">Mentor Messages</TabsTrigger>
          <TabsTrigger value="interventions">Intervention History</TabsTrigger>
          <TabsTrigger value="patterns">My Study Patterns</TabsTrigger>
          {mentorInfo && <TabsTrigger value="mentor">Mentor Info</TabsTrigger>}
        </TabsList>

        <TabsContent value="messages">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-300" />
                Messages from Your Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'p-4 rounded-lg border transition',
                          msg.read_status
                            ? 'bg-neutral-800 border-neutral-700'
                            : 'bg-purple-500/10 border-purple-500/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-300" />
                            <span className="text-sm font-semibold text-white">{msg.sender_name}</span>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-200 mb-2">{msg.content}</p>
                        {!msg.read_status && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-300 hover:bg-purple-500/10 h-7 text-xs"
                            onClick={() => markMessageAsRead(msg.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-300" />
                Your Intervention History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                {interventions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No interventions recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {interventions.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              'text-xs',
                              item.type === 'note'
                                ? 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                                : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                            )}>
                              {item.type === 'note' ? 'Note' : 'Plan'}
                            </Badge>
                            {item.mentor_name && (
                              <span className="text-xs text-gray-400">by {item.mentor_name}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                        {item.description && <p className="text-xs text-gray-300">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-300" />
                Your Study Pattern Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patterns.map((insight) => (
                <div
                  key={insight.label}
                  className={cn(
                    'p-4 rounded-lg border',
                    insight.tone === 'positive' && 'bg-emerald-500/10 border-emerald-500/30',
                    insight.tone === 'watch' && 'bg-amber-500/10 border-amber-500/30',
                    insight.tone === 'risk' && 'bg-red-500/10 border-red-500/30'
                  )}
                >
                  <p className="text-sm font-semibold text-white mb-1">{insight.label}</p>
                  <p className="text-xs text-gray-300">{insight.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {mentorInfo && (
          <TabsContent value="mentor">
            <Card className="bg-neutral-900 border border-neutral-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-300" />
                  Your Mentor's Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-300" />
                    <span className="font-semibold text-white">{mentorInfo.name}</span>
                  </div>
                  {mentorInfo.availability && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Preferred response window:</span>
                        <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                          {mentorInfo.availability}
                        </Badge>
                      </div>
                      {mentorInfo.capacity && (
                        <p className="text-xs text-gray-400 mt-2">
                          Managing {mentorInfo.capacity} students weekly. Responses typically within 24-48 hours.
                        </p>
                      )}
                    </div>
                  )}
                  {!mentorInfo.availability && (
                    <p className="text-sm text-gray-400">Availability information not set</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
