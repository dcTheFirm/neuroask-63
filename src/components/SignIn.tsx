
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Brain } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SignInProps {
  onSignIn: (user: any) => void;
  onBack: () => void;
}

export const SignIn = ({ onSignIn, onBack }: SignInProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // Check if Google Sign-In is available (safer type checking)
      if (typeof window !== 'undefined' && (window as any).google) {
        // Real Google Sign-In would go here
        console.log("Google Sign-In API available");
      }
      
      // For now, simulate the sign-in process with more realistic flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a more realistic mock user with better demo experience
      const mockUser = {
        id: `user_${Date.now()}`,
        name: "Alex Johnson",
        email: "alex.johnson@gmail.com",
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        provider: "google",
        joinedAt: new Date().toISOString(),
        verified: true
      };
      
      toast({
        title: "Welcome to Neuro Ask!",
        description: `Successfully signed in as ${mockUser.name}`,
      });
      
      onSignIn(mockUser);
    } catch (error) {
      console.error("Sign-in error:", error);
      toast({
        title: "Sign In Failed",
        description: "Unable to sign in at the moment. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Neuro Ask
                </span>
              </div>
            </div>
          </div>

          {/* Sign In Form */}
          <div className="max-w-md mx-auto mt-20">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Welcome to Neuro Ask</CardTitle>
                <CardDescription className="text-base text-white/80">
                  Sign in to start practicing your interview skills with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-white/90 border border-white/20 text-gray-700 hover:bg-white hover:border-white/40 backdrop-blur-sm"
                  size="lg"
                >
                  <Mail className="h-5 w-5 mr-3" />
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </Button>
                
                <div className="text-center text-sm text-white/70">
                  <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
                  <p className="mt-2 text-xs text-cyan-300">
                    Note: This is a demo. In production, real Google OAuth would be integrated.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 text-center p-6">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">AI-Powered Interviews</h3>
              <p className="text-sm text-white/70">Practice with intelligent AI that adapts to your responses</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 text-center p-6">
              <div className="w-12 h-12 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Multiple Formats</h3>
              <p className="text-sm text-white/70">Choose between voice and text-based interviews</p>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 text-center p-6">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Instant Feedback</h3>
              <p className="text-sm text-white/70">Get detailed analysis and improvement suggestions</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
