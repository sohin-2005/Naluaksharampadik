import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, BookOpen, Plus, X, Link as LinkIcon, Code, Briefcase, Calendar, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface InterviewTip {
  company: string;
  role: string;
  tip: string;
}

interface AlumniRoadmap {
  id: string;
  title: string;
  description: string;
  targetYear: number;
  academicFocus: string[];
  skillsFocus: string[];
  lessonsLearned: string;
  techSkills?: string[];
  resources?: Resource[];
  interviewPrep?: string;
  interviewTips?: InterviewTip[];
  companiesCracked?: string[];
  timelineMonths?: number;
  keyMilestones?: string[];
}

export default function RoadmapVault() {
  const { userProfile } = useAuth();
  const [roadmaps, setRoadmaps] = useState<AlumniRoadmap[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<AlumniRoadmap | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetYear: new Date().getFullYear(),
    academicFocus: '',
    skillsFocus: '',
    techSkills: '',
    lessonsLearned: '',
    interviewPrep: '',
    timelineMonths: '',
    keyMilestones: '',
    companiesCracked: '',
  });
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [interviewTips, setInterviewTips] = useState<InterviewTip[]>([]);
  const [newResource, setNewResource] = useState<Resource>({ title: '', url: '', type: 'article' });
  const [newTip, setNewTip] = useState<InterviewTip>({ company: '', role: '', tip: '' });

  useEffect(() => {
    if (userProfile?.role === 'alumni') {
      fetchRoadmaps();
    }
  }, [userProfile]);

  const fetchRoadmaps = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_roadmaps')
        .select('*')
        .eq('alumni_id', userProfile?.id)
        .order('target_year', { ascending: true });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    }
  };

  const handleOpenDialog = (roadmap?: AlumniRoadmap) => {
    if (roadmap) {
      setSelectedRoadmap(roadmap);
      setFormData({
        title: roadmap.title,
        description: roadmap.description,
        targetYear: roadmap.targetYear,
        academicFocus: roadmap.academicFocus?.join(', ') || '',
        skillsFocus: roadmap.skillsFocus?.join(', ') || '',
        techSkills: roadmap.techSkills?.join(', ') || '',
        lessonsLearned: roadmap.lessonsLearned || '',
        interviewPrep: roadmap.interviewPrep || '',
        timelineMonths: roadmap.timelineMonths?.toString() || '',
        keyMilestones: roadmap.keyMilestones?.join('\n') || '',
        companiesCracked: roadmap.companiesCracked?.join(', ') || '',
      });
      setResources(roadmap.resources || []);
      setInterviewTips(roadmap.interviewTips || []);
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const resetForm = () => {
    setSelectedRoadmap(null);
    setFormData({
      title: '',
      description: '',
      targetYear: new Date().getFullYear(),
      academicFocus: '',
      skillsFocus: '',
      techSkills: '',
      lessonsLearned: '',
      interviewPrep: '',
      timelineMonths: '',
      keyMilestones: '',
      companiesCracked: '',
    });
    setResources([]);
    setInterviewTips([]);
    setNewResource({ title: '', url: '', type: 'article' });
    setNewTip({ company: '', role: '', tip: '' });
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setResources([...resources, newResource]);
      setNewResource({ title: '', url: '', type: 'article' });
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const addInterviewTip = () => {
    if (newTip.company && newTip.tip) {
      setInterviewTips([...interviewTips, newTip]);
      setNewTip({ company: '', role: '', tip: '' });
    }
  };

  const removeInterviewTip = (index: number) => {
    setInterviewTips(interviewTips.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in required fields');
      return;
    }

    setIsCreating(true);
    try {
      const roadmapData = {
        alumni_id: userProfile?.id,
        title: formData.title,
        description: formData.description,
        target_year: formData.targetYear,
        academic_focus: formData.academicFocus.split(',').map(s => s.trim()).filter(Boolean),
        skills_focus: formData.skillsFocus.split(',').map(s => s.trim()).filter(Boolean),
        tech_skills: formData.techSkills.split(',').map(s => s.trim()).filter(Boolean),
        lessons_learned: formData.lessonsLearned,
        interview_prep: formData.interviewPrep,
        resources: resources,
        interview_tips: interviewTips,
        timeline_months: formData.timelineMonths ? parseInt(formData.timelineMonths) : null,
        key_milestones: formData.keyMilestones.split('\n').filter(Boolean),
        companies_cracked: formData.companiesCracked.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (selectedRoadmap) {
        const { error } = await supabase
          .from('alumni_roadmaps')
          .update(roadmapData)
          .eq('id', selectedRoadmap.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alumni_roadmaps')
          .insert([roadmapData]);
        if (error) throw error;
      }

      await fetchRoadmaps();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving roadmap:', error);
      alert('Failed to save roadmap. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Roadmap Vault
            </CardTitle>
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Roadmap
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmaps.length > 0 ? (
              roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className="p-4 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{roadmap.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{roadmap.description}</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Year {roadmap.targetYear}
                    </Badge>
                  </div>

                  {roadmap.companiesCracked && roadmap.companiesCracked.length > 0 && (
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      {roadmap.companiesCracked.map((company) => (
                        <Badge key={company} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          {company}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Academic Focus</p>
                      <div className="flex flex-wrap gap-1">
                        {roadmap.academicFocus?.map((focus) => (
                          <Badge key={focus} variant="secondary" className="text-xs bg-indigo-500/20 text-indigo-300 border-0">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tech Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {roadmap.techSkills?.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-300 border-0">
                            <Code className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {roadmap.lessonsLearned && (
                    <div className="p-3 rounded bg-neutral-700/50 border border-neutral-700 mb-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Key Learnings</p>
                      <p className="text-sm text-gray-300">{roadmap.lessonsLearned.substring(0, 100)}...</p>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-purple-400 hover:bg-purple-500/10"
                    onClick={() => handleOpenDialog(roadmap)}
                  >
                    View Full Roadmap
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No roadmaps created yet</p>
                <p className="text-sm text-gray-500 mt-1">Share your journey and help future students succeed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Roadmap Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <MapPin className="w-6 h-6 text-purple-400" />
              {selectedRoadmap ? 'Edit Roadmap' : 'Create New Roadmap'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your journey to help future students succeed in their careers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Roadmap Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., My Journey to FAANG"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief overview of your journey..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetYear">Graduation Year</Label>
                  <Input
                    id="targetYear"
                    type="number"
                    value={formData.targetYear}
                    onChange={(e) => setFormData({ ...formData, targetYear: parseInt(e.target.value) })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="timelineMonths">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Timeline (months)
                  </Label>
                  <Input
                    id="timelineMonths"
                    type="number"
                    placeholder="6"
                    value={formData.timelineMonths}
                    onChange={(e) => setFormData({ ...formData, timelineMonths: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Academic & Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-300">Academic & Skills Focus</h3>
              
              <div>
                <Label htmlFor="academicFocus">Academic Focus (comma-separated)</Label>
                <Input
                  id="academicFocus"
                  placeholder="Data Structures, Algorithms, DBMS, OS"
                  value={formData.academicFocus}
                  onChange={(e) => setFormData({ ...formData, academicFocus: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="techSkills">
                  <Code className="w-4 h-4 inline mr-1" />
                  Tech Skills (comma-separated)
                </Label>
                <Input
                  id="techSkills"
                  placeholder="Python, React, Node.js, MongoDB, AWS"
                  value={formData.techSkills}
                  onChange={(e) => setFormData({ ...formData, techSkills: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="skillsFocus">Soft Skills (comma-separated)</Label>
                <Input
                  id="skillsFocus"
                  placeholder="Communication, Problem Solving, Leadership"
                  value={formData.skillsFocus}
                  onChange={(e) => setFormData({ ...formData, skillsFocus: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Learning Resources
              </h3>
              
              <div className="grid grid-cols-12 gap-2">
                <Input
                  placeholder="Resource Title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white col-span-4"
                />
                <Input
                  placeholder="URL"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white col-span-5"
                />
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 col-span-2"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="course">Course</option>
                  <option value="book">Book</option>
                </select>
                <Button onClick={addResource} size="sm" className="bg-emerald-600 hover:bg-emerald-700 col-span-1">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {resources.length > 0 && (
                <div className="space-y-2">
                  {resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-neutral-800 rounded border border-neutral-700">
                      <LinkIcon className="w-4 h-4 text-emerald-400" />
                      <span className="flex-1 text-sm">{resource.title}</span>
                      <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResource(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interview Preparation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Interview Preparation
              </h3>
              
              <div>
                <Label htmlFor="interviewPrep">Interview Prep Strategy</Label>
                <Textarea
                  id="interviewPrep"
                  placeholder="Describe your interview preparation approach, key topics, practice routine, etc."
                  value={formData.interviewPrep}
                  onChange={(e) => setFormData({ ...formData, interviewPrep: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="companiesCracked">
                  <Award className="w-4 h-4 inline mr-1" />
                  Companies Cracked (comma-separated)
                </Label>
                <Input
                  id="companiesCracked"
                  placeholder="Google, Amazon, Microsoft, etc."
                  value={formData.companiesCracked}
                  onChange={(e) => setFormData({ ...formData, companiesCracked: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              {/* Interview Tips */}
              <div>
                <Label>Company-Specific Interview Tips</Label>
                <div className="grid grid-cols-12 gap-2 mt-2">
                  <Input
                    placeholder="Company"
                    value={newTip.company}
                    onChange={(e) => setNewTip({ ...newTip, company: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white col-span-3"
                  />
                  <Input
                    placeholder="Role (optional)"
                    value={newTip.role}
                    onChange={(e) => setNewTip({ ...newTip, role: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white col-span-3"
                  />
                  <Input
                    placeholder="Interview tip..."
                    value={newTip.tip}
                    onChange={(e) => setNewTip({ ...newTip, tip: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white col-span-5"
                  />
                  <Button onClick={addInterviewTip} size="sm" className="bg-amber-600 hover:bg-amber-700 col-span-1">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {interviewTips.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {interviewTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-neutral-800 rounded border border-neutral-700">
                        <Briefcase className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{tip.company}</span>
                            {tip.role && <Badge variant="secondary" className="text-xs">{tip.role}</Badge>}
                          </div>
                          <p className="text-sm text-gray-300">{tip.tip}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeInterviewTip(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Milestones & Learnings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-300">Key Milestones & Learnings</h3>
              
              <div>
                <Label htmlFor="keyMilestones">Key Milestones (one per line)</Label>
                <Textarea
                  id="keyMilestones"
                  placeholder="Completed DSA course&#10;Built first full-stack project&#10;Got first internship offer"
                  value={formData.keyMilestones}
                  onChange={(e) => setFormData({ ...formData, keyMilestones: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="lessonsLearned">Lessons Learned & Advice</Label>
                <Textarea
                  id="lessonsLearned"
                  placeholder="What you wish you knew earlier, mistakes to avoid, key insights..."
                  value={formData.lessonsLearned}
                  onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white min-h-[120px]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-neutral-800">
              <Button
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
                variant="outline"
                className="flex-1 border-neutral-700 hover:bg-neutral-800"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={isCreating}
              >
                {isCreating ? 'Saving...' : (selectedRoadmap ? 'Update Roadmap' : 'Create Roadmap')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
