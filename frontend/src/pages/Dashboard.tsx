import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap, Target, Users, TrendingUp, Activity, LogOut, BarChart3, BookMarked, FolderGit2 } from 'lucide-react';
import MentorshipTab from '../components/MentorshipTab';
import { StudyLogTab } from '../components/StudyLogTab';
import { CatchUpTab } from '../components/CatchUpTab';
import { ProfileTab } from '../components/ProfileTab';
import { CommunityFeedTab } from '../components/CommunityFeedTab';
import { MyProjectsTab } from '../components/MyProjectsTab';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import AcademicRadarPanel from '../components/mentor/AcademicRadarPanel';
import CatchUpPlanSimulator from '../components/mentor/CatchUpPlanSimulator';
import WeeklyMentorPulse from '../components/mentor/WeeklyMentorPulse';
import StudentTimelineView from '../components/mentor/StudentTimelineView';
import MentorPlaybooksSection from '../components/mentor/MentorPlaybooksSection';
import { MentorCommandCenter } from '../components/mentor/MentorCommandCenter';
import RoadmapVault from '../components/alumni/RoadmapVault';
import CompareYearView from '../components/alumni/CompareYearView';
import SkillDriftIndicator from '../components/alumni/SkillDriftIndicator';
import LongTermGrowthTracker from '../components/alumni/LongTermGrowthTracker';
import { StudentInsightsPanel } from '../components/student/StudentInsightsPanel';

