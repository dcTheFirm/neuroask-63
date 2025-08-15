
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mic, CheckCircle, BarChart3, Users, Zap, BookOpen, Brain, LogOut } from "lucide-react";
import { useState } from "react";
import { InterviewSetup } from "@/components/InterviewSetup";
import { Dashboard } from "@/components/Dashboard";
import { VoiceInterview } from "@/components/VoiceInterview";
import { TextInterview } from "@/components/TextInterview";
import { SignIn } from "@/components/SignIn";
import { UserProfile } from "@/components/UserProfile";
import { LearnMore } from "@/components/LearnMore";

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'setup' | 'dashboard' | 'voice-interview' | 'text-interview' | 'signin' | 'profile' | 'learn-more'>('landing');
  const [interviewConfig, setInterviewConfig] = useState({
    industry: '',
    level: '',
    type: '',
    duration: ''
  });
  const [user, setUser] = useState<any>(null);

  const features = [
    {
      icon: <Mic className="h-8 w-8 text-cyan-400" />,
      title: "AI Voice Interviewer",
      description: "Practice with our intelligent AI interviewer that adapts to your responses and provides natural conversation flow."
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-400" />,
      title: "Text-Based Interview",
      description: "Chat with our AI interviewer through text messages for a comfortable interview experience."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-400" />,
      title: "Instant Feedback",
      description: "Get detailed feedback on your answers, including clarity, structure, and professional communication tips."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-400" />,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed analytics and performance insights."
    }
  ];

  const industries = [
    "Software Engineering", "Marketing", "Finance", "Healthcare", 
    "Sales", "Consulting", "Data Science", "Design", "Operations", "HR"
  ];

  const handleInterviewComplete = (config: { industry: string; level: string; type: string; duration: string }) => {
    setInterviewConfig(config);
    setCurrentView('dashboard');
  };

  const handleStartVoiceInterview = () => {
    if (!interviewConfig.industry) {
      setCurrentView('setup');
    } else {
      setCurrentView('voice-interview');
    }
  };

  const handleStartTextInterview = () => {
    if (!interviewConfig.industry) {
      setCurrentView('setup');
    } else {
      setCurrentView('text-interview');
    }
  };

  const handleSignIn = (userData: any) => {
    setUser(userData);
    setCurrentView('landing');
  };

  const handleGetStarted = () => {
    if (user) {
      if (interviewConfig.industry) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('setup');
      }
    } else {
      setCurrentView('signin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setInterviewConfig({
      industry: '',
      level: '',
      type: '',
      duration: ''
    });
    setCurrentView('landing');
  };

  if (currentView === 'signin') {
    return <SignIn onSignIn={handleSignIn} onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'profile') {
    return <UserProfile user={user} onBack={() => setCurrentView('dashboard')} onLogout={handleLogout} />;
  }

  if (currentView === 'learn-more') {
    return <LearnMore onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'setup') {
    return (
      <InterviewSetup 
        onBack={() => setCurrentView('landing')} 
        onComplete={handleInterviewComplete} 
      />
    );
  }

  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        user={user}
        onSignOut={handleLogout}
      />
    );
  }

  if (currentView === 'voice-interview') {
    return (
      <VoiceInterview
        onBack={() => setCurrentView('dashboard')}
        onComplete={() => setCurrentView('dashboard')}
        interviewConfig={interviewConfig}
      />
    );
  }

  if (currentView === 'text-interview') {
    return (
      <TextInterview
        onBack={() => setCurrentView('dashboard')}
        onComplete={() => setCurrentView('dashboard')}
        interviewConfig={interviewConfig}
      />
    );
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
        {/* Header */}
        <header className="container mx-auto px-6 py-6 fade-in">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Neuro Ask
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentView('profile')}
                    className="text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
                  >
                    {user.name || user.email}
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30 backdrop-blur-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentView('signin')}
                    className="text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-cyan-500/20 text-cyan-200 border-cyan-500/30 backdrop-blur-sm hover:bg-cyan-500/25 fade-in">
              <Zap className="h-4 w-4 mr-1" />
              AI-Powered Interview Practice
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent text-reveal">
              Master Your Next Interview with Neuro Ask
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto text-reveal">
              Practice with our intelligent AI interviewer, get instant feedback, and boost your confidence with personalized interview preparation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center scale-in">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start Practicing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setCurrentView('learn-more')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16 slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Choose Neuro Ask?</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to excel in your next interview
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl card-entrance">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-full w-fit border border-white/20">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Industries Section */}
        <section className="container mx-auto px-6 py-20">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-reveal">Practice for Any Industry</h2>
                <p className="text-lg text-white/80 text-reveal">
                  Tailored interview questions for your specific field and career level
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {industries.map((industry, index) => (
                  <Badge 
                    key={index} 
                    className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-500/30 hover:from-cyan-500/30 hover:to-blue-500/30 cursor-pointer transition-all duration-200 backdrop-blur-sm fade-in"
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md border border-cyan-500/30 hover:from-cyan-500/25 hover:to-blue-500/25 transition-all duration-300 scale-in">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
                  Ready to Ace Your Interview?
                </h2>
                <p className="text-xl mb-8 text-black/90 font-medium">
                  Join thousands of professionals who have improved their interview skills with Neuro Ask
                </p>
                <Button 
                  size="lg" 
                  onClick={() => user ? setCurrentView('dashboard') : setCurrentView('signin')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/20 fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
              <span className="font-semibold text-white">Neuro Ask</span>
            </div>
            <p className="text-white/70 text-sm">
              © 2024 Neuro Ask. Empowering careers through AI-powered practice.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
