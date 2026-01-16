import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, Clock, Heart, Moon, Repeat, Send, Sparkles, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface Mentee {
  id: string;
  name: string;
  department?: string;
}

interface AttentionItem {
  mentee: Mentee;
  reason: string;
  score: number;
  streak?: number;
  lastLog?: string;
  nextDeadline?: string | null;
}

interface HistoryItem {
  id: string;
  type: 'note' | 'plan';
  title: string;
  description?: string;
  created_at: string;
  tags?: string[];
  status?: string;
}

interface PatternInsight {
  label: string;
  message: string;
  tone: 'positive' | 'watch' | 'risk';
}

const nudgePresets = [
  'You are making steady progress. Take a short break and come back refreshed.',
  'Let us adjust the pace. Short focused sessions beat long tiring ones.',
  'I see a gap recently. Want a 10-minute sync to unblock you?',
  'Your streak dipped; totally fine. Let us plan two light sessions to restart.',
  'Great effort. Prioritize rest tonight and we will regroup tomorrow.'
];

const availabilityOptions = ['Morning (7-11)', 'Afternoon (12-4)', 'Evening (5-9)', 'Late Night (9-12)'];

export function MentorCommandCenter() {
  const { userProfile } = useAuth();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>('');
  const [attentionQueue, setAttentionQueue] = useState<AttentionItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [nudging, setNudging] = useState(false);
  const [customNudge, setCustomNudge] = useState('');
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([]);
  const [availability, setAvailability] = useState({ window: 'Evening (5-9)', capacity: 6 });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [insightStats, setInsightStats] = useState({ recoveries: 0, streakRestorations: 0, completedPlans: 0 });
  const [confidence, setConfidence] = useState({ label: 'Balanced', value: 0.62 });

  useEffect(() => {
    if (!userProfile?.id) return;
    fetchMentees();
    loadAvailability();
    loadInsightBoard();
  }, [userProfile?.id]);

  useEffect(() => {
    if (selectedMenteeId) {
      fetchHistory(selectedMenteeId);
      analyzePatterns(selectedMenteeId);
    }
  }, [selectedMenteeId]);

  const fetchMentees = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_connections')
        .select(`
          mentee_id,
          mentee:mentee_id (id, full_name, department)
        `)
        .eq('mentor_id', userProfile?.id)
        .eq('status', 'active');

      if (error) throw error;
      const list = (data || []).map((item: any) => ({
        id: item.mentee_id,
        name: item.mentee?.full_name || 'Student',
        department: item.mentee?.department
      }));
      setMentees(list);
      if (list.length > 0) {
        setSelectedMenteeId(list[0].id);
      }
      buildAttentionQueue(list);
    } catch (err) {
      console.error('Error loading mentees', err);
    }
  };

  const buildAttentionQueue = async (list: Mentee[]) => {
    try {
      const enriched = await Promise.all(
        list.map(async (mentee) => {
          const [{ data: log }] = await Promise.all([
            supabase
              .from('study_logs')
              .select('created_at, duration_minutes')
              .eq('user_id', mentee.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
              .throwOnError(),
          ]);

          const { data: streakData } = await supabase
            .from('user_streaks')
            .select('current_streak, longest_streak')
            .eq('user_id', mentee.id)
            .single();

          const { data: plans } = await supabase
            .from('catch_up_plans')
            .select('deadline, status')
            .eq('user_id', mentee.id)
            .neq('status', 'completed')
            .order('deadline', { ascending: true });

          const lastLogDate = log?.created_at ? new Date(log.created_at) : null;
          const daysSinceLog = lastLogDate ? (Date.now() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24) : 999;
          const upcomingDeadline = plans?.find((p: any) => p.deadline) || null;

          let score = 0;
          let reason = 'Steady pace';

          if (daysSinceLog > 4) {
            score += 3;
            reason = 'No recent study logs';
          } else if (daysSinceLog > 2) {
            score += 2;
            reason = 'Light activity this week';
          }

          if ((streakData?.current_streak || 0) < 3) {
            score += 2;
            reason = 'Streak dipped';
          }

          if (upcomingDeadline) {
            const daysLeft = Math.ceil((new Date(upcomingDeadline.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7) {
              score += 2;
              reason = 'Upcoming exam/plan due soon';
            }
          }

          return {
            mentee,
            reason,
            score,
            streak: streakData?.current_streak || 0,
            lastLog: lastLogDate ? lastLogDate.toISOString() : undefined,
            nextDeadline: upcomingDeadline?.deadline || null
          } as AttentionItem;
        })
      );

      const sorted = enriched.sort((a, b) => b.score - a.score);
      setAttentionQueue(sorted);
    } catch (err) {
      console.error('Error building attention queue', err);
    }
  };

  const fetchHistory = async (menteeId: string) => {
    try {
      const [notesRes, plansRes] = await Promise.all([
        supabase
          .from('mentor_student_notes')
          .select('id, content, note_type, tags, created_at')
          .eq('mentor_id', userProfile?.id)
          .eq('mentee_id', menteeId)
          .order('created_at', { ascending: false })
          .limit(15),
        supabase
          .from('catch_up_plans')
          .select('id, title, status, deadline, created_at')
          .eq('user_id', menteeId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const items: HistoryItem[] = [];
      notesRes.data?.forEach((n: any) => {
        items.push({
          id: n.id,
          type: 'note',
          title: n.note_type ? `${n.note_type} note` : 'Mentor Note',
          description: n.content,
          created_at: n.created_at,
          tags: n.tags || []
        });
      });

      plansRes.data?.forEach((p: any) => {
        items.push({
          id: p.id,
          type: 'plan',
          title: p.title,
          description: p.deadline ? `Due ${new Date(p.deadline).toLocaleDateString()}` : 'Catch-up plan',
          created_at: p.created_at,
          status: p.status
        });
      });

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setHistory(items);
    } catch (err) {
      console.error('Error loading history', err);
    }
  };

  const sendNudge = async (menteeId: string, content: string) => {
    if (!content.trim()) return;
    setNudging(true);
    try {
      await supabase.from('messages').insert({
        sender_id: userProfile?.id,
        receiver_id: menteeId,
        content,
        read_status: false
      });
      setCustomNudge('');
    } catch (err) {
      console.error('Error sending nudge', err);
    } finally {
      setNudging(false);
    }
  };

  const analyzePatterns = async (menteeId: string) => {
    try {
      const { data: logs } = await supabase
        .from('study_logs')
        .select('created_at, duration_minutes')
        .eq('user_id', menteeId)
        .order('created_at', { ascending: false })
        .limit(60);

      if (!logs || logs.length === 0) {
        setPatternInsights([{ label: 'No data yet', message: 'No study logs recorded. Encourage a light restart plan.', tone: 'watch' }]);
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
          label: 'Late-night overload',
          message: 'Frequent late-night sessions detected. Recommend lighter blocks before 10 PM to reduce burnout risk.',
          tone: 'risk'
        });
      }

      if (inconsistent) {
        insights.push({
          label: 'Inconsistent schedule',
          message: 'Study days vary a lot this month. Suggest a repeatable 3-day rhythm to rebuild consistency.',
          tone: 'watch'
        });
      }

      if (avgDuration >= 90) {
        insights.push({
          label: 'Session intensity',
          message: 'Average session length is high. Encourage 45–60 minute focus blocks with short breaks.',
          tone: 'watch'
        });
      }

      if (insights.length === 0) {
        insights.push({
          label: 'Healthy pace',
          message: 'Schedule looks balanced. Keep reinforcing steady habits and brief check-ins.',
          tone: 'positive'
        });
      }

      setPatternInsights(insights);
    } catch (err) {
      console.error('Error analyzing patterns', err);
    }
  };

  const loadAvailability = () => {
    if (!userProfile?.id) return;
    const saved = localStorage.getItem(`mentor_availability_${userProfile.id}`);
    if (saved) {
      setAvailability(JSON.parse(saved));
    }
  };

  const saveAvailability = async () => {
    if (!userProfile?.id) return;
    setSavingAvailability(true);
    try {
      localStorage.setItem(`mentor_availability_${userProfile.id}`, JSON.stringify(availability));
    } finally {
      setSavingAvailability(false);
    }
  };

  const loadInsightBoard = async () => {
    try {
      const [plansRes, streaksRes, pulseRes] = await Promise.all([
        supabase
          .from('catch_up_plans')
          .select('id')
          .eq('approved_by_mentor', userProfile?.id)
          .eq('status', 'completed'),
        supabase
          .from('user_streaks')
          .select('current_streak')
          .gt('current_streak', 3),
        supabase
          .from('mentor_pulse_checkins')
          .select('id')
          .eq('mentor_id', userProfile?.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const completedPlans = plansRes.data?.length || 0;
      const streakRestorations = streaksRes.data?.length || 0;
      const recoveries = completedPlans + Math.floor((streakRestorations || 0) / 2);
      setInsightStats({ recoveries, streakRestorations, completedPlans });

      const engagement = (pulseRes.data?.length || 1) / 10;
      const confidenceValue = Math.min(0.9, 0.4 + engagement + completedPlans * 0.05);
      const label = confidenceValue >= 0.8 ? 'High confidence' : confidenceValue >= 0.6 ? 'Balanced' : 'Calibrate';
      setConfidence({ label, value: confidenceValue });
    } catch (err) {
      console.error('Error loading insight board', err);
    }
  };

  const selectedMentee = useMemo(() => mentees.find((m) => m.id === selectedMenteeId), [mentees, selectedMenteeId]);

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900 border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-300" />
            Mentor Attention Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attentionQueue.length === 0 ? (
            <p className="text-sm text-gray-400">No students need intervention right now.</p>
          ) : (
            <div className="space-y-3">
              {attentionQueue.map((item) => (
                <div
                  key={item.mentee.id}
                  className="p-4 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-purple-500/40 transition cursor-pointer"
                  onClick={() => setSelectedMenteeId(item.mentee.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.mentee.name}</p>
                      <p className="text-xs text-gray-400">{item.reason}</p>
                    </div>
                    <Badge className="bg-amber-500/20 border-amber-500/30 text-amber-200 text-xs">Priority {item.score}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> Streak {item.streak ?? 0}</span>
                    {item.lastLog && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last log {new Date(item.lastLog).toLocaleDateString()}</span>}
                    {item.nextDeadline && <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-300" /> Due {new Date(item.nextDeadline).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="bg-neutral-900 border border-neutral-800">
          <TabsTrigger value="history">Intervention History</TabsTrigger>
          <TabsTrigger value="nudges">One-Click Nudges</TabsTrigger>
          <TabsTrigger value="patterns">Study Pattern Analyzer</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="insights">Insight Board</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-300" />
                Intervention History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {mentees.map((m) => (
                  <Button
                    key={m.id}
                    size="sm"
                    variant={m.id === selectedMenteeId ? 'default' : 'outline'}
                    className={cn('text-xs', m.id === selectedMenteeId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-neutral-800 text-gray-200 border-neutral-700')}
                    onClick={() => setSelectedMenteeId(m.id)}
                  >
                    {m.name}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-80 rounded-lg border border-neutral-800 bg-neutral-950/40 p-3">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-400">No interventions recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn('text-xs', item.type === 'note' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30')}>
                              {item.type === 'note' ? 'Note' : 'Plan'}
                            </Badge>
                            {item.status && (
                              <Badge className="text-xs bg-purple-500/20 text-purple-200 border-purple-400/30">{item.status}</Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                        {item.description && <p className="text-xs text-gray-300 mb-1">{item.description}</p>}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} className="text-[10px] bg-neutral-700 text-gray-200 border-neutral-600">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nudges">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-300" />
                One-Click Nudge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300">Send a supportive note without extra typing.</p>
              <div className="grid md:grid-cols-2 gap-3">
                {nudgePresets.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    className="justify-start text-left bg-neutral-800 text-gray-100 border-neutral-700 hover:border-rose-400/60"
                    onClick={() => sendNudge(selectedMenteeId, preset)}
                    disabled={nudging || !selectedMenteeId}
                  >
                    <Send className="w-4 h-4 mr-2 text-rose-300" />
                    {preset}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Optional: add a custom note"
                  value={customNudge}
                  onChange={(e) => setCustomNudge(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  rows={3}
                />
                <Button
                  onClick={() => sendNudge(selectedMenteeId, customNudge)}
                  disabled={nudging || !customNudge.trim() || !selectedMenteeId}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Send custom nudge
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-300" />
                Study Pattern Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patternInsights.map((insight) => (
                <div
                  key={insight.label}
                  className={cn(
                    'p-3 rounded-lg border',
                    insight.tone === 'positive' && 'bg-emerald-500/10 border-emerald-500/30',
                    insight.tone === 'watch' && 'bg-amber-500/10 border-amber-500/30',
                    insight.tone === 'risk' && 'bg-red-500/10 border-red-500/30'
                  )}
                >
                  <p className="text-sm font-semibold text-white">{insight.label}</p>
                  <p className="text-xs text-gray-300 mt-1">{insight.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-300" />
                Mentor Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Preferred response window</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availabilityOptions.map((opt) => (
                      <Button
                        key={opt}
                        variant={availability.window === opt ? 'default' : 'outline'}
                        className={cn('text-xs', availability.window === opt ? 'bg-purple-600 hover:bg-purple-700' : 'bg-neutral-800 text-gray-100 border-neutral-700')}
                        onClick={() => setAvailability({ ...availability, window: opt })}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">Weekly capacity (students)</p>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={availability.capacity}
                    onChange={(e) => setAvailability({ ...availability, capacity: Number(e.target.value) })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                  <p className="text-xs text-gray-400">Sets expectations for response time and load.</p>
                </div>
              </div>
              <Button onClick={saveAvailability} disabled={savingAvailability} className="bg-purple-600 hover:bg-purple-700">
                {savingAvailability ? 'Saving...' : 'Save availability'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="bg-neutral-900 border border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                Mentor Insight Board
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-neutral-800 border border-emerald-500/20">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Recoveries guided</p>
                    <p className="text-3xl font-bold text-emerald-300">{insightStats.recoveries}</p>
                    <p className="text-xs text-gray-500">Plans completed or streaks revived</p>
                  </CardContent>
                </Card>
                <Card className="bg-neutral-800 border border-blue-500/20">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Completed plans</p>
                    <p className="text-3xl font-bold text-blue-300">{insightStats.completedPlans}</p>
                    <p className="text-xs text-gray-500">Mentor-approved catch-up plans</p>
                  </CardContent>
                </Card>
                <Card className="bg-neutral-800 border border-purple-500/20">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400">Confidence (private)</p>
                    <p className="text-3xl font-bold text-purple-300">{Math.round(confidence.value * 100)}%</p>
                    <p className="text-xs text-gray-500">{confidence.label}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
