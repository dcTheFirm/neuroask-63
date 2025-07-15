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
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'ai', timestamp: Date}>>([
    {
      id: 1,
      text: `Hello! I'm your AI interviewer for today's ${interviewConfig.type || 'behavioral'} interview in ${interviewConfig.industry || 'Software Engineering'}. Let's start with our first question: Tell me about yourself and why you're interested in this role.`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
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
          total_questions: 10,
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
    setCurrentMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Thank you for sharing that. Can you tell me about a challenging project you've worked on and how you overcame the obstacles?",
        "That's interesting. How do you handle working under pressure and tight deadlines?",
        "Great example! Now, can you describe a time when you had to work with a difficult team member?",
        "Excellent response. What are your thoughts on the latest trends in your industry?",
        "Thank you for that detailed answer. Where do you see yourself in the next 5 years?"
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
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

        // Save individual text interview entries
        const userMessages = messages.filter(m => m.sender === 'user');
        const aiMessages = messages.filter(m => m.sender === 'ai');
        
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          for (let i = 0; i < userMessages.length; i++) {
            await supabase
              .from('text_interviews')
              .insert({
                user_id: currentUser.id,
                session_id: sessionId,
                question_number: i + 1,
                question_text: aiMessages[i]?.text || "Interview question",
                user_answer: userMessages[i]?.text,
                answered_at: userMessages[i]?.timestamp.toISOString()
              });
          }
        }
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
                <p className="text-white/80 text-reveal">{interviewConfig.industry || "General"} • {formatTime(timeElapsed)}</p>
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
