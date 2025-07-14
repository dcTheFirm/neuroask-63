
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface RandomPracticeProps {
  onBack: () => void;
  interviewConfig: {
    industry: string;
    level: string;
    type: string;
    duration: string;
  };
}

export const RandomPractice = ({ onBack, interviewConfig }: RandomPracticeProps) => {
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const questionBank = {
    "Software Engineering": {
      behavioral: [
        "Tell me about a time when you had to debug a particularly challenging issue.",
        "Describe a situation where you had to work with a difficult team member on a coding project.",
        "Give me an example of when you had to learn a new technology quickly for a project.",
        "Tell me about a time when you had to make a trade-off between perfect code and meeting a deadline.",
        "Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder."
      ],
      technical: [
        "How would you implement a rate limiter for an API?",
        "Explain the difference between a stack and a queue, and when you'd use each.",
        "How would you design a URL shortener like bit.ly?",
        "What's the difference between SQL and NoSQL databases?",
        "How would you handle versioning in a REST API?"
      ]
    },
    general: [
      "Why are you interested in this position?",
      "What are your greatest strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "Tell me about yourself.",
      "Why are you leaving your current job?"
    ]
  };

  const getRandomQuestion = () => {
    const industry = interviewConfig.industry || "Software Engineering";
    const type = interviewConfig.type || "behavioral";
    
    let questions = questionBank.general;
    
    if (industry === "Software Engineering" && questionBank[industry]) {
      questions = questionBank[industry][type] || questionBank[industry].behavioral;
    }
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  };

  useEffect(() => {
    setCurrentQuestion(getRandomQuestion());
  }, [interviewConfig]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsCompleted(true);
      toast({
        title: "Time's up!",
        description: "Great job practicing! Review your answer and try another question.",
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, toast]);

  const startTimer = () => {
    setIsActive(true);
    setIsCompleted(false);
  };

  const resetQuestion = () => {
    setCurrentQuestion(getRandomQuestion());
    setAnswer("");
    setTimeLeft(180);
    setIsActive(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitAnswer = () => {
    setIsActive(false);
    setIsCompleted(true);
    toast({
      title: "Answer submitted!",
      description: "Great job! Your answer has been recorded for practice.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden page-enter">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 fade-in">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="mr-4 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white text-reveal">Random Practice Question</h1>
                <p className="text-white/80 text-reveal">Quick practice session for {interviewConfig.industry || "General"} interviews</p>
              </div>
            </div>
            <Button 
              onClick={resetQuestion} 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Question
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Question Card */}
              <div className="lg:col-span-2">
                <Card className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
                  <CardHeader>
                    <CardTitle className="text-white">Interview Question</CardTitle>
                    <CardDescription className="text-white/80">
                      Take your time to think, then start the timer when ready
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border-l-4 border-blue-500 mb-6 backdrop-blur-sm">
                      <p className="text-lg font-medium text-white">{currentQuestion}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-64 p-4 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm"
                        disabled={isCompleted}
                      />
                      
                      <div className="flex space-x-3">
                        {!isActive && !isCompleted && (
                          <Button 
                            onClick={startTimer} 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Start Timer
                          </Button>
                        )}
                        {isActive && (
                          <Button 
                            onClick={submitAnswer} 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Submit Answer
                          </Button>
                        )}
                        {isCompleted && (
                          <Button 
                            onClick={resetQuestion} 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Another Question
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timer and Tips */}
              <div className="space-y-6">
                {/* Timer */}
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 card-entrance">
                  <CardHeader>
                    <CardTitle className="text-white">Timer</CardTitle>
                    <CardDescription className="text-white/80">3 minutes to answer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${timeLeft < 30 ? 'text-red-400' : 'text-blue-400'}`}>
                        {formatTime(timeLeft)}
                      </div>
                      <div className={`text-sm ${isActive ? 'text-green-400' : 'text-white/60'}`}>
                        {isActive ? 'Timer running...' : isCompleted ? 'Time completed!' : 'Ready to start'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 hover:from-green-500/25 hover:to-emerald-500/25 transition-all duration-300 card-entrance">
                  <CardHeader>
                    <CardTitle className="text-black font-bold">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                        <span className="text-black font-medium">Use the STAR method (Situation, Task, Action, Result)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                        <span className="text-black font-medium">Be specific with examples and numbers</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                        <span className="text-black font-medium">Keep your answer focused and concise</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                        <span className="text-black font-medium">Practice speaking your answer aloud</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Progress */}
                <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 hover:from-blue-500/25 hover:to-purple-500/25 transition-all duration-300 scale-in">
                  <CardHeader>
                    <CardTitle className="text-black font-bold">Session Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-black/80 font-medium">Industry:</span>
                        <span className="font-bold text-black">{interviewConfig.industry || "General"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/80 font-medium">Level:</span>
                        <span className="font-bold text-black">{interviewConfig.level || "Entry"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/80 font-medium">Type:</span>
                        <span className="font-bold text-black">{interviewConfig.type || "Behavioral"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
