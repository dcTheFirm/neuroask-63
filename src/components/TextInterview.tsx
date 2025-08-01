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
      
      // Initialize conversation history
      setConversationHistory([]);
      
      // Start the interview with AI greeting
      const welcomeMessage = await generateWelcomeMessage();
      setMessages([{
        id: 1,
        text: welcomeMessage,
        sender: 'ai',
        timestamp: new Date()
      }]);
      
      // Add welcome to conversation history
      setConversationHistory([`AI: ${welcomeMessage}`]);
      
      toast({
        title: "AI Interview Ready",
        description: "Your intelligent AI interviewer is ready to begin!",
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
      
      // Build comprehensive conversation context
      const fullContext = conversationHistory.join('\n');
      const currentQuestionNum = questionCount + 1;
      
      const prompt = `You are an advanced AI interviewer conducting a ${config.type} interview for a ${config.level} position in ${config.industry}. 

INTERVIEW CONTEXT:
- Question #${currentQuestionNum}
- Experience Level: ${config.level}
- Industry: ${config.industry}
- Interview Type: ${config.type}
- Duration: ${config.duration}

FULL CONVERSATION HISTORY:
${fullContext}

CANDIDATE'S LATEST RESPONSE: "${userResponse}"

CRITICAL INSTRUCTIONS:
1. NEVER repeat previous questions - analyze the conversation history to ensure uniqueness
2. Build intelligently on their specific response with contextual follow-ups
3. Use advanced reasoning to identify gaps or opportunities for deeper exploration
4. Generate unique, thoughtful questions that demonstrate AI intelligence
5. Reference specific details from their answers to show active listening

INTELLIGENT QUESTIONING STRATEGY:
- If they mentioned specific technologies/methods, probe deeper into implementation details
- If they described a situation, ask about decision-making process or alternative approaches
- If they discussed outcomes, explore metrics, lessons learned, or improvements
- If they seem surface-level, dig for concrete examples and specifics
- If they show expertise, challenge with more complex scenarios

${config.type === 'behavioral' ? `
BEHAVIORAL INTELLIGENCE:
- Probe for STAR method details if missing (Situation, Task, Action, Result)
- Explore leadership moments, conflict resolution, team dynamics
- Ask about failures, difficult decisions, and learning experiences
- Investigate cultural fit and value alignment scenarios
` : ''}

${config.type === 'technical' ? `
TECHNICAL INTELLIGENCE:
- Assess depth of understanding vs surface knowledge
- Explore architecture decisions, trade-offs, and best practices
- Probe problem-solving methodology and debugging approaches  
- Test scalability, performance, and optimization thinking
` : ''}

${config.type === 'leadership' ? `
LEADERSHIP INTELLIGENCE:
- Explore management philosophy and team building strategies
- Investigate difficult people/performance management scenarios
- Assess strategic thinking and vision communication
- Probe delegation, motivation, and organizational change
` : ''}

CONVERSATION GUIDELINES:
- Keep responses under 60 words
- Ask only ONE specific question
- Show genuine interest and engagement
- Be encouraging while maintaining professional standards
- Reference their previous answers to demonstrate listening

INTERVIEW FLOW MANAGEMENT:
${currentQuestionNum <= 3 ? '- Focus on foundational experience and background' : ''}
${currentQuestionNum >= 4 && currentQuestionNum <= 7 ? '- Dive deep into specific experiences and competencies' : ''}
${currentQuestionNum >= 8 && currentQuestionNum <= 10 ? '- Explore advanced scenarios and decision-making' : ''}
${currentQuestionNum >= 11 ? '- Begin wrapping up with final insights or closing questions' : ''}

${currentQuestionNum >= 12 ? 'IMPORTANT: Consider concluding the interview gracefully with a thank you message.' : ''}

Generate only your intelligent response as the AI interviewer, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text().trim();
      
      // Ensure we don't repeat questions by checking against history
      const isRepetitive = conversationHistory.some(msg => 
        msg.includes('AI:') && 
        msg.toLowerCase().includes(aiResponse.toLowerCase().substring(0, 30))
      );
      
      if (isRepetitive && currentQuestionNum < 12) {
        // Generate alternative question
        const alternativePrompt = `The previous response might be repetitive. Generate a completely different, unique question about ${config.type} interview topics for ${config.industry} that hasn't been asked before. Reference their recent response: "${userResponse}". Be specific and avoid generic questions.`;
        const altResult = await model.generateContent(alternativePrompt);
        const altResponse = await altResult.response;
        return altResponse.text().trim();
      }
      
      return aiResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return `Thank you for that insight. Can you walk me through a specific example where you had to ${config.type === 'technical' ? 'solve a complex technical problem' : config.type === 'leadership' ? 'lead a difficult initiative' : 'handle a challenging situation'} in your ${config.industry} experience?`;
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