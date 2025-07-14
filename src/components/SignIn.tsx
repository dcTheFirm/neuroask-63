
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Brain } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignInProps {
  onSignIn: (user: any) => void;
  onBack: () => void;
}

export const SignIn = ({ onSignIn, onBack }: SignInProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Account Created Successfully!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && data.session) {
          toast({
            title: "Welcome back to Neuro Ask!",
            description: `Successfully signed in as ${data.user.email}`,
          });
          
          onSignIn({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            email: data.user.email,
            picture: data.user.user_metadata?.avatar_url,
            provider: "email",
            verified: data.user.email_confirmed_at ? true : false
          });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description: error.message || "Please try again later.",
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
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                        placeholder="Enter your full name"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20"
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-white/90 border border-white/20 text-gray-700 hover:bg-white hover:border-white/40 backdrop-blur-sm"
                    size="lg"
                  >
                    <Mail className="h-5 w-5 mr-3" />
                    {isLoading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-cyan-300 hover:text-cyan-200"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-white/70">
                  <p>By {isSignUp ? "creating an account" : "signing in"}, you agree to our Terms of Service and Privacy Policy</p>
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
