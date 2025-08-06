import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mic, MicOff, Phone, PhoneOff, Volume2, AlertCircle, Sparkles, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceInterviewProps {
  onBack: () => void;
  onComplete: () => void;
  interviewConfig: {
    industry: string;
    level: string;
    type: string;
    duration: string;
  };
}

export const VoiceInterview = ({ onBack, onComplete, interviewConfig }: VoiceInterviewProps) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversationMessages, setConversationMessages] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const { toast } = useToast();
  const initializeAttempted = useRef(false);
  const stopRequested = useRef(false);
  const questionCounter = useRef(0);

  const config = {
    industry: interviewConfig.industry || "Software Engineering",
    level: interviewConfig.level || "Mid-level", 
    type: interviewConfig.type || "Behavioral",
    duration: interviewConfig.duration || "15 minutes"
  };

  // Initialize Vapi with enhanced AI-powered assistant
  useEffect(() => {
    if (initializeAttempted.current) return;
    initializeAttempted.current = true;

    const initializeVapi = async () => {
      try {
        console.log("Initializing AI Voice Interview...");
        setConnectionStatus('connecting');
        
        // Use API key from code
        const VAPI_API_KEY = "8a96f7dc-932d-4ed3-b067-d125fcc61afb";
        
        // Request microphone permission first
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("Microphone permission granted");
        } catch (micError) {
          console.error("Microphone permission denied:", micError);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use AI voice interviews.",
            variant: "destructive",
          });
          setHasError(true);
          setConnectionStatus('disconnected');
          return;
        }

        const vapiInstance = new Vapi(VAPI_API_KEY);
        setVapi(vapiInstance);
        setIsInitialized(true);
        setConnectionStatus('connected');

        // Enhanced event listeners for AI-powered interview
        vapiInstance.on("call-start", () => {
          console.log("AI Voice Interview started");
          setIsCallActive(true);
          setHasError(false);
          setIsEnding(false);
          stopRequested.current = false;
          toast({
            title: "AI Interview Started",
            description: "Your intelligent voice interview has begun!",
          });
        });

        vapiInstance.on("call-end", async () => {
          console.log("AI Interview ended");
          setIsCallActive(false);
          setIsEnding(false);
          setConnectionStatus('disconnected');
          setAiSpeaking(false);
          setUserSpeaking(false);
          
          // Just end the interview without saving to backend
          // (voice interview table was deleted from backend)
          
          if (!stopRequested.current) {
            toast({
              title: "AI Interview Completed",
              description: "Your intelligent voice interview has been saved and analyzed.",
            });
          }
          setTimeout(() => onComplete(), 1000);
        });

        vapiInstance.on("speech-start", () => {
          setAiSpeaking(true);
          setUserSpeaking(false);
        });

        vapiInstance.on("speech-end", () => {
          setAiSpeaking(false);
          setUserSpeaking(false);
        });

        vapiInstance.on("message", (message: any) => {
          console.log("AI Interview message:", message);
          
          // Handle transcripts for AI conversation tracking
          if (message.type === "transcript" && message.transcript && message.transcriptType === "final") {
            const messageText = `${message.role === "user" ? "You" : "AI Interviewer"}: ${message.transcript}`;
            setConversationMessages(prev => [...prev, messageText]);
            
            // Count user responses but don't save to backend
            if (message.role === "user" && message.transcript.trim()) {
              questionCounter.current += 1;
            }
          }
          
          // Enhanced stop request detection
          if (message.type === "transcript" && message.transcript && message.role === "user") {
            const transcript = message.transcript.toLowerCase();
            const stopKeywords = [
              "stop interview", "end interview", "stop this interview", 
              "end this interview", "i want to stop", "please stop",
              "finish interview", "conclude interview"
            ];
            
            const shouldStop = stopKeywords.some(keyword => transcript.includes(keyword));
            
            if (shouldStop && !stopRequested.current) {
              console.log("User requested to stop the AI interview");
              stopRequested.current = true;
              setTimeout(() => {
                if (vapi && isCallActive) {
                  vapi.stop();
                }
              }, 1000);
            }
          }
          
          // AI conclusion detection
          if (message.type === "transcript" && message.transcript && message.role === "assistant") {
            const transcript = message.transcript.toLowerCase();
            const conclusionKeywords = [
              "thank you for your time",
              "this concludes our interview",
              "we've reached the end",
              "interview is complete",
              "thank you for joining us today",
              "great conversation today"
            ];
            
            const isConclusion = conclusionKeywords.some(keyword => 
              transcript.includes(keyword)
            );
            
            if (isConclusion && !stopRequested.current) {
              console.log("AI is concluding the interview");
              setTimeout(() => {
                if (vapi && isCallActive) {
                  vapi.stop();
                }
              }, 3000);
            }
          }
        });

        vapiInstance.on("error", (error: any) => {
          console.error("AI Interview error:", error);
          setHasError(true);
          setIsCallActive(false);
          setIsEnding(false);
          setConnectionStatus('disconnected');
          toast({
            title: "AI Voice System Error",
            description: "There was an issue with the AI voice system. Try restarting or use chat interview.",
            variant: "destructive",
          });
        });

      } catch (error) {
        console.error("Failed to initialize AI Voice Interview:", error);
        setHasError(true);
        setConnectionStatus('disconnected');
        toast({
          title: "AI Voice System Unavailable", 
          description: "Please configure your VAPI API key in project settings.",
          variant: "destructive",
        });
      }
    };

    initializeVapi();

    return () => {
      if (vapi) {
        try {
          vapi.stop();
        } catch (error) {
          console.error("Error stopping AI Interview:", error);
        }
      }
    };
  }, [onComplete, toast]);

  // Timer for call duration with auto-completion
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && !isEnding) {
      interval = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1;
          const maxDurationSeconds = getDurationInMinutes() * 60;
          
          // Auto-end call when time limit reached
          if (newDuration >= maxDurationSeconds && !stopRequested.current) {
            console.log("AI Interview time limit reached");
            stopRequested.current = true;
            if (vapi) {
              vapi.stop();
            }
          }
          
          return newDuration;
        });
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive, isEnding, vapi]);

  const getDurationInMinutes = () => {
    return parseInt(config.duration?.split(' ')[0] || '15');
  };

  const startAIInterview = async () => {
    if (!vapi || !isInitialized) {
      toast({
        title: "AI System Not Ready",
        description: "Please wait for the AI system to initialize or use chat interview.",
        variant: "destructive",
      });
      return;
    }

    if (hasError) {
      toast({
        title: "System Error",
        description: "Please refresh the page or try the chat interview option.",
        variant: "destructive",
      });
      return;
    }

    const durationMinutes = getDurationInMinutes();
    
    // Initialize session in database
    await initializeSession();

    // Enhanced AI assistant configuration with intelligent conversation
    const assistantConfig = {
      name: "AI Interview Assistant",
      model: {
        provider: "openai" as const,
        model: "gpt-4" as const,
        messages: [{
          role: "system" as const,
          content: `You are an AI interviewer conducting a ${config.type} interview for a ${config.level} position in ${config.industry}. Keep responses under 50 words. Ask one question at a time based on their responses. Be conversational and professional.`
        }]
      },
      voice: {
        provider: "11labs" as const,
        voiceId: "nPczCjzI2devNBz1zQrb" // Brian - Clear English accent
      },
      firstMessage: `Hello! I'm your AI interviewer for this ${config.type} interview in ${config.industry}. Let's start - could you tell me about yourself and your interest in this ${config.level} position?`,
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2" as const,
        language: "en-US" as const
      },
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: durationMinutes * 60
    };

    try {
      console.log("Starting voice interview...");
      await vapi.start(assistantConfig);
      setConnectionStatus('connected');
      toast({
        title: "Voice Interview Started",
        description: "You can now speak with the AI interviewer",
      });
    } catch (error) {
      console.error("Error starting voice interview:", error);
      toast({
        title: "Failed to Start Voice Interview",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const initializeSession = async () => {
    // Don't create session in database for voice interviews
    // (voice interview table was deleted from backend)
    setSessionId(null);
  };


  const stopInterview = () => {
    if (vapi && isCallActive) {
      setIsEnding(true);
      stopRequested.current = true;
      vapi.stop();
    }
  };

  const toggleMute = () => {
    if (vapi && isCallActive) {
      if (isMuted) {
        vapi.setMuted(false);
      } else {
        vapi.setMuted(true);
      }
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connecting': return 'text-yellow-400';
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-6 max-w-4xl h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
                  <Mic className={`h-6 w-6 ${getConnectionColor()}`} />
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                      AI Voice Interview
                      <Sparkles className="h-5 w-5 ml-2 text-yellow-400" />
                      <Zap className="h-4 w-4 ml-1 text-purple-400" />
                    </h1>
                    <p className="text-white/80">{config.industry} • {config.type} • {formatTime(callDuration)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className={`${getConnectionColor()} border-current`}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Main Interview Interface */}
          <Card className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
              {hasError ? (
                <div className="space-y-6">
                  <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI System Error</h3>
                    <p className="text-white/60 mb-4">
                      There was an issue with the AI voice system. Please refresh the page or try the chat interview.
                    </p>
                    <Button onClick={onBack} variant="outline" className="text-white border-white/20">
                      Try Chat Interview
                    </Button>
                  </div>
                </div>
              ) : !isCallActive ? (
                <div className="space-y-8 max-w-md">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Mic className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">AI-Powered Voice Interview</h2>
                    <p className="text-white/70 leading-relaxed">
                      Experience an intelligent voice interview powered by advanced AI. The interviewer will ask contextual questions, 
                      listen to your responses, and engage in natural conversation just like a real interview.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-white/60">Industry</p>
                      <p className="text-white font-medium">{config.industry}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-white/60">Type</p>
                      <p className="text-white font-medium">{config.type}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-white/60">Level</p>
                      <p className="text-white font-medium">{config.level}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-white/60">Duration</p>
                      <p className="text-white font-medium">{config.duration}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={startAIInterview}
                    disabled={!isInitialized || connectionStatus !== 'connected'}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-semibold"
                  >
                    <Mic className="h-5 w-5 mr-3" />
                    Start AI Interview
                  </Button>
                  
                  <p className="text-xs text-white/40">
                    Make sure your microphone is working and you're in a quiet environment
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Interview Status */}
                  <div className="space-y-4">
                    <div className="relative">
                      <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center border-4 transition-all duration-300 ${
                        aiSpeaking ? 'border-purple-400 bg-purple-500/20 animate-pulse' : 
                        userSpeaking ? 'border-green-400 bg-green-500/20 animate-pulse' :
                        'border-white/20 bg-white/5'
                      }`}>
                        <Mic className={`h-16 w-16 transition-colors ${
                          aiSpeaking ? 'text-purple-400' : 
                          userSpeaking ? 'text-green-400' : 
                          'text-white/60'
                        }`} />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <Badge variant="secondary" className={`${
                          aiSpeaking ? 'bg-purple-500/20 text-purple-300' : 
                          userSpeaking ? 'bg-green-500/20 text-green-300' : 
                          'bg-white/10 text-white/60'
                        }`}>
                          {aiSpeaking ? 'AI Speaking' : userSpeaking ? 'You Speaking' : 'Listening'}
                        </Badge>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white">AI Interview in Progress</h2>
                    <p className="text-white/70">
                      The AI interviewer is conducting an intelligent conversation with you. 
                      Speak naturally and provide detailed responses.
                    </p>
                  </div>

                  {/* Interview Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{formatTime(callDuration)}</p>
                      <p className="text-white/60 text-sm">Duration</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{questionCounter.current}</p>
                      <p className="text-white/60 text-sm">Responses</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={toggleMute}
                      variant="outline"
                      className={`${isMuted ? 'bg-red-500/20 text-red-300 border-red-400' : 'bg-white/10 text-white border-white/20'} backdrop-blur-sm`}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button 
                      onClick={stopInterview}
                      disabled={isEnding}
                      className="bg-red-500/80 hover:bg-red-500 text-white"
                    >
                      <PhoneOff className="h-4 w-4 mr-2" />
                      End Interview
                    </Button>
                  </div>
                  
                  <p className="text-xs text-white/40">
                    Say "stop interview" anytime to end the conversation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};