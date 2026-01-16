import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Code, Briefcase, Award, LinkIcon, ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

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
  alumni_id: string;
  title: string;
  description: string;
  target_year: number;
  academic_focus: string[];
  skills_focus: string[];
  tech_skills: string[];
  lessons_learned: string;
  interview_prep: string;
  resources: Resource[];
  interview_tips: InterviewTip[];
  timeline_months: number;
  key_milestones: string[];
  companies_cracked: string[];
  created_at: string;
  alumni: {
    full_name: string;
    department: string;
    profile_image?: string;
  };
}

export default function AlumniRoadmapsExplorer() {
  const [roadmaps, setRoadmaps] = useState<AlumniRoadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<AlumniRoadmap | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    fetchPublicRoadmaps();
  }, []);

  const fetchPublicRoadmaps = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_roadmaps')
        .select(`
          *,
          alumni:alumni_id (
            full_name,
            department,
            profile_image
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    }
  };

  const handleViewRoadmap = (roadmap: AlumniRoadmap) => {
    setSelectedRoadmap(roadmap);
    setShowDialog(true);
  };

  const filteredRoadmaps = filterDepartment === 'all' 
    ? roadmaps 
    : roadmaps.filter(r => r.alumni.department === filterDepartment);

  const departments = Array.from(new Set(roadmaps.map(r => r.alumni.department)));

  return (
    <>
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Alumni Success Roadmaps
            </CardTitle>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[700px] overflow-y-auto">
            {filteredRoadmaps.length > 0 ? (
              filteredRoadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className="p-4 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-purple-500/30 transition-all cursor-pointer"
                  onClick={() => handleViewRoadmap(roadmap)}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white text-lg">{roadmap.title}</h4>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {roadmap.target_year}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Award className="w-4 h-4" />
                        <span className="font-medium">{roadmap.alumni.full_name}</span>
                        <span className="text-gray-500">•</span>
                        <span>{roadmap.alumni.department}</span>
                      </div>

                      <p className="text-sm text-gray-300 mb-3">{roadmap.description}</p>

                      {roadmap.companies_cracked && roadmap.companies_cracked.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          {roadmap.companies_cracked.slice(0, 3).map((company) => (
                            <Badge key={company} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                              {company}
                            </Badge>
                          ))}
                          {roadmap.companies_cracked.length > 3 && (
                            <Badge className="bg-neutral-700 text-gray-400 text-xs">
                              +{roadmap.companies_cracked.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {roadmap.tech_skills && roadmap.tech_skills.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                              <Code className="w-3 h-3" />
                              Tech Stack
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {roadmap.tech_skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs bg-indigo-500/20 text-indigo-300 border-0">
                                  {skill}
                                </Badge>
                              ))}
                              {roadmap.tech_skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-neutral-700 text-gray-400 border-0">
                                  +{roadmap.tech_skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {roadmap.timeline_months && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Timeline
                            </p>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-0">
                              {roadmap.timeline_months} months
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-purple-400 hover:bg-purple-500/10"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Full Roadmap
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No roadmaps available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-4xl max-h-[90vh]">
          {selectedRoadmap && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-purple-400" />
                  {selectedRoadmap.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  <div className="flex items-center gap-2 mt-2">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">{selectedRoadmap.alumni.full_name}</span>
                    <span className="text-gray-500">•</span>
                    <span>{selectedRoadmap.alumni.department}</span>
                    <span className="text-gray-500">•</span>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Class of {selectedRoadmap.target_year}
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
                <div className="space-y-6 mt-4">
                  {/* Overview */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Overview</h3>
                    <p className="text-gray-300">{selectedRoadmap.description}</p>
                  </div>

                  {/* Companies Cracked */}
                  {selectedRoadmap.companies_cracked && selectedRoadmap.companies_cracked.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Companies Cracked
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoadmap.companies_cracked.map((company) => (
                          <Badge key={company} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm px-3 py-1">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Skills */}
                  {selectedRoadmap.tech_skills && selectedRoadmap.tech_skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Tech Skills Mastered
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoadmap.tech_skills.map((skill) => (
                          <Badge key={skill} className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-sm px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Academic Focus */}
                  {selectedRoadmap.academic_focus && selectedRoadmap.academic_focus.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300 mb-3">Academic Focus Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoadmap.academic_focus.map((focus) => (
                          <Badge key={focus} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-sm px-3 py-1">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {selectedRoadmap.resources && selectedRoadmap.resources.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Learning Resources
                      </h3>
                      <div className="space-y-2">
                        {selectedRoadmap.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-neutral-800 rounded border border-neutral-700 hover:border-amber-500/30 transition-all"
                          >
                            <LinkIcon className="w-4 h-4 text-amber-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{resource.title}</p>
                              <p className="text-xs text-gray-400">{resource.type}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview Prep */}
                  {selectedRoadmap.interview_prep && (
                    <div>
                      <h3 className="text-lg font-semibold text-rose-300 mb-3">Interview Preparation Strategy</h3>
                      <div className="p-4 bg-neutral-800 rounded border border-neutral-700">
                        <p className="text-gray-300 whitespace-pre-wrap">{selectedRoadmap.interview_prep}</p>
                      </div>
                    </div>
                  )}

                  {/* Interview Tips */}
                  {selectedRoadmap.interview_tips && selectedRoadmap.interview_tips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-orange-300 mb-3">Company-Specific Interview Tips</h3>
                      <div className="space-y-3">
                        {selectedRoadmap.interview_tips.map((tip, idx) => (
                          <div key={idx} className="p-3 bg-neutral-800 rounded border border-neutral-700">
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="w-4 h-4 text-orange-400" />
                              <span className="font-semibold text-white">{tip.company}</span>
                              {tip.role && <Badge className="text-xs bg-orange-500/20 text-orange-300">{tip.role}</Badge>}
                            </div>
                            <p className="text-sm text-gray-300">{tip.tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Milestones */}
                  {selectedRoadmap.key_milestones && selectedRoadmap.key_milestones.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Key Milestones
                      </h3>
                      <div className="space-y-2">
                        {selectedRoadmap.key_milestones.map((milestone, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-neutral-800 rounded border border-neutral-700">
                            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-teal-300">{idx + 1}</span>
                            </div>
                            <p className="text-sm text-gray-300 flex-1">{milestone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lessons Learned */}
                  {selectedRoadmap.lessons_learned && (
                    <div>
                      <h3 className="text-lg font-semibold text-violet-300 mb-3">Lessons Learned & Advice</h3>
                      <div className="p-4 bg-neutral-800 rounded border border-neutral-700">
                        <p className="text-gray-300 whitespace-pre-wrap">{selectedRoadmap.lessons_learned}</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="mt-4 pt-4 border-t border-neutral-800">
                <Button
                  onClick={() => setShowDialog(false)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
