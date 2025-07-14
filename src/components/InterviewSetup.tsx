
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings, Clock, Target, Lightbulb } from "lucide-react";
import { useState } from "react";

interface InterviewSetupProps {
  onBack: () => void;
  onComplete: (config: { industry: string; level: string; type: string; duration: string }) => void;
}

export const InterviewSetup = ({ onBack, onComplete }: InterviewSetupProps) => {
  const [industry, setIndustry] = useState("");
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");

  const industries = [
    "Software Engineering", "Marketing", "Finance", "Healthcare", 
    "Sales", "Consulting", "Data Science", "Design", "Operations", "HR"
  ];

  const levels = ["Entry Level", "Mid Level", "Senior Level", "Executive"];
  const types = ["Behavioral", "Technical", "Mixed"];
  const durations = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];

  const handleStart = () => {
    if (industry && level && type && duration) {
      onComplete({ industry, level, type, duration });
    }
  };

  const proTips = [
    "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
    "Practice speaking your answers aloud before the actual interview",
    "Research the company and role thoroughly beforehand",
    "Prepare specific examples that demonstrate your skills and experience",
    "Ask thoughtful questions about the role and company culture"
  ];

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
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="fade-in mb-8">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="mr-4 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-full border border-cyan-500/30 mb-6">
                <Settings className="h-4 w-4 mr-2 text-cyan-400" />
                <span className="text-cyan-200 font-medium">Customize Your Interview</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-reveal">
                Set Up Your Perfect Interview
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto text-reveal">
                Customize your interview experience to match your career goals and get the most relevant practice
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Setup Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="text-white">Interview Configuration</CardTitle>
                  <CardDescription className="text-white/80">
                    Tell us about your interview preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Industry</label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind} className="text-white hover:bg-white/10">
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Experience Level</label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                        {levels.map((lvl) => (
                          <SelectItem key={lvl} value={lvl} className="text-white hover:bg-white/10">
                            {lvl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Interview Type</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <SelectValue placeholder="Select interview type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                        {types.map((t) => (
                          <SelectItem key={t} value={t} className="text-white hover:bg-white/10">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">Duration</label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 border-white/20 backdrop-blur-md">
                        {durations.map((d) => (
                          <SelectItem key={d} value={d} className="text-white hover:bg-white/10">
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleStart} 
                    disabled={!industry || !level || !type || !duration}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Interview Practice
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pro Tips Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 hover:from-purple-500/25 hover:to-pink-500/25 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center text-black">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                    💡 Pro Tips
                  </CardTitle>
                  <CardDescription className="text-black/90">
                    Expert advice for interview success
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {proTips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2 fade-in">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-black leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 hover:from-green-500/25 hover:to-emerald-500/25 transition-all duration-300 slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center text-black font-bold">
                    <Target className="h-5 w-5 mr-2 text-green-400" />
                    Ready to Ace Your Interview?
                  </CardTitle>
                  <CardDescription className="text-black/80 font-medium">
                    Quick tips to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIndustry("Software Engineering");
                      setLevel("Mid Level");
                      setType("Technical");
                      setDuration("30 minutes");
                    }}
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Tech Interview (30 min)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIndustry("Marketing");
                      setLevel("Entry Level");
                      setType("Behavioral");
                      setDuration("15 minutes");
                    }}
                    className="w-full justify-start bg-white/10 hover:bg-white/20 text-black border-white/20 backdrop-blur-sm"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Entry Level (15 min)
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
