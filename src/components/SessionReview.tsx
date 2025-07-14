import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star, TrendingUp, Clock, Target, CheckCircle, AlertTriangle } from "lucide-react";

interface SessionReviewProps {
  onBack: () => void;
  session?: any;
  sessionData?: any;
}

export const SessionReview = ({ onBack, session, sessionData }: SessionReviewProps) => {
  const mockSessionData = {
    date: new Date().toLocaleDateString(),
    duration: "25 minutes",
    industry: "Software Engineering",
    level: "Mid Level",
    type: "Technical",
    score: 85,
    questionsAnswered: 8,
    strengths: [
      "Clear communication",
      "Strong technical knowledge",
      "Good problem-solving approach"
    ],
    improvements: [
      "Practice system design questions",
      "Improve time complexity explanations",
      "Prepare more behavioral examples"
    ]
  };

  const data = session || sessionData || mockSessionData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden page-enter">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center mb-8 fade-in">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="mr-4 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 text-reveal">Session Review</h1>
              <p className="text-white/80 text-reveal">Review your interview performance and progress</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Overview */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    Session Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/80">Date:</span>
                        <span className="text-white font-medium">{data.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Duration:</span>
                        <span className="text-white font-medium">{data.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Industry:</span>
                        <span className="text-white font-medium">{data.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Level:</span>
                        <span className="text-white font-medium">{data.level || data.type}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">{data.score}</div>
                      <div className="text-cyan-200 mb-4">Overall Score</div>
                      <Progress value={data.score} className="bg-white/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Breakdown */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        Strengths
                      </h4>
                      <div className="space-y-2">
                        {(data.strengths || []).map((strength: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 fade-in">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-white/90 text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-orange-400" />
                        Areas for Improvement
                      </h4>
                      <div className="space-y-2">
                        {(data.improvements || []).map((improvement: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 fade-in">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-white/90 text-sm">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-500/30 hover:from-blue-500/25 hover:to-cyan-500/25 transition-all duration-300 card-entrance">
                <CardHeader>
                  <CardTitle className="text-black">Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/80">Questions Answered:</span>
                    <span className="font-medium text-black">{data.questionsAnswered || data.questions?.length || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/80">Average Response:</span>
                    <span className="font-medium text-black">2.5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/80">Confidence Level:</span>
                    <span className="font-medium text-black">High</span>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 hover:from-green-500/25 hover:to-emerald-500/25 transition-all duration-300 scale-in">
                <CardHeader>
                  <CardTitle className="text-black">Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Practice System Design
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Behavioral Questions
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Mock Interview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