export default function Dashboard() {
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [stats, setStats] = useState({
    mentorsCount: 0,
    studyLogsToday: 0,
    catchUpPlansCount: 0,
    incomingRequests: 0,
    unreadMessages: 0,
  });

  const isStudent = userProfile?.role === 'student';
  const isMentorOrAlumni = ['mentor', 'alumni'].includes(userProfile?.role);

  useEffect(() => {
    if (isMentorOrAlumni) {
      fetchMentorStats();
    } else {
      fetchDashboardStats();
    }
    if (userProfile?.id && isStudent) {
      fetchUserStreak();
    }
  }, [userProfile, isStudent, isMentorOrAlumni]);

  const fetchMentorStats = async () => {
    try {
      // Count incoming mentorship requests
      const { count: requestsCount } = await supabase
        .from('mentorship_connections')
        .select('*', { count: 'exact', head: true })
        .eq(userProfile?.role === 'mentor' ? 'mentor_id' : 'alumni_id', userProfile?.id)
        .eq('status', 'pending');

      // Count unread messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userProfile?.id)
        .eq('read_status', false);

      setStats(prev => ({
        ...prev,
        incomingRequests: requestsCount || 0,
        unreadMessages: messagesCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching mentor stats:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Count active mentors
      const { count: mentorsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .in('role', ['mentor', 'alumni']);

      // Count study logs today
      const today = new Date().toISOString().split('T')[0];
      const { count: studyLogsToday } = await supabase
        .from('study_logs')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Count active catch-up plans
      const { count: catchUpPlansCount } = await supabase
        .from('catch_up_plans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      setStats(prev => ({
        ...prev,
        mentorsCount: mentorsCount || 0,
        studyLogsToday: studyLogsToday || 0,
        catchUpPlansCount: catchUpPlansCount || 0,
      }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUserStreak = async () => {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userProfile.id)
        .single();

      if (error) throw error;
      if (data) {
        setCurrentStreak(data.current_streak);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      {/* Header */}
      <header className="bg-neutral-900/80 backdrop-blur border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-fuchsia-500/30">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Naalu Aksharam Padikk
                </h1>
                <p className="text-sm text-gray-300">Connect. Learn. Grow Together.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex text-right flex-col">
                <span className="font-semibold text-sm text-gray-100">{userProfile.full_name}</span>
                <span className="text-xs text-gray-400 capitalize">{userProfile.role}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-200 hover:bg-neutral-800">
                <LogOut className="h-5 w-5" />
              </Button>
              {isStudent && (
                <Card className="border border-amber-500/30 bg-neutral-900 hidden sm:block">
                  <CardContent className="p-2 px-3 flex items-center gap-2 text-amber-100">
                    <Target className="size-5 text-amber-400" />
                    <div>
                      <p className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">Streak</p>
                      <p className="text-lg font-bold text-amber-400 leading-none">{currentStreak} days</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isStudent ? (
          <>
            {/* Student Dashboard */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-neutral-800 bg-neutral-900/80 shadow-lg shadow-indigo-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">Active Mentors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Users className="size-8 text-indigo-300" />
                    <p className="text-3xl font-bold text-gray-100">{stats.mentorsCount}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Ready to help you succeed</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-800 bg-neutral-900/80 shadow-lg shadow-emerald-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">Study Logs Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="size-8 text-emerald-300" />
                    <p className="text-3xl font-bold text-gray-100">{stats.studyLogsToday}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Students staying accountable</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-800 bg-neutral-900/80 shadow-lg shadow-fuchsia-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">Catch-Up Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Target className="size-8 text-fuchsia-300" />
                    <p className="text-3xl font-bold text-gray-100">{stats.catchUpPlansCount}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">It's never too late to start</p>
                </CardContent>
              </Card>
            </div>

            {/* SemSense AI Card */}
            <Card className="mb-8 border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 hover:border-purple-500/50 transition cursor-pointer shadow-lg shadow-purple-500/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      🧠 SemSense AI – Plan Your Semester Wisely
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      AI-powered semester planning, project suggestions, and skill guidance
                    </p>
                    <Button
                      onClick={() => navigate('/semsense-ai')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    >
                      Plan My Semester
                    </Button>
                  </div>
                  <div className="text-4xl opacity-30">🚀</div>
                </div>
              </CardContent>
            </Card>

            {/* Student Insights Panel */}
            <div className="mb-8">
              <StudentInsightsPanel />
            </div>

            {/* Student Tabs */}
            <Tabs defaultValue="mentorship" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-neutral-900 border border-neutral-800 shadow-sm rounded-lg">
                <TabsTrigger value="mentorship" className="flex items-center gap-2 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200">
                  <Users className="size-4" />
                  <span className="hidden sm:inline">Mentorship</span>
                </TabsTrigger>
                <TabsTrigger value="study-log" className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200">
                  <TrendingUp className="size-4" />
                  <span className="hidden sm:inline">Study Log</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2 py-3 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200">
                  <FolderGit2 className="size-4" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
                <TabsTrigger value="catch-up" className="flex items-center gap-2 py-3 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200">
                  <Target className="size-4" />
                  <span className="hidden sm:inline">Catch-Up</span>
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center gap-2 py-3 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200">
                  <Activity className="size-4" />
                  <span className="hidden sm:inline">Community</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2 py-3 data-[state=active]:bg-neutral-800 data-[state=active]:text-gray-100">
                  <GraduationCap className="size-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mentorship" className="mt-6">
                <MentorshipTab userRole={userProfile.role} />
              </TabsContent>

              <TabsContent value="study-log" className="mt-6">
                <StudyLogTab currentStreak={currentStreak} setCurrentStreak={setCurrentStreak} />
              </TabsContent>

              <TabsContent value="projects" className="mt-6">
                <MyProjectsTab />
              </TabsContent>

              <TabsContent value="catch-up" className="mt-6">
                <CatchUpTab />
              </TabsContent>

              <TabsContent value="community" className="mt-6">
                <CommunityFeedTab />
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <ProfileTab userRole={userProfile.role} setUserRole={() => {}} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            {/* Mentor/Alumni Dashboard */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border border-neutral-800 bg-neutral-900/80 shadow-lg shadow-indigo-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">Student Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Users className="size-8 text-indigo-300" />
                    <p className="text-3xl font-bold text-gray-100">{stats.incomingRequests}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Pending mentorship connections</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-800 bg-neutral-900/80 shadow-lg shadow-purple-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">Unread Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Activity className="size-8 text-purple-300" />
                    <p className="text-3xl font-bold text-gray-100">{stats.unreadMessages}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Messages from students</p>
                </CardContent>
              </Card>
            </div>

            {/* Mentor/Alumni Tabs */}
            <Tabs defaultValue={userProfile.role === 'mentor' ? 'dashboard' : 'alumni-dashboard'} className="space-y-6">
              <TabsList className={`grid w-full ${userProfile.role === 'mentor' ? 'grid-cols-6' : 'grid-cols-5'} h-auto p-1 bg-neutral-900 border border-neutral-800 shadow-sm rounded-lg`}>
                {userProfile.role === 'mentor' ? (
                  <>
                    <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200">
                      <BarChart3 className="size-4" />
                      <span className="hidden sm:inline text-xs">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200">
                      <TrendingUp className="size-4" />
                      <span className="hidden sm:inline text-xs">Timeline</span>
                    </TabsTrigger>
                    <TabsTrigger value="mentorship" className="flex items-center gap-2 py-3 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-200">
                      <Users className="size-4" />
                      <span className="hidden sm:inline text-xs">Requests</span>
                    </TabsTrigger>
                    <TabsTrigger value="playbooks" className="flex items-center gap-2 py-3 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200">
                      <BookMarked className="size-4" />
                      <span className="hidden sm:inline text-xs">Playbooks</span>
                    </TabsTrigger>
                    <TabsTrigger value="community" className="flex items-center gap-2 py-3 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200">
                      <Activity className="size-4" />
                      <span className="hidden sm:inline text-xs">Community</span>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2 py-3 data-[state=active]:bg-neutral-800 data-[state=active]:text-gray-100">
                      <GraduationCap className="size-4" />
                      <span className="hidden sm:inline text-xs">Profile</span>
                    </TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="alumni-dashboard" className="flex items-center gap-2 py-3 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200">
                      <BarChart3 className="size-4" />
                      <span className="hidden sm:inline text-xs">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="roadmap" className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-200">
                      <BookMarked className="size-4" />
                      <span className="hidden sm:inline text-xs">Roadmaps</span>
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="flex items-center gap-2 py-3 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-200">
                      <TrendingUp className="size-4" />
                      <span className="hidden sm:inline text-xs">Skills</span>
                    </TabsTrigger>
                    <TabsTrigger value="community" className="flex items-center gap-2 py-3 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200">
                      <Activity className="size-4" />
                      <span className="hidden sm:inline text-xs">Community</span>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2 py-3 data-[state=active]:bg-neutral-800 data-[state=active]:text-gray-100">
                      <GraduationCap className="size-4" />
                      <span className="hidden sm:inline text-xs">Profile</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Mentor Tabs */}
              {userProfile.role === 'mentor' && (
                <>
                  <TabsContent value="dashboard" className="mt-6">
                    <div className="space-y-6">
                      <MentorCommandCenter />
                      <AcademicRadarPanel />
                      <CatchUpPlanSimulator />
                      <WeeklyMentorPulse />
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    <StudentTimelineView />
                  </TabsContent>

                  <TabsContent value="mentorship" className="mt-6">
                    <MentorshipTab userRole={userProfile.role} />
                  </TabsContent>

                  <TabsContent value="playbooks" className="mt-6">
                    <MentorPlaybooksSection />
                  </TabsContent>

                  <TabsContent value="community" className="mt-6">
                    <CommunityFeedTab />
                  </TabsContent>

                  <TabsContent value="profile" className="mt-6">
                    <ProfileTab userRole={userProfile.role} setUserRole={() => {}} />
                  </TabsContent>
                </>
              )}

              {/* Alumni Tabs */}
              {userProfile.role === 'alumni' && (
                <>
                  <TabsContent value="alumni-dashboard" className="mt-6">
                    <div className="space-y-6">
                      <RoadmapVault />
                      <div className="grid grid-cols-2 gap-6">
                        <CompareYearView />
                        <LongTermGrowthTracker />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="roadmap" className="mt-6">
                    <RoadmapVault />
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6">
                    <div className="space-y-6">
                      <SkillDriftIndicator />
                      <LongTermGrowthTracker />
                    </div>
                  </TabsContent>

                  <TabsContent value="community" className="mt-6">
                    <CommunityFeedTab />
                  </TabsContent>

                  <TabsContent value="profile" className="mt-6">
                    <ProfileTab userRole={userProfile.role} setUserRole={() => {}} />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
