import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Bot, MessageCircle, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const config = {
    industry: interviewConfig.industry || "Software Engineering",
    level: interviewConfig.level || "Mid-level", 
    type: interviewConfig.type || "Behavioral",
    duration: interviewConfig.duration || "15 minutes"
  };

  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'ai', timestamp: Date, isTyping?: boolean}>>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiRef = useRef<GoogleGenerativeAI | null>(null);
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

  // Initialize AI and session
  useEffect(() => {
    initializeAI();
    initializeSession();
  }, []);

  const initializeAI = async () => {
    try {
      geminiRef.current = new GoogleGenerativeAI('AIzaSyDZHg1gfTJZNOsWrKGHpKDCPr0tq4wZY6s');
      setIsConnected(true);
      
      // Start the interview with AI greeting
      const welcomeMessage = await generateWelcomeMessage();
      setMessages([{
        id: 1,
        text: welcomeMessage,
        sender: 'ai',
        timestamp: new Date()
      }]);
      
      toast({
        title: "AI Interview Ready",
        description: "Your AI interviewer is ready to begin!",
      });
    } catch (error) {
      console.error('Error initializing AI:', error);
      toast({
        title: "AI Connection Failed",
        description: "Falling back to basic interview mode.",
        variant: "destructive"
      });
    }
  };

  const generateWelcomeMessage = async (): Promise<string> => {
    try {
      if (!geminiRef.current) throw new Error('AI not initialized');
      
      const model = geminiRef.current.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `You are an experienced ${config.industry} interviewer starting a ${config.type} interview for a ${config.level} position. 

Create a warm, professional welcome message that:
- Introduces yourself as an AI interviewer
- Sets expectations for the ${config.duration} interview
- Makes the candidate feel comfortable
- Explains the interactive nature of the interview
- Asks an engaging opening question based on their background

Keep it conversational and under 100 words. End with your first question.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating welcome:', error);
      return `Hello! I'm your AI interviewer for today's ${config.type} interview in ${config.industry}. This will be an interactive conversation lasting about ${config.duration}. I'll ask thoughtful questions based on your responses, so please share specific examples and experiences. Ready to begin? Tell me about yourself and what brings you to this ${config.level} role in ${config.industry}.`;
    }
  };

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
          total_questions: 0, // Dynamic AI questions
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

  const generateAIResponse = async (userResponse: string): Promise<string> => {
    try {
      if (!geminiRef.current) throw new Error('AI not initialized');
      
      const model = geminiRef.current.getGenerativeModel({ model: 'gemini-pro' });
      const context = conversationHistory.slice(-6).join('\n'); // Keep last 6 exchanges
      
      const prompt = `You are conducting a ${config.type} interview for a ${config.level} position in ${config.industry}. 

Recent conversation:
${context}

Candidate's latest response: "${userResponse}"

Based on their response, generate an intelligent follow-up. You can:
1. Ask a deeper follow-up question about what they just shared
2. Probe for specific examples or metrics
3. Explore a related but different topic
4. Ask about challenges, learnings, or outcomes
5. Test their knowledge or problem-solving approach

Guidelines:
- Be conversational and encouraging
- Ask only ONE question at a time
- Make it relevant to their experience level (${config.level})
- Focus on ${config.type} aspects
- Keep responses under 80 words
- Show you're listening by referencing their previous answers

After ${questionCount >= 8 ? 'asking 2-3 more questions' : questionCount >= 6 ? 'a few more questions' : 'several more questions'}, you can conclude the interview naturally.

${questionCount >= 10 ? 'IMPORTANT: Consider wrapping up the interview soon with a final question or thank them for their time.' : ''}

Generate only your response, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "Thank you for sharing that. Could you tell me more about a specific challenge you've faced in your career and how you overcame it?";
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: currentMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation history
    const lastAIMessage = messages.filter(m => m.sender === 'ai').slice(-1)[0]?.text || '';
    setConversationHistory(prev => [...prev, `AI: ${lastAIMessage}`, `User: ${currentMessage}`]);
    
    const responseText = currentMessage;
    setCurrentMessage("");
    setIsLoading(true);
    setIsAIThinking(true);

    // Save user response
    await saveUserResponse(responseText);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(responseText);
      
      setTimeout(() => {
        const aiMessage = {
          id: messages.length + 2,
          text: aiResponse,
          sender: 'ai' as const,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setQuestionCount(prev => prev + 1);
        setIsLoading(false);
        setIsAIThinking(false);
      }, 1000 + Math.random() * 1000); // Simulate thinking time
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsLoading(false);
      setIsAIThinking(false);
      toast({
        title: "AI Error",
        description: "There was an issue generating the next question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveUserResponse = async (response: string) => {
    if (!sessionId) return;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      await supabase
        .from('text_interviews')
        .insert({
          user_id: currentUser.id,
          session_id: sessionId,
          question_number: questionCount + 1,
          question_text: messages.filter(m => m.sender === 'ai').slice(-1)[0]?.text || 'Initial question',
          user_answer: response,
          answered_at: new Date().toISOString(),
          time_taken_seconds: 30 // Approximate time per response
        });

    } catch (error) {
      console.error('Error saving response:', error);
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
        await supabase
          .from('practice_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration_seconds: timeElapsed,
            questions_answered: questionCount
          })
          .eq('id', sessionId);
      }

      toast({
        title: "Interview Completed!",
        description: "Great job! Your AI interview session has been saved.",
      });
      onComplete();
    } catch (error) {
      console.error('Error ending interview:', error);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-6 max-w-4xl h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="mr-4 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Bot className={`h-6 w-6 ${isConnected ? 'text-green-400' : 'text-gray-400'}`} />
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                      AI Chat Interview
                      <Sparkles className="h-5 w-5 ml-2 text-yellow-400" />
                    </h1>
                    <p className="text-white/80">{config.industry} • {config.type} • {formatTime(timeElapsed)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-white/60">Questions</p>
                <p className="text-lg font-semibold text-white">{questionCount}</p>
              </div>
              <Button 
                onClick={handleEndInterview}
                variant="outline"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30 backdrop-blur-sm"
              >
                End Interview
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          <Card className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!isConnected && (
                  <div className="text-center p-8">
                    <MessageCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Connecting to AI interviewer...</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.sender === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="h-4 w-4 text-blue-400" />
                          <span className="text-xs text-white/60">AI Interviewer</span>
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white ml-4'
                            : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm mr-4'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-white/50'}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isAIThinking && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                    <div className="max-w-[85%] mr-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bot className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-white/60">AI Interviewer is thinking...</span>
                      </div>
                      <div className="bg-white/10 text-white border border-white/20 backdrop-blur-sm p-4 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-white/10 p-6 bg-white/5 backdrop-blur-sm">
                <div className="flex space-x-4">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your response here..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading || !isConnected}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12 text-base"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !currentMessage.trim() || !isConnected}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12 px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-white/40 mt-2">Press Enter to send • Powered by Gemini AI</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};