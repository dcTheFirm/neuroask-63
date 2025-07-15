import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mic, Play, Clock, TrendingUp, Award, Calendar, BarChart3, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RandomPractice } from "@/components/RandomPractice";
import { QuickSession } from "@/components/QuickSession";
import { SessionReview } from "@/components/SessionReview";

interface DashboardProps {
  onBack: () => void;
  onStartVoiceInterview: () => void;
  onStartTextInterview: () => void;
  user: any;
  onProfile: () => void;
  interviewConfig: {
    industry: string;
    level: string;
    type: string;
    duration: string;
  };
}

export const Dashboard = ({ onBack, onStartVoiceInterview, onStartTextInterview, user, onProfile, interviewConfig }: DashboardProps) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'random-practice' | 'quick-session' | 'session-review'>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const { toast } = useToast();

  const recentSessions = [
    {
      id: 1,
      type: "Behavioral",
      industry: interviewConfig.industry || "Software Engineering",
      date: "2024-01-15",
      score: 85,
      duration: "12 min",
      feedback: "Great use of STAR method. Your responses were well-structured and provided clear examples of your experience.",
      questions: [
        "Tell me about a time when you had to work with a difficult team member.",
        "Describe a situation where you had to meet a tight deadline.",
        "Give me an example of when you had to learn something new quickly."
      ],
      answers: [
        "I once worked with a team member who was resistant to feedback...",
        "During my last project, we had to deliver a feature in half the expected time...",
        "When I started my current role, I had to learn React Native in two weeks..."
      ]
    },
    {
      id: 2,
      type: "Technical",
      industry: interviewConfig.industry || "Software Engineering",
      date: "2024-01-14",
      score: 78,
      duration: "18 min",
      feedback: "Good problem-solving approach. Consider explaining your thought process more clearly and discussing time complexity.",
      questions: [
        "How would you implement a LRU cache?",
        "Explain the difference between REST and GraphQL.",
        "What are the benefits of using TypeScript?"
      ],
      answers: [
        "I would use a combination of a hash map and doubly linked list...",
        "REST is an architectural style while GraphQL is a query language...",
        "TypeScript provides static type checking which helps catch errors..."
      ]
    },
    {
      id: 3,
      type: "HR/Cultural",
      industry: interviewConfig.industry || "Software Engineering",
      date: "2024-01-12",
      score: 92,
      duration: "8 min",
      feedback: "Excellent cultural fit responses. You demonstrated strong alignment with company values and clear career goals.",
      questions: [
        "Why do you want to work here?",
        "Where do you see yourself in 5 years?",
        "What motivates you in your work?"
      ],
      answers: [
        "I'm excited about your company's mission to democratize technology...",
        "In 5 years, I see myself in a senior technical role...",
        "I'm motivated by solving complex problems that have real impact..."
      ]
    }
  ];

  const stats = [
    { label: "Total Sessions", value: "24", icon: <Calendar className="h-5 w-5" />, color: "from-blue-500 to-cyan-500" },
    { label: "Average Score", value: "85%", icon: <TrendingUp className="h-5 w-5" />, color: "from-green-500 to-emerald-500" },
    { label: "Hours Practiced", value: "12.5", icon: <Clock className="h-5 w-5" />, color: "from-purple-500 to-pink-500" },
    { label: "Streak", value: "7 days", icon: <Award className="h-5 w-5" />, color: "from-orange-500 to-red-500" }
  ];

  const validateInterviewConfig = () => {
    // Always allow interviews to proceed
    // The interview components will handle default values if config is empty
    return true;
  };

  const handleVoiceInterview = () => {
    if (validateInterviewConfig()) {
      onStartVoiceInterview();
    }
  };

  const handleTextInterview = () => {
    if (validateInterviewConfig()) {
      onStartTextInterview();
    }
  };

  const handleRandomPractice = () => {
    setCurrentView('random-practice');
  };

  const handleQuickSession = () => {
    setCurrentView('quick-session');
  };

  const handleSessionReview = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setCurrentView('session-review');
  };

  const handleTechnicalPractice = () => {
    if (validateInterviewConfig()) {
      toast({
        title: "Technical Practice",
        description: "Starting a focused technical interview session..."
      });
      onStartTextInterview();
    }
  };

  const handleResponseStructure = () => {
    if (validateInterviewConfig()) {
      toast({
        title: "Response Structure Practice",
        description: "Starting a session focused on STAR method and clear communication..."
      });
      onStartTextInterview();
    }
  };

  if (currentView === 'random-practice') {
    return <RandomPractice onBack={() => setCurrentView('dashboard')} interviewConfig={interviewConfig} />;
  }

  if (currentView === 'quick-session') {
    return <QuickSession onBack={() => setCurrentView('dashboard')} interviewConfig={interviewConfig} />;
  }

  if (currentView === 'session-review' && selectedSessionId) {
    const session = recentSessions.find(s => s.id === selectedSessionId);
    return <SessionReview session={session} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden page-enter">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 fade-in">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="mr-4 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 text-reveal">Interview Dashboard</h1>
                <p className="text-white/80 text-reveal">Track your progress and continue practicing</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleVoiceInterview}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg backdrop-blur-sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                Voice Interview
              </Button>
              <Button 
                onClick={handleTextInterview}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg backdrop-blur-sm"
              >
                <Mic className="h-4 w-4 mr-2" />
                Text Interview
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl card-entrance">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                      <div className="text-white">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Sessions */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Recent Practice Sessions
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    Your latest interview practice sessions and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentSessions.map((session) => (
                    <Card key={session.id} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:shadow-xl transition-all duration-300 fade-in">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 backdrop-blur-sm">
                              {session.type}
                            </Badge>
                            <span className="text-sm text-white/80">{session.industry}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-white/70" />
                            <span className="text-sm text-white/80">{session.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white/90">Performance Score</span>
                          <span className="text-sm font-bold text-blue-300">{session.score}%</span>
                        </div>
                        <Progress value={session.score} className="mb-3 bg-white/20" />
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white/80 flex-1 mr-4">{session.feedback}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSessionReview(session.id)}
                            className="text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Quick Actions & Recommendations */}
            <div className="space-y-6">
              {/* Quick Start */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="text-white">Quick Start</CardTitle>
                  <CardDescription className="text-white/80">
                    Jump into a practice session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleVoiceInterview}
                    className="w-full justify-start bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg backdrop-blur-sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Start Voice Interview
                  </Button>
                  <Button 
                    onClick={handleTextInterview}
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Start Text Interview
                  </Button>
                  <Button 
                    onClick={handleRandomPractice}
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Random Practice Question
                  </Button>
                  <Button 
                    onClick={handleQuickSession}
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    5-Minute Quick Session
                  </Button>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 hover:from-blue-500/25 hover:to-purple-500/25 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="text-black font-bold">Recommendations</CardTitle>
                  <CardDescription className="text-black/80 font-medium">
                    Based on your recent performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div 
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 hover:shadow-lg transition-all duration-300" 
                    onClick={handleTechnicalPractice}
                  >
                    <p className="text-sm font-medium text-black mb-1">Practice Technical Questions</p>
                    <p className="text-xs text-black/70">Your technical scores could improve with more practice</p>
                  </div>
                  <div 
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 hover:shadow-lg transition-all duration-300" 
                    onClick={handleResponseStructure}
                  >
                    <p className="text-sm font-medium text-black mb-1">Work on Response Structure</p>
                    <p className="text-xs text-black/70">Focus on clear, organized answers using frameworks</p>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Goal */}
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 hover:from-purple-500/25 hover:to-pink-500/25 transition-all duration-300 scale-in">
                <CardHeader>
                  <CardTitle className="text-black font-bold">Weekly Goal</CardTitle>
                  <CardDescription className="text-black/80 font-medium">
                    5 practice sessions this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={60} className="mb-3 bg-white/20" />
                  <div className="flex justify-between items-center">
                    <span className="text-black text-sm font-medium">3 of 5 completed</span>
                    <Badge className="bg-purple-500/30 text-purple-200 border-purple-500/40 font-semibold">
                      60%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
