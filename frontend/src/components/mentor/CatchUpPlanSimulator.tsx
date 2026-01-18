import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Zap, AlertCircle, CheckCircle, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  id: string;
  name: string;
}

interface CatchUpData {
  syllabusCompletion: number;
  daysRemaining: number;
  dailyStudyHours: number;
  studentId?: string;
}

export default function CatchUpPlanSimulator() {
  const { userProfile } = useAuth();
  const [mentees, setMentees] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const [inputs, setInputs] = useState<CatchUpData>({
    syllabusCompletion: 60,
    daysRemaining: 30,
    dailyStudyHours: 3
  });

  const [approved, setApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
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

      const students = (connections || []).map((conn: any) => ({
        id: conn.mentee_id,
        name: conn.mentee?.full_name || 'Unknown'
      }));

      setMentees(students);
      if (students.length > 0) {
        setSelectedStudentId(students[0].id);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const calculateTimelines = () => {
    const remaining = 100 - inputs.syllabusCompletion;
    const hoursNeeded = remaining * 0.5; // 0.5 hours per percentage point

    // Best case
    const bestCaseHours = hoursNeeded * 0.8;
    const bestCaseDays = Math.ceil(bestCaseHours / (inputs.dailyStudyHours * 1.2));

    // Realistic
    const realisticDays = Math.ceil(hoursNeeded / inputs.dailyStudyHours);

    // Worst case
    const worstCaseHours = hoursNeeded * 1.3;
    const worstCaseDays = Math.ceil(worstCaseHours / (inputs.dailyStudyHours * 0.7));

    return {
      best: {
        days: Math.max(1, Math.min(bestCaseDays, inputs.daysRemaining)),
        label: 'Best Case',
        description: 'With focused study and minimal distractions',
        feasible: Math.min(bestCaseDays, inputs.daysRemaining) <= inputs.daysRemaining
      },
      realistic: {
        days: Math.max(1, Math.min(realisticDays, inputs.daysRemaining)),
        label: 'Realistic Timeline',
        description: 'With normal study patterns and breaks',
        feasible: Math.min(realisticDays, inputs.daysRemaining) <= inputs.daysRemaining
      },
      worst: {
        days: Math.max(1, Math.min(worstCaseDays, inputs.daysRemaining)),
        label: 'Worst Case',
        description: 'With interruptions and slower progress',
        feasible: Math.min(worstCaseDays, inputs.daysRemaining) <= inputs.daysRemaining
      }
    };
  };

  const timelines = calculateTimelines();
  const canComplete = timelines.realistic.feasible;

  const savePlan = async () => {
    if (!selectedStudentId || !userProfile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('catchup_plan_history')
        .insert([{
          mentor_id: userProfile.id,
          plan_id: null, // Can link to existing plan if needed
          syllabus_completion_percentage: inputs.syllabusCompletion,
          days_remaining: inputs.daysRemaining,
          daily_study_hours: inputs.dailyStudyHours,
          best_case_timeline: `${timelines.best.days} days`,
          realistic_timeline: `${timelines.realistic.days} days`,
          worst_case_timeline: `${timelines.worst.days} days`,
          approved: approved
        }]);

      if (error) throw error;

      // Also record in mentor notes
      await supabase
        .from('mentor_student_notes')
        .insert([{
          mentor_id: userProfile.id,
          mentee_id: selectedStudentId,
          note_type: 'observation',
          content: `Catch-up plan simulated: ${inputs.syllabusCompletion}% completion, ${inputs.daysRemaining} days remaining, ${inputs.dailyStudyHours} hrs/day. Realistic timeline: ${timelines.realistic.days} days. ${approved ? 'APPROVED' : 'PENDING'}`,
          tags: ['catch-up-plan', 'simulator']
        }]);

      alert('✅ Catch-up plan saved successfully!');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border border-neutral-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Catch-Up Plan Simulator
        </CardTitle>
        <CardDescription>Simulate recovery timelines and approve plans for your mentees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Student Selection */}
        {mentees.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Select Student</Label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-4 py-2"
            >
              {mentees.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="syllabus" className="text-sm text-gray-300">Syllabus Completion %</Label>
            <Input
              id="syllabus"
              type="number"
              min="0"
              max="100"
              value={inputs.syllabusCompletion}
              onChange={(e) => setInputs({ ...inputs, syllabusCompletion: parseInt(e.target.value) || 0 })}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <p className="text-xs text-gray-500">{inputs.syllabusCompletion}% completed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days" className="text-sm text-gray-300">Days Remaining</Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="365"
              value={inputs.daysRemaining}
              onChange={(e) => setInputs({ ...inputs, daysRemaining: parseInt(e.target.value) || 1 })}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <p className="text-xs text-gray-500">{inputs.daysRemaining} days to exam</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours" className="text-sm text-gray-300">Daily Study Hours</Label>
            <Input
              id="hours"
              type="number"
              min="0.5"
              step="0.5"
              max="12"
              value={inputs.dailyStudyHours}
              onChange={(e) => setInputs({ ...inputs, dailyStudyHours: parseFloat(e.target.value) || 1 })}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <p className="text-xs text-gray-500">{inputs.dailyStudyHours} hrs/day</p>
          </div>
        </div>

        {/* Timelines Output */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-300">Projected Recovery Timelines</p>

          <div className="space-y-3">
            {/* Best Case */}
            <div className="p-4 rounded-lg bg-neutral-800 border border-emerald-500/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-emerald-300">{timelines.best.label}</p>
                  <p className="text-xs text-gray-400">{timelines.best.description}</p>
                </div>
                <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
                  {timelines.best.days} days
                </Badge>
              </div>
              <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${Math.min((timelines.best.days / inputs.daysRemaining) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Realistic */}
            <div className={`p-4 rounded-lg bg-neutral-800 border ${canComplete ? 'border-amber-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className={`text-sm font-semibold ${canComplete ? 'text-amber-300' : 'text-red-300'}`}>
                    {timelines.realistic.label}
                  </p>
                  <p className="text-xs text-gray-400">{timelines.realistic.description}</p>
                </div>
                <Badge className={`${canComplete ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
                  {timelines.realistic.days} days
                </Badge>
              </div>
              <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${canComplete ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${Math.min((timelines.realistic.days / inputs.daysRemaining) * 100, 100)}%` }}
                ></div>
              </div>
              {!canComplete && (
                <div className="flex items-center gap-2 mt-2 text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-xs">This timeline exceeds available days</p>
                </div>
              )}
            </div>

            {/* Worst Case */}
            <div className="p-4 rounded-lg bg-neutral-800 border border-orange-500/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-orange-300">{timelines.worst.label}</p>
                  <p className="text-xs text-gray-400">{timelines.worst.description}</p>
                </div>
                <Badge className="bg-orange-500/20 border-orange-500/30 text-orange-300">
                  {timelines.worst.days} days
                </Badge>
              </div>
              <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${Math.min((timelines.worst.days / inputs.daysRemaining) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feasibility Assessment */}
        <div className={`p-4 rounded-lg border ${canComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            {canComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="font-semibold text-emerald-300">Feasible Timeline</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="font-semibold text-red-300">Tight Timeline</p>
              </>
            )}
          </div>
          <p className={`text-sm ${canComplete ? 'text-emerald-100' : 'text-red-100'}`}>
            {canComplete
              ? `With ${inputs.dailyStudyHours} hours/day, the student can realistically complete the remaining ${100 - inputs.syllabusCompletion}% in ${timelines.realistic.days} days.`
              : `The student needs ${timelines.realistic.days} days but only has ${inputs.daysRemaining} days. Consider increasing daily study hours or prioritizing key topics.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setShowSaveDialog(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Share Plan
          </Button>
          <Button
            variant={approved ? 'default' : 'outline'}
            onClick={() => setApproved(!approved)}
            className={`flex-1 ${approved ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-500/50 text-emerald-400'}`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {approved ? 'Plan Approved' : 'Approve Plan'}
          </Button>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
            <DialogHeader>
              <DialogTitle>Confirm Catch-Up Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Completion:</span>
                  <span className="font-semibold">{inputs.syllabusCompletion}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Remaining:</span>
                  <span className="font-semibold">{inputs.daysRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Hours:</span>
                  <span className="font-semibold">{inputs.dailyStudyHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Realistic Timeline:</span>
                  <span className={`font-semibold ${canComplete ? 'text-amber-300' : 'text-red-300'}`}>
                    {timelines.realistic.days} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge className={approved ? 'bg-emerald-500/20 text-emerald-300 border-0' : 'bg-amber-500/20 text-amber-300 border-0'}>
                    {approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSaveDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={savePlan}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Confirm & Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
