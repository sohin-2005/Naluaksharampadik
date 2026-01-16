import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Sun, Moon, Sunset, Coffee, Target, Calendar, Headphones, Users2, AlertCircle, CheckCircle } from 'lucide-react';

interface StudyPattern {
  preferred_time_of_day: string;
  preferred_session_duration: number;
  focus_subjects: string[];
  study_days: string[];
  breaks_preference: string;
  environment_preference: string;
  goals: string;
}

const timeOptions = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)', icon: Sun },
  { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', icon: Coffee },
  { value: 'evening', label: 'Evening (5 PM - 9 PM)', icon: Sunset },
  { value: 'night', label: 'Night (9 PM - 1 AM)', icon: Moon },
  { value: 'flexible', label: 'Flexible / Varies', icon: Clock }
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const breaksOptions = [
  { value: 'pomodoro', label: 'Pomodoro (25 min + 5 min break)' },
  { value: 'long_breaks', label: 'Long sessions with extended breaks' },
  { value: 'short_frequent', label: 'Short, frequent breaks' },
  { value: 'no_breaks', label: 'I prefer continuous study' }
];

const environmentOptions = [
  { value: 'quiet', label: 'Complete Silence', icon: '🤫' },
  { value: 'music', label: 'Music / White Noise', icon: Headphones },
  { value: 'library', label: 'Library Environment', icon: '📚' },
  { value: 'group', label: 'Group Study', icon: Users2 }
];

export function MyStudyPattern() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasPattern, setHasPattern] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [pattern, setPattern] = useState<StudyPattern>({
    preferred_time_of_day: 'morning',
    preferred_session_duration: 60,
    focus_subjects: [],
    study_days: [],
    breaks_preference: 'pomodoro',
    environment_preference: 'quiet',
    goals: ''
  });

  const [subjectInput, setSubjectInput] = useState('');

  useEffect(() => {
    if (userProfile?.id) {
      fetchPattern();
    }
  }, [userProfile?.id]);

  const fetchPattern = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_patterns')
        .select('*')
        .eq('user_id', userProfile?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching pattern:', error);
        setHasPattern(false);
      } else if (data) {
        setPattern({
          preferred_time_of_day: data.preferred_time_of_day || 'morning',
          preferred_session_duration: data.preferred_session_duration || 60,
          focus_subjects: data.focus_subjects || [],
          study_days: data.study_days || [],
          breaks_preference: data.breaks_preference || 'pomodoro',
          environment_preference: data.environment_preference || 'quiet',
          goals: data.goals || ''
        });
        setHasPattern(true);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePattern = async () => {
    if (!userProfile?.id) return;
    
    setSaving(true);
    setSuccessMessage('');
    
    try {
      const { error } = await supabase
        .from('study_patterns')
        .upsert({
          user_id: userProfile.id,
          preferred_time_of_day: pattern.preferred_time_of_day,
          preferred_session_duration: pattern.preferred_session_duration,
          focus_subjects: pattern.focus_subjects,
          study_days: pattern.study_days,
          breaks_preference: pattern.breaks_preference,
          environment_preference: pattern.environment_preference,
          goals: pattern.goals,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      setHasPattern(true);
      setSuccessMessage('Study pattern saved successfully! 🎉');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error saving pattern:', err);
      alert(`Failed to save pattern: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    const dayLower = day.toLowerCase();
    if (pattern.study_days.includes(dayLower)) {
      setPattern({ ...pattern, study_days: pattern.study_days.filter(d => d !== dayLower) });
    } else {
      setPattern({ ...pattern, study_days: [...pattern.study_days, dayLower] });
    }
  };

  const addSubject = () => {
    if (subjectInput.trim() && !pattern.focus_subjects.includes(subjectInput.trim())) {
      setPattern({ ...pattern, focus_subjects: [...pattern.focus_subjects, subjectInput.trim()] });
      setSubjectInput('');
    }
  };

  const removeSubject = (subject: string) => {
    setPattern({ ...pattern, focus_subjects: pattern.focus_subjects.filter(s => s !== subject) });
  };

  if (loading) {
    return (
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Loading your study pattern...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300">{successMessage}</p>
        </div>
      )}

      {!hasPattern && (
        <Card className="bg-blue-500/10 border border-blue-500/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-300 font-semibold">Set up your study pattern</p>
              <p className="text-blue-200/80 text-sm mt-1">
                Help your mentor understand your preferences and get personalized guidance
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Preference */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            When do you study best?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = pattern.preferred_time_of_day === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setPattern({ ...pattern, preferred_time_of_day: option.value })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className={isSelected ? 'text-white font-semibold' : 'text-gray-300'}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Session Duration */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Ideal Study Session Length
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={15}
              max={240}
              step={15}
              value={pattern.preferred_session_duration}
              onChange={(e) => setPattern({ ...pattern, preferred_session_duration: parseInt(e.target.value) || 60 })}
              className="bg-neutral-800 border-neutral-700 text-white text-2xl font-bold text-center w-32"
            />
            <span className="text-gray-300">minutes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[30, 45, 60, 90, 120].map(mins => (
              <Button
                key={mins}
                variant="outline"
                size="sm"
                onClick={() => setPattern({ ...pattern, preferred_session_duration: mins })}
                className={`${
                  pattern.preferred_session_duration === mins
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-neutral-800 text-gray-300 border-neutral-700'
                }`}
              >
                {mins} min
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Days */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Preferred Study Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(day => {
              const isSelected = pattern.study_days.includes(day.toLowerCase());
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-gray-400'}`}>
                      {day.slice(0, 3)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">Select the days you typically study</p>
        </CardContent>
      </Card>

      {/* Focus Subjects */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Focus Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Data Structures, Physics"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <Button onClick={addSubject} className="bg-blue-600 hover:bg-blue-700">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {pattern.focus_subjects.map(subject => (
              <Badge
                key={subject}
                className="bg-blue-600 text-white px-3 py-1 cursor-pointer hover:bg-blue-700"
                onClick={() => removeSubject(subject)}
              >
                {subject} ✕
              </Badge>
            ))}
            {pattern.focus_subjects.length === 0 && (
              <p className="text-sm text-gray-500">No subjects added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Break Preference */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Break Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {breaksOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setPattern({ ...pattern, breaks_preference: option.value })}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                pattern.breaks_preference === option.value
                  ? 'border-amber-500 bg-amber-500/10 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-gray-300 hover:border-neutral-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Environment Preference */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Study Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {environmentOptions.map(option => {
              const isSelected = pattern.environment_preference === option.value;
              const Icon = typeof option.icon === 'string' ? null : option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setPattern({ ...pattern, environment_preference: option.value })}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/10'
                      : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {Icon ? (
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-rose-400' : 'text-gray-400'}`} />
                  ) : (
                    <span className="text-2xl">{String(option.icon)}</span>
                  )}
                  <span className={isSelected ? 'text-white font-semibold' : 'text-gray-300'}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Study Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What are you working towards? (e.g., Improve CGPA to 8.5, Master DSA for placements, Complete all lab assignments on time)"
            value={pattern.goals}
            onChange={(e) => setPattern({ ...pattern, goals: e.target.value })}
            rows={4}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSavePattern}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8"
        >
          {saving ? 'Saving...' : hasPattern ? 'Update Pattern' : 'Save Pattern'}
        </Button>
      </div>
    </div>
  );
}
