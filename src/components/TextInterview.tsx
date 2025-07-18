import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Mic, MicOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { analyzeInterviewWithGemini } from "@/utils/geminiAnalytics";

interface TextInterviewProps {
  onBack: () => void;
  onComplete: () => void;
  interviewConfig: {
    industry: string;
    level: string;
    type: string;
    duration: string;
  };
}

export const TextInterview = ({ onBack, onComplete, interviewConfig }: TextInterviewProps) => {
  // Get config with defaults
  const getConfigWithDefaults = () => ({
    industry: interviewConfig.industry || "Software Engineering",
    level: interviewConfig.level || "Mid-level", 
    type: interviewConfig.type || "Behavioral",
    duration: interviewConfig.duration || "15 minutes"
  });

  const config = getConfigWithDefaults();

  // Define dynamic questions based on interview type to avoid repetition
  const getQuestionsForType = (type: string, industry: string, level: string) => {
    const questionCategories = {
      behavioral: [
        "Tell me about a challenging project you've worked on and how you overcame the obstacles.",
        "Describe a time when you had to work with a difficult team member and how you resolved it.",
        "Tell me about a time when you failed at something and what you learned from it.",
        "How do you handle working under pressure and tight deadlines?",
        "Describe a situation where you had to adapt to a significant change at work.",
        "Tell me about a time when you had to convince someone to see things your way.",
        "How do you prioritize multiple tasks when everything seems urgent?",
        "Describe a time when you took initiative on a project.",
        "Tell me about a time when you received difficult feedback and how you handled it."
      ],
      technical: [
        `What are the key technical skills required for a ${level} role in ${industry}?`,
        "How do you stay updated with the latest technologies and trends in your field?",
        "Describe your approach to debugging and problem-solving.",
        "Tell me about a complex technical problem you solved recently.",
        "How do you ensure code quality and maintainability in your projects?",
        "What's your experience with version control and collaborative development?",
        "How do you approach learning new technologies or frameworks?",
        "Describe your testing strategy for ensuring software reliability.",
        "What's your experience with performance optimization?"
      ],
      leadership: [
        "Tell me about a time when you had to lead a team or project.",
        "How do you motivate team members who are struggling?",
        "Describe a situation where you had to make a difficult decision as a leader.",
        "How do you handle conflicts within your team?",
        "Tell me about a time when you had to delegate important tasks.",
        "How do you ensure effective communication within your team?",
        "Describe your approach to mentoring junior team members.",
        "Tell me about a time when you had to manage competing priorities.",
        "How do you foster innovation and creativity in your team?"
      ]
    };

    const generalQuestions = [
      `Tell me about yourself and why you're interested in this ${level} role in ${industry}.`,
      "What motivates you in your work and keeps you engaged?",
      "Where do you see yourself in the next 5 years?",
      `What excites you most about working in ${industry}?`,
      "What are your greatest strengths and how do they apply to this role?",
      "What's the most important lesson you've learned in your career so far?",
      "How do you handle work-life balance in a demanding field like ${industry}?",
      "Do you have any questions for me about this role or our company?"
    ];

    // Select questions based on type, with some randomization to avoid repetition
    const typeQuestions = questionCategories[type.toLowerCase() as keyof typeof questionCategories] || questionCategories.behavioral;
    
    // Shuffle arrays to provide variation
    const shuffledTypeQuestions = [...typeQuestions].sort(() => Math.random() - 0.5);
    const shuffledGeneralQuestions = [...generalQuestions].sort(() => Math.random() - 0.5);
    
    // Combine with opening question and mix type-specific with general questions
    const finalQuestions = [
      `Hello! I'm your AI interviewer for today's ${type} interview in ${industry}. Let's start with our first question: ${shuffledGeneralQuestions[0]}`,
      ...shuffledTypeQuestions.slice(0, 6), // Take 6 randomized type-specific questions
      ...shuffledGeneralQuestions.slice(1, 4) // Take 3 more general questions
    ];

    return finalQuestions;
  };

  const interviewQuestions = getQuestionsForType(config.type, config.industry, config.level);
  
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'ai', timestamp: Date, questionNumber?: number}>>([
    {
      id: 1,
      text: interviewQuestions[0],
      sender: 'ai',
      timestamp: new Date(),
      questionNumber: 1
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: currentUser.id,
          session_type: 'text',
          status: 'in_progress',
          total_questions: interviewQuestions.length,
          questions_answered: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: currentMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save this question-answer pair immediately to database
    await saveQuestionAnswer();
    
    setCurrentMessage("");
    setIsLoading(true);

    // Move to next question in sequence
    const nextQuestionIndex = currentQuestionIndex + 1;
    
    setTimeout(() => {
      if (nextQuestionIndex < interviewQuestions.length) {
        const aiMessage = {
          id: messages.length + 2,
          text: interviewQuestions[nextQuestionIndex],
          sender: 'ai' as const,
          timestamp: new Date(),
          questionNumber: nextQuestionIndex + 1
        };

        setMessages(prev => [...prev, aiMessage]);
        setCurrentQuestionIndex(nextQuestionIndex);
      } else {
        // Interview completed
        const completionMessage = {
          id: messages.length + 2,
          text: "Thank you for completing the interview! I have all the information I need. You can end the session when you're ready.",
          sender: 'ai' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
      }
      setIsLoading(false);
    }, 1500);
  };

  const saveQuestionAnswer = async () => {
    if (!sessionId) return;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Get the current AI question (the one being answered)
      const aiMessages = messages.filter(m => m.sender === 'ai');
      const currentQuestion = aiMessages[currentQuestionIndex];

      await supabase
        .from('text_interviews')
        .insert({
          user_id: currentUser.id,
          session_id: sessionId,
          question_number: currentQuestionIndex + 1,
          question_text: currentQuestion?.text || interviewQuestions[currentQuestionIndex],
          user_answer: currentMessage,
          answered_at: new Date().toISOString(),
          time_taken_seconds: Math.floor((new Date().getTime() - currentQuestion?.timestamp.getTime()) / 1000) || 0
        });

      console.log(`Saved Q${currentQuestionIndex + 1}: "${currentQuestion?.text}" A: "${currentMessage}"`);
    } catch (error) {
      console.error('Error saving question-answer:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndInterview = async () => {
    try {
      if (sessionId) {
        // Update session completion
        await supabase
          .from('practice_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration_seconds: timeElapsed,
            questions_answered: messages.filter(m => m.sender === 'user').length
          })
          .eq('id', sessionId);
      }

      toast({
        title: "Interview Completed!",
        description: "Great job! Your responses have been analyzed and saved.",
      });
      onComplete();
    } catch (error) {
      console.error('Error ending interview:', error);
      toast({
        title: "Interview Completed!",
        description: "Great job! Your responses have been analyzed.",
      });
      onComplete();
    }
  };

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
        <div className="container mx-auto px-6 py-6 max-w-4xl h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 fade-in">
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
                <h1 className="text-2xl font-bold text-white text-reveal">AI Text Interview</h1>
                <p className="text-white/80 text-reveal">{config.industry} • {formatTime(timeElapsed)}</p>
              </div>
            </div>
            <Button 
              onClick={handleEndInterview}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
            >
              End Interview
            </Button>
          </div>

          {/* Messages */}
          <Card className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up mb-4">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-white/60'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white border border-white/20 backdrop-blur-sm p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your response..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !currentMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
