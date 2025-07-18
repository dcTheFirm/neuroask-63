
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mic, MicOff, Phone, PhoneOff, Volume2, AlertCircle, Globe, X } from "lucide-react";
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
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isEnding, setIsEnding] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const initializeAttempted = useRef(false);
  const stopRequested = useRef(false);
  const questionCounter = useRef(0);

  const languages = [
    { code: "en", name: "English", vapiLocale: "en-US" as const }
  ];

  // Initialize Vapi with improved error handling
  useEffect(() => {
    if (initializeAttempted.current) return;
    initializeAttempted.current = true;

    const initializeVapi = async () => {
      try {
        console.log("Initializing Vapi...");
        
        // Request microphone permission first
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("Microphone permission granted");
        } catch (micError) {
          console.error("Microphone permission denied:", micError);
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice interviews.",
            variant: "destructive",
          });
          setHasError(true);
          return;
        }

        const vapiInstance = new Vapi("8a96f7dc-932d-4ed3-b067-d125fcc61afb");
        setVapi(vapiInstance);
        setIsInitialized(true);

        // Set up event listeners with improved error handling
        vapiInstance.on("call-start", () => {
          console.log("Call started successfully");
          setIsCallActive(true);
          setHasError(false);
          setIsEnding(false);
          stopRequested.current = false;
          toast({
            title: "Interview Started",
            description: "Your AI interview has begun. Speak clearly!",
          });
        });

        vapiInstance.on("call-end", async () => {
          console.log("Call ended");
          setIsCallActive(false);
          setIsEnding(false);
          
          // Update session completion
          if (sessionId) {
            try {
              await supabase
                .from('practice_sessions')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  duration_seconds: callDuration,
                  questions_answered: questionCounter.current
                })
                .eq('id', sessionId);
            } catch (error) {
              console.error('Error updating session:', error);
            }
          }
          
          if (!stopRequested.current) {
            toast({
              title: "Interview Completed",
              description: "Your interview session has ended and been saved.",
            });
          }
          setTimeout(() => onComplete(), 1000);
        });

        vapiInstance.on("message", (message: any) => {
          console.log("Vapi message:", message);
          
          // Handle all transcript types to improve voice recognition
          if (message.type === "transcript" && message.transcript) {
            // Log all transcripts for debugging
            console.log(`Transcript (${message.transcriptType}):`, message.transcript, "Role:", message.role);
            
            // Only save final transcripts to avoid duplicates
            if (message.transcriptType === "final") {
              const messageText = `${message.role === "user" ? "You" : "Interviewer"}: ${message.transcript}`;
              setConversationMessages(prev => [...prev, messageText]);
              
              // Save voice interview data for user responses only
              if (sessionId && message.role === "user" && message.transcript.trim()) {
                questionCounter.current += 1;
                saveVoiceInterviewData(message.transcript, questionCounter.current);
              }
            }
          }
          
          // Enhanced speech detection for better voice recognition
          if (message.type === "speech-update") {
            console.log("Speech update:", message.status, "Role:", message.role);
          }
          
          // Check for stop requests from user - only if transcript exists
          if (message.type === "transcript" && message.transcript && message.role === "user") {
            const transcript = message.transcript.toLowerCase();
            const stopKeywords = [
              "stop interview", "end interview", "stop this interview", 
              "end this interview", "i want to stop", "please stop",
              "साक्षात्कार बंद करो", "साक्षात्कार समाप्त करो", "रोको"
            ];
            
            const shouldStop = stopKeywords.some(keyword => transcript.includes(keyword));
            
            if (shouldStop && !stopRequested.current) {
              console.log("User requested to stop the interview");
              stopRequested.current = true;
              setTimeout(() => {
                if (vapi && isCallActive) {
                  vapi.stop();
                }
              }, 1000);
            }
          }
          
          // Check if AI is concluding the interview - only if transcript exists
          if (message.type === "transcript" && message.transcript && message.role === "assistant") {
            const transcript = message.transcript.toLowerCase();
            const conclusionKeywords = [
              "thank you for your time",
              "this concludes our interview",
              "we've reached the end",
              "interview is complete",
              "thank you for joining us today",
              "आपका समय देने के लिए धन्यवाद",
              "यह हमारा साक्षात्कार समाप्त होता है"
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
          
          // Handle conversation-end messages
          if (message.type === "conversation-end" || message.type === "session-complete") {
            console.log("Session completed by AI");
            setTimeout(() => {
              setIsCallActive(false);
              onComplete();
            }, 1000);
          }
        });

        vapiInstance.on("error", (error: any) => {
          console.error("Vapi error:", error);
          setHasError(true);
          setIsCallActive(false);
          setIsEnding(false);
          toast({
            title: "Voice Interview Error",
            description: "There was an issue with the voice system. Try restarting or use text interview.",
            variant: "destructive",
          });
        });

      } catch (error) {
        console.error("Failed to initialize Vapi:", error);
        setHasError(true);
        toast({
          title: "Voice System Unavailable",
          description: "Voice interviews are currently unavailable. Please use the text interview option.",
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
          console.error("Error stopping Vapi:", error);
        }
      }
    };
  }, [onComplete, toast]);

  // Timer for call duration - modified to handle auto-completion
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive && !isEnding) {
      interval = setInterval(() => {
        setCallDuration(prev => {
          const newDuration = prev + 1;
          const maxDurationSeconds = getDurationInMinutes() * 60;
          
          // Auto-end call when time limit reached
          if (newDuration >= maxDurationSeconds && !stopRequested.current) {
            console.log("Time limit reached, ending call");
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
    return parseInt(interviewConfig.duration?.split(' ')[0] || '15');
  };
  
  // Get config with defaults
  const getConfigWithDefaults = () => ({
    industry: interviewConfig.industry || "Software Engineering",
    level: interviewConfig.level || "Mid-level", 
    type: interviewConfig.type || "Behavioral",
    duration: interviewConfig.duration || "15 minutes"
  });

  const startInterview = async () => {
    if (!vapi || !isInitialized) {
      toast({
        title: "Voice System Not Ready",
        description: "Please wait for the system to initialize or use text interview.",
        variant: "destructive",
      });
      return;
    }

    if (hasError) {
      toast({
        title: "System Error",
        description: "Please refresh the page or try the text interview option.",
        variant: "destructive",
      });
      return;
    }

    const durationMinutes = getDurationInMinutes();
    const currentLanguage = languages.find(lang => lang.code === selectedLanguage);
    const config = getConfigWithDefaults();

    // Enhanced assistant configuration with language support
    const assistantConfig = {
      name: `${config.type} Interview Assistant`,
      model: {
        provider: "openai" as const,
        model: "gpt-4" as const,
        messages: [
          {
            role: "system" as const,
            content: selectedLanguage === "hi" 
              ? `आप एक अनुभवी ${config.industry} साक्षात्कारकर्ता हैं जो ${config.level} पद के लिए ${config.type} साक्षात्कार ले रहे हैं। साक्षात्कार लगभग ${durationMinutes} मिनट का होना चाहिए।

आपकी भूमिका:
- एक गर्मजोशी भरे, पेशेवर अभिवादन के साथ शुरुआत करें
- उद्योग (${config.industry}) और स्तर (${config.level}) के आधार पर प्रासंगिक साक्षात्कार प्रश्न पूछें
- उत्तरों को ध्यान से सुनें और विचारशील फॉलो-अप प्रश्न पूछें
- बातचीत को प्राकृतिक, पेशेवर और आकर्षक रखें
- साक्षात्कार को ${durationMinutes}-मिनट की समय सीमा में फिट करने के लिए गति निर्धारित करें
- तकनीकी कौशल और सांस्कृतिक फिट दोनों का परीक्षण करने वाले प्रश्न पूछें

IMPORTANT: प्रत्येक साक्षात्कार के लिए अलग-अलग प्रश्न चुनें। पुराने प्रश्नों को दोहराने से बचें। अपने प्रश्नों को उम्मीदवार के उत्तरों के आधार पर अनुकूलित करें।

${config.type === 'behavioral' ? 'व्यवहारिक प्रश्न उदाहरण: किसी चुनौतीपूर्ण परियोजना के बारे में बताएं, टीम संघर्ष को कैसे संभालते हैं, दबाव में काम करने का अनुभव।' : ''}
${config.type === 'technical' ? 'तकनीकी प्रश्न उदाहरण: आपकी समस्या निवारण विधि, नई तकनीकों के साथ अनुभव, कोड गुणवत्ता सुनिश्चित करने के तरीके।' : ''}
${config.type === 'leadership' ? 'नेतृत्व प्रश्न उदाहरण: टीम का नेतृत्व कैसे करते हैं, कठिन निर्णय लेने का अनुभव, संघर्ष प्रबंधन।' : ''}

महत्वपूर्ण समय:
- ${Math.max(durationMinutes-2, 1)} मिनट के बाद, साक्षात्कार को समाप्त करना शुरू करें
- अगर उम्मीदवार कहता है "साक्षात्कार बंद करो" या "रोको", तुरंत विनम्रता से साक्षात्कार समाप्त करें
- अंत में कहें "आज आपका समय देने के लिए धन्यवाद। यह हमारा साक्षात्कार समाप्त होता है।"

दिशानिर्देश:
- अपने उत्तर संक्षिप्त लेकिन पेशेवर रखें (50 शब्दों के तहत)
- एक समय में एक प्रश्न पूछें
- उनके उत्तरों में रुचि दिखाएं
- एक सहायक लेकिन पेशेवर स्वर बनाए रखें

शुरुआत इसके साथ करें: "नमस्ते! आज हमारे साथ जुड़ने के लिए धन्यवाद। मैं ${config.industry} में आपके बारे में और आपके अनुभव के बारे में जानने के लिए उत्साहित हूं। आइए शुरुआत करते हैं।"`
              : `You are an experienced ${config.industry} interviewer conducting a ${config.type} interview for a ${config.level} position. The interview should last approximately ${durationMinutes} minutes.

Your role:
- Start with a warm, professional greeting
- Ask relevant interview questions based on the industry (${config.industry}) and level (${config.level})
- Listen carefully to responses and ask thoughtful follow-up questions
- Keep the conversation natural, professional, and engaging
- Pace the interview to fit the ${durationMinutes}-minute timeframe
- Ask questions that test both technical skills and cultural fit
- Provide encouraging feedback when appropriate

IMPORTANT: Choose different questions for each interview. Avoid repeating previous questions. Adapt your questions based on the candidate's responses to ensure a unique and engaging conversation.

${config.type === 'behavioral' ? 'Behavioral question examples: Tell me about a challenging project, how you handle team conflicts, experience working under pressure, times when you failed and learned, adapting to change.' : ''}
${config.type === 'technical' ? 'Technical question examples: Your problem-solving approach, experience with new technologies, ensuring code quality, debugging strategies, performance optimization.' : ''}
${config.type === 'leadership' ? 'Leadership question examples: Leading a team, making difficult decisions, conflict management, motivating struggling team members, delegation strategies.' : ''}

IMPORTANT TIMING:
- After ${Math.max(durationMinutes-2, 1)} minutes, start wrapping up the interview
- If the candidate says "stop interview" or "end interview", politely conclude immediately
- At the end, say "Thank you for your time today. This concludes our interview. We'll be in touch with next steps."

Guidelines:
- Keep your responses concise but professional (under 50 words)
- Ask one question at a time
- Show interest in their responses
- Maintain a supportive but professional tone
- If they seem nervous, be encouraging
- Vary your questions to ensure each interview is unique

Start with: "Hello! Thank you for joining us today. I'm excited to learn more about you and your experience in ${config.industry}. Let's begin with you telling me a bit about yourself and what interests you about this ${config.level} position."`
          }
        ],
        temperature: 0.7,
        maxTokens: 150
      },
      voice: {
        provider: "11labs" as const,
        voiceId: selectedLanguage === "hi" ? "pFZP5JQG7iQjIQuC4Bku" : "21m00Tcm4TlvDq8ikWAM",
        stability: 0.8,
        similarityBoost: 0.8
      },
      firstMessage: selectedLanguage === "hi" 
        ? `नमस्ते! आज हमारे साथ जुड़ने के लिए धन्यवाद। मैं ${config.industry} में आपके बारे में और आपके अनुभव के बारे में जानने के लिए उत्साहित हूं। आइए शुरुआत करते हैं - क्या आप अपने बारे में थोड़ा बता सकते हैं?`
        : `Hello! Thank you for joining us today. I'm excited to learn more about you and your experience in ${config.industry}. Let's begin - can you tell me a bit about yourself and what interests you about this ${config.level} position?`,
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2" as const,
        language: currentLanguage?.vapiLocale || ("en-US" as const),
        keywords: ["interview", "question", "answer", "experience", "project", "challenge"]
      }
    };

    try {
      console.log("Starting Vapi call with config:", assistantConfig);
      setConversationMessages([]);
      stopRequested.current = false;
      questionCounter.current = 0;
      
      // Initialize session before starting
      await initializeSession();
      
      await vapi.start(assistantConfig);
    } catch (error) {
      console.error("Failed to start interview:", error);
      setHasError(true);
      toast({
        title: "Failed to Start Voice Interview",
        description: "Please check your microphone and internet connection, then try again.",
        variant: "destructive",
      });
    }
  };

  const endInterview = async () => {
    if (vapi && isCallActive) {
      try {
        setIsEnding(true);
        stopRequested.current = true;
        toast({
          title: "Ending Interview",
          description: "Your interview is being concluded...",
        });
        await vapi.stop();
      } catch (error) {
        console.error("Error ending interview:", error);
        setIsCallActive(false);
        setIsEnding(false);
      }
    }
  };

  const toggleMute = async () => {
    if (vapi && isCallActive) {
      try {
        await vapi.setMuted(!isMuted);
        setIsMuted(!isMuted);
        toast({
          title: isMuted ? "Unmuted" : "Muted",
          description: isMuted ? "You can now speak" : "Your microphone is muted",
        });
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeSession = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: currentUser.id,
          session_type: 'voice',
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

  const saveVoiceInterviewData = async (transcript: string, questionNumber: number) => {
    if (!sessionId) return;
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Get the last AI question from conversation messages
      const aiMessages = conversationMessages.filter(msg => msg.startsWith("Interviewer:"));
      const lastQuestion = aiMessages[aiMessages.length - 1]?.replace("Interviewer: ", "") || "Interview question";

      await supabase
        .from('voice_interviews')
        .insert({
          user_id: currentUser.id,
          session_id: sessionId,
          question_number: questionNumber,
          question_text: lastQuestion,
          user_answer_transcript: transcript,
          answered_at: new Date().toISOString(),
          audio_duration_seconds: 0, // Will be updated if needed
          time_taken_seconds: callDuration
        });
      
      console.log(`Saved voice interview data for question ${questionNumber}: ${transcript}`);
    } catch (error) {
      console.error('Error saving voice interview data:', error);
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
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white text-reveal">AI Voice Interview</h1>
                <p className="text-white/80 text-reveal">Practice your interview skills with our AI interviewer</p>
              </div>
            </div>
            {isCallActive && (
              <div className="text-lg font-mono text-cyan-400 fade-in">
                {formatTime(callDuration)} / {interviewConfig.duration}
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Interview Configuration */}
            <Card className="mb-8 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 slide-up">
              <CardHeader>
                <CardTitle className="text-white">Interview Configuration</CardTitle>
                <CardDescription className="text-white/80">Your personalized interview setup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">
                    {interviewConfig.industry}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                    {interviewConfig.level}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                    {interviewConfig.type} Interview
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-500/30">
                    {interviewConfig.duration}
                  </Badge>
                </div>
                
              </CardContent>
            </Card>

            {/* Error State */}
            {hasError && (
              <Card className="mb-8 border-red-500/20 bg-red-500/10 backdrop-blur-md slide-up">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-red-300">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">Voice Interview Unavailable</h3>
                      <p className="text-sm">There's an issue with the voice system. Please try the text interview instead.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={onBack}
                    className="mt-4 bg-red-500/80 hover:bg-red-500/90 text-white"
                  >
                    Try Text Interview
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Voice Interview Interface */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Call Controls */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 card-entrance">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Volume2 className="h-5 w-5 mr-2" />
                    Voice Interview
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    {!isInitialized 
                      ? "Initializing voice system..."
                      : isCallActive 
                        ? "Interview in progress - speak naturally with the AI interviewer"
                        : "Click start to begin your voice interview session"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Call Status */}
                  <div className="text-center py-8">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                      isCallActive ? 'bg-cyan-500/20 animate-pulse border border-cyan-500/40' : hasError ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/10 border border-white/20'
                    }`}>
                      {isCallActive ? (
                        <Phone className="h-10 w-10 text-cyan-400" />
                      ) : hasError ? (
                        <AlertCircle className="h-10 w-10 text-red-400" />
                      ) : (
                        <PhoneOff className="h-10 w-10 text-white/70" />
                      )}
                    </div>
                    <div className="text-lg font-semibold mb-2 text-white">
                      {!isInitialized ? 'Initializing...' : 
                       isEnding ? 'Ending Interview...' :
                       isCallActive ? 'Interview Active' : 
                       hasError ? 'System Error' : 'Ready to Start'}
                    </div>
                    {isCallActive && (
                      <div className="text-2xl font-mono text-cyan-400">
                        {formatTime(callDuration)}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-4">
                    {!isCallActive && !hasError ? (
                      <Button 
                        onClick={startInterview}
                        disabled={!isInitialized}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {isInitialized ? 'Start Voice Interview' : 'Initializing...'}
                      </Button>
                    ) : isCallActive ? (
                      <>
                        <Button
                          onClick={toggleMute}
                          variant={isMuted ? "destructive" : "outline"}
                          size="lg"
                          disabled={isEnding}
                          className={isMuted ? "" : "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"}
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={endInterview}
                          variant="destructive"
                          size="lg"
                          disabled={isEnding}
                          className="bg-red-500/80 hover:bg-red-500/90"
                        >
                          {isEnding ? (
                            <>
                              <X className="h-4 w-4 mr-2 animate-spin" />
                              Ending...
                            </>
                          ) : (
                            <>
                              <PhoneOff className="h-4 w-4 mr-2" />
                              End Interview
                            </>
                          )}
                        </Button>
                      </>
                    ) : null}
                  </div>

                  {/* Alternative option */}
                  {!isCallActive && (
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <p className="text-sm text-white/70 mb-2">
                        {hasError ? "Voice system unavailable?" : "Prefer typing?"}
                      </p>
                      <Button 
                        onClick={onBack}
                        variant="outline" 
                        size="sm"
                        className="text-white border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      >
                        Try Text Interview Instead
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Live Conversation */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 card-entrance">
                <CardHeader>
                  <CardTitle className="text-white">Live Conversation</CardTitle>
                  <CardDescription className="text-white/80">Real-time transcript of your interview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-y-auto bg-white/5 rounded-lg p-4 space-y-2 border border-white/10">
                    {conversationMessages.length === 0 ? (
                      <div className="text-center text-white/60 py-8">
                        <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Conversation will appear here once started</p>
                      </div>
                    ) : (
                      conversationMessages.map((message, index) => (
                        <div key={index} className="bg-white/10 p-2 rounded border border-white/10 text-sm text-white backdrop-blur-sm fade-in">
                          {message}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <Card className="mt-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md border border-cyan-500/30 hover:from-cyan-500/25 hover:to-blue-500/25 transition-all duration-300 scale-in">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-white">Interview Tips</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-white/80">
                  <div className="fade-in">
                    <p className="font-medium mb-1 text-cyan-300">🎤 Audio Quality</p>
                    <p>Ensure you're in a quiet environment with a good microphone</p>
                  </div>
                  <div className="fade-in">
                    <p className="font-medium mb-1 text-blue-300">💬 Speaking</p>
                    <p>Speak clearly and at a normal pace, just like a real interview</p>
                  </div>
                  <div className="fade-in">
                    <p className="font-medium mb-1 text-purple-300">⏱️ Timing</p>
                    <p>Your interview is set for {interviewConfig.duration} - pace yourself accordingly</p>
                  </div>
                  <div className="fade-in">
                    <p className="font-medium mb-1 text-green-300">🛑 Stop Anytime</p>
                    <p>Say "stop interview" or click the End Interview button to conclude early</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
