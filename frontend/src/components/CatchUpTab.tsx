
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Target, Loader2, Calendar, Clock, AlertCircle, Brain, Plus, X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { generateCatchUpPlan } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

interface CatchUpPlan {
  id: string;
  subject: string;
  examDate: string;
  daysRemaining: number;
  currentCompletion: number;
  generatedPlan: string;
  createdAt: string;
  status: 'active' | 'completed';
}

export function CatchUpTab() {
  const { userProfile } = useAuth();
  const [plans, setPlans] = useState<CatchUpPlan[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<CatchUpPlan | null>(null);

  // Form state
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [currentCompletion, setCurrentCompletion] = useState('0');
  const [dailyHours, setDailyHours] = useState('3');
  const [topics, setTopics] = useState<string[]>(['']);

  useEffect(() => {
    if (userProfile?.id) {
      fetchPlans();
    }
  }, [userProfile]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('catch_up_plans')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match our interface
      const transformed: CatchUpPlan[] = (data || []).map(plan => ({
        id: plan.id,
        subject: plan.title,
        examDate: plan.deadline || new Date().toISOString(),
        daysRemaining: Math.ceil((new Date(plan.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        currentCompletion: 0,
        generatedPlan: plan.description || '',
        createdAt: plan.created_at,
        status: plan.status === 'completed' ? 'completed' : 'active'
      }));

      setPlans(transformed);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const addTopicField = () => {
    setTopics([...topics, '']);
  };

  const removeTopicField = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const updateTopic = (index: number, value: string) => {
    const updated = [...topics];
    updated[index] = value;
    setTopics(updated);
  };

  const handleGeneratePlan = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      // Validation
      if (!subject || !examDate) {
        throw new Error('Please fill in subject and exam date');
      }

      const filteredTopics = topics.filter(t => t.trim().length > 0);
      if (filteredTopics.length === 0) {
        throw new Error('Please add at least one topic to complete');
      }

      // Check if exam date is in the future
      const exam = new Date(examDate);
      if (exam.getTime() < Date.now()) {
        throw new Error('Exam date must be in the future');
      }

      console.log('📊 Generating catch-up plan...');

      // Call AI API
      const result = await generateCatchUpPlan({
        subject,
        examDate,
        currentCompletionPercentage: parseFloat(currentCompletion),
        topicsToComplete: filteredTopics,
        dailyAvailableHours: parseFloat(dailyHours),
        studentName: userProfile?.full_name || 'Student'
      });

      console.log('✅ Plan generated:', result);

      // Save to database
      const { data: savedPlan, error: saveError } = await supabase
        .from('catch_up_plans')
        .insert([{
          user_id: userProfile?.id,
          title: subject,
          description: result.data.plan,
          deadline: examDate,
          subjects: filteredTopics,
          status: 'in_progress',
          roadmap: {
            daysRemaining: result.data.daysRemaining,
            currentCompletion: result.data.currentCompletion,
            dailyHours: parseFloat(dailyHours)
          }
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      // Add to local state
      const newPlan: CatchUpPlan = {
        id: savedPlan.id,
        subject,
        examDate,
        daysRemaining: result.data.daysRemaining,
        currentCompletion: result.data.currentCompletion,
        generatedPlan: result.data.plan,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      setPlans([newPlan, ...plans]);
      setSelectedPlan(newPlan);

      // Reset form
      setIsCreateOpen(false);
      setSubject('');
      setExamDate('');
      setCurrentCompletion('0');
      setDailyHours('3');
      setTopics(['']);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
      console.error('💥 Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('catch_up_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setPlans(plans.filter(p => p.id !== planId));
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const markAsCompleted = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('catch_up_plans')
        .update({ status: 'completed' })
        .eq('id', planId);

      if (error) throw error;

      setPlans(plans.map(p => p.id === planId ? { ...p, status: 'completed' } : p));
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  // Parse AI plan sections (unused for now, kept for future features)
  // const parsePlanSections = (plan: string) => {
  //   const sections: Record<string, string> = {};
  //   let currentSection = '';
  //   const lines = plan.split('\n');

  //   for (const line of lines) {
  //     if (line.startsWith('## ')) {
  //       currentSection = line.replace('## ', '').trim();
  //       sections[currentSection] = '';
  //     } else if (currentSection && line.trim()) {
  //       sections[currentSection] += line + '\n';
  //     }
  //   }

  //   return sections;
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-indigo-400" />
            AI-Powered Catch-Up Plans
          </h2>
          <p className="text-gray-400 mt-2">
            Get personalized study plans generated by AI to catch up before exams
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                Generate AI Catch-Up Plan
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Tell us what you need to complete, and AI will create a realistic study schedule
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-800 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-4 py-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-gray-300">Subject / Course Name *</Label>
                <Input
                  placeholder="e.g., Data Structures and Algorithms"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              {/* Exam Date */}
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Exam Date *
                </Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Current Completion */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Current Completion (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={currentCompletion}
                    onChange={e => setCurrentCompletion(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Daily Study Hours
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    value={dailyHours}
                    onChange={e => setDailyHours(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>

              {/* Topics to Complete */}
              <div className="space-y-2">
                <Label className="text-gray-300">Topics/Chapters to Complete *</Label>
                <div className="space-y-2">
                  {topics.map((topic, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder={`Topic ${idx + 1} (e.g., Binary Search Trees)`}
                        value={topic}
                        onChange={e => updateTopic(idx, e.target.value)}
                        className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                      />
                      {topics.length > 1 && (
                        <Button
                          onClick={() => removeTopicField(idx)}
                          variant="outline"
                          size="icon"
                          className="border-red-700 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={addTopicField}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-indigo-600 text-indigo-400 hover:bg-indigo-600/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic
                </Button>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePlan}
                disabled={isGenerating || !subject || !examDate}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating AI Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Plan with AI
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Display */}
      {plans.length === 0 ? (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="text-center py-16">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Catch-Up Plans Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first AI-powered catch-up plan to get back on track
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Your Plans</h3>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {plans.map(plan => {
                  const isExpired = plan.daysRemaining < 0;
                  const isUrgent = plan.daysRemaining <= 3 && plan.daysRemaining >= 0;
                  
                  return (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'bg-indigo-900/40 border-indigo-500/50'
                          : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-sm">{plan.subject}</h4>
                          <Badge
                            variant={plan.status === 'completed' ? 'default' : isExpired ? 'destructive' : isUrgent ? 'outline' : 'secondary'}
                            className="text-xs"
                          >
                            {plan.status === 'completed' ? 'Done' : isExpired ? 'Expired' : `${plan.daysRemaining}d`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(plan.examDate).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Plan Details */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">{selectedPlan.subject}</CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        Exam: {new Date(selectedPlan.examDate).toLocaleDateString()} • 
                        {selectedPlan.daysRemaining >= 0 ? ` ${selectedPlan.daysRemaining} days remaining` : ' Expired'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {selectedPlan.status === 'active' && (
                        <Button
                          onClick={() => markAsCompleted(selectedPlan.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        onClick={() => deletePlan(selectedPlan.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-700 text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                        {selectedPlan.generatedPlan.split('\n').map((line, idx) => {
                          if (line.startsWith('## ')) {
                            return (
                              <h3 key={idx} className="text-lg font-bold text-indigo-300 mt-6 mb-3">
                                {line.replace('## ', '')}
                              </h3>
                            );
                          } else if (line.startsWith('### ')) {
                            return (
                              <h4 key={idx} className="text-base font-semibold text-purple-300 mt-4 mb-2">
                                {line.replace('### ', '')}
                              </h4>
                            );
                          } else if (line.trim().startsWith('-')) {
                            return (
                              <li key={idx} className="ml-4 text-gray-300">
                                {line.replace(/^-\s*/, '')}
                              </li>
                            );
                          } else if (line.trim()) {
                            return (
                              <p key={idx} className="mb-2 text-gray-300">
                                {line}
                              </p>
                            );
                          }
                          return <br key={idx} />;
                        })}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="text-center py-16">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Plan</h3>
                  <p className="text-gray-400">
                    Click on a plan from the list to view its AI-generated study schedule
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
