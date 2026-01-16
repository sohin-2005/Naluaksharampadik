import { Link } from 'react-router-dom';
import { GraduationCap, Users, Target, TrendingUp, ArrowRight, CheckCircle, Sparkles, Brain, Calendar, Zap, BookOpen, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800/50 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-110">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Naalu Aksharam Padikk
                </h1>
                
                <p className="text-xs text-gray-400 -mt-1">Connect. Learn. Grow Together.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-100 hover:bg-neutral-800 transition-all">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-lg shadow-fuchsia-500/25 transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Sparkles className="size-4 text-purple-300" />
            <span className="text-sm text-purple-200">AI-Powered Academic Success Platform</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent leading-tight">
            Never Feel Lost<br />Academically Again
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Too many juniors feel lost academically, simply because they don't know who to approach—
            even though there are seniors ready and willing to help. <span className="text-fuchsia-300 font-semibold">We're solving this disconnect with AI.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-lg px-10 py-7 shadow-2xl shadow-fuchsia-500/30 transition-all hover:scale-105">
                Start Your Journey <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-neutral-700 text-gray-100 hover:bg-neutral-800 transition-all">
                I Already Have Account
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-400" />
              <span>AI-Powered Planning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-400" />
              <span>Verified Mentors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-400" />
              <span>Study Streak Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* SemSense AI Feature Section - NEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-3xl p-12 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6">
              <Brain className="size-5 text-indigo-300" />
              <span className="text-sm font-semibold text-indigo-200">Powered by AI</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
              SemSense AI: Your Personal Semester Planner
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Upload your timetable and let our AI create a <span className="text-purple-300 font-semibold">personalized 16-week study roadmap</span> that adapts to your schedule, holidays, and learning style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-neutral-900/80 backdrop-blur border-indigo-500/30 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/20">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl w-fit mb-4 shadow-lg">
                  <Calendar className="size-8 text-white" />
                </div>
                <h4 className="font-bold text-2xl mb-3 text-white">Smart Timeline Planning</h4>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  AI analyzes your semester dates, identifies holiday windows, and creates realistic weekly study goals that prevent burnout.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Zap className="size-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Automatic holiday detection (Mini/Intermediate/Flagship)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="size-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>16-week structured roadmap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="size-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Weekly hour allocation per subject</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/80 backdrop-blur border-purple-500/30 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-3 rounded-xl w-fit mb-4 shadow-lg">
                  <BookOpen className="size-8 text-white" />
                </div>
                <h4 className="font-bold text-2xl mb-3 text-white">Workload Intelligence</h4>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Get personalized recommendations based on subject difficulty, your available hours, and academic interests.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Zap className="size-5 text-fuchsia-400 mt-0.5 flex-shrink-0" />
                    <span>Subject difficulty analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="size-5 text-fuchsia-400 mt-0.5 flex-shrink-0" />
                    <span>Primary & supporting skills identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="size-5 text-fuchsia-400 mt-0.5 flex-shrink-0" />
                    <span>Industry trend insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur rounded-2xl p-8 border border-neutral-800/50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-xl flex-shrink-0">
                <Award className="size-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-2xl mb-2 text-white">AI-Powered Balance Tips</h4>
                <p className="text-gray-300">
                  Receive personalized advice on maintaining work-life balance, managing exam stress, and optimizing your study sessions for maximum retention.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                    Try SemSense AI <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="bg-neutral-900/60 backdrop-blur rounded-3xl p-12 shadow-xl border border-neutral-800/50">
          <h3 className="text-4xl font-bold text-center mb-4 text-white">
            The Problems We're Solving
          </h3>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            We identified three critical pain points that prevent students from reaching their full potential
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 to-red-600/5 hover:shadow-2xl hover:shadow-red-500/20 transition-all">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">😰</div>
                <h4 className="font-bold text-xl mb-3 text-white">Guidance Disconnect</h4>
                <p className="text-gray-200 leading-relaxed">
                  Juniors don't know who to approach, and seniors willing to help go unnoticed
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:shadow-2xl hover:shadow-amber-500/20 transition-all">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">😔</div>
                <h4 className="font-bold text-xl mb-3 text-white">Inconsistency & Procrastination</h4>
                <p className="text-gray-200 leading-relaxed">
                  Students struggle to maintain consistent study habits without accountability
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-yellow-400/40 bg-gradient-to-br from-yellow-400/10 to-yellow-500/5 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">😱</div>
                <h4 className="font-bold text-xl mb-3 text-white">"It's Too Late" Panic</h4>
                <p className="text-gray-200 leading-relaxed">
                  Late starters receive vague advice instead of actionable recovery roadmaps
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Our Comprehensive Solution
          </h3>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three powerful pillars working together to transform your academic journey
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-indigo-500/40 bg-gradient-to-br from-neutral-900 to-indigo-950/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl w-fit mb-4 shadow-lg">
                <Users className="size-10 text-white" />
              </div>
              <h4 className="font-bold text-2xl mb-4 text-white">Verified Mentorship Network</h4>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Connect with verified seniors without social friction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Search by department, expertise, and ratings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Direct messaging and guidance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/40 bg-gradient-to-br from-neutral-900 to-purple-950/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl w-fit mb-4 shadow-lg">
                <TrendingUp className="size-10 text-white" />
              </div>
              <h4 className="font-bold text-2xl mb-4 text-white">Social Accountability System</h4>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Daily study logs to build consistency streaks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Non-toxic environment with positive peer pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Community feed to share progress</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-500/40 bg-gradient-to-br from-neutral-900 to-pink-950/20 hover:shadow-2xl hover:shadow-pink-500/30 transition-all hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl w-fit mb-4 shadow-lg">
                <Target className="size-10 text-white" />
              </div>
              <h4 className="font-bold text-2xl mb-4 text-white">Smart Catch-Up Plans</h4>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Time-optimized recovery roadmaps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Senior-approved study plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Track progress and adjust as needed</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-3xl p-16 text-white shadow-2xl shadow-purple-500/40">
          <h3 className="text-4xl font-bold text-center mb-4">Join Our Growing Community</h3>
          <p className="text-center text-purple-100 mb-12 text-lg">Real students, real progress, real results</p>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-6xl font-bold mb-3 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">247</div>
              <div className="text-lg text-purple-50 font-semibold">Active Mentors</div>
              <div className="text-sm text-purple-200 mt-2">Ready to guide you</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-6xl font-bold mb-3 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">1,834</div>
              <div className="text-lg text-purple-50 font-semibold">Daily Study Logs</div>
              <div className="text-sm text-purple-200 mt-2">Consistency in action</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-6xl font-bold mb-3 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">563</div>
              <div className="text-lg text-purple-50 font-semibold">Catch-Up Plans Active</div>
              <div className="text-sm text-purple-200 mt-2">Never too late to start</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl p-16 border border-neutral-800/50 shadow-2xl">
          <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            Ready to Transform Your Academic Journey?
          </h3>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join thousands of students who are already learning, growing, and succeeding together with AI-powered guidance.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-xl px-14 py-8 shadow-2xl shadow-fuchsia-500/30 transition-all hover:scale-105">
              Get Started for Free <ArrowRight className="ml-2 size-6" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-6">No credit card required • Free forever • Join in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900/80 backdrop-blur border-t border-neutral-800/50 mt-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="size-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Naalu Aksharam Padikk</p>
                <p className="text-xs text-gray-400">Academic success, simplified</p>
              </div>
            </div>
            <div className="text-center text-gray-400">
              <p>© 2026 Naalu Aksharam Padikk. Built with ❤️ for students.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
