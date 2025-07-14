
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Target, BarChart3, Users, Zap, CheckCircle, Star, Award, TrendingUp } from "lucide-react";

interface LearnMoreProps {
  onBack: () => void;
}

export const LearnMore = ({ onBack }: LearnMoreProps) => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-cyan-400" />,
      title: "AI-Powered Intelligence",
      description: "Our advanced AI understands context, adapts to your responses, and provides human-like conversation flow for realistic interview practice."
    },
    {
      icon: <Target className="h-8 w-8 text-purple-400" />,
      title: "Industry-Specific Questions",
      description: "Get tailored questions for your specific industry and role, from entry-level positions to executive leadership roles."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-400" />,
      title: "Detailed Analytics",
      description: "Track your progress with comprehensive feedback on communication clarity, answer structure, and professional presentation."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-400" />,
      title: "Behavioral & Technical",
      description: "Practice both behavioral questions and technical challenges specific to your field and experience level."
    }
  ];

  const benefits = [
    {
      icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
      title: "Build Confidence",
      description: "Practice in a safe environment and build the confidence you need to excel in real interviews."
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-400" />,
      title: "Improve Communication",
      description: "Learn to articulate your thoughts clearly and structure your answers professionally."
    },
    {
      icon: <Award className="h-6 w-6 text-blue-400" />,
      title: "Stand Out",
      description: "Differentiate yourself with polished responses and professional interview skills."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-pink-400" />,
      title: "Career Growth",
      description: "Accelerate your career progression with interview skills that get you noticed."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header */}
          <div className="fade-in mb-12">
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
                <Zap className="h-4 w-4 mr-2 text-cyan-400" />
                <span className="text-cyan-200 font-medium">Learn More About Neuro Ask</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-reveal">
                Master Your Interview Skills with AI
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto text-reveal">
                Discover how Neuro Ask's advanced AI technology can transform your interview preparation and accelerate your career growth
              </p>
            </div>
          </div>

          {/* Key Features */}
          <section className="mb-16">
            <div className="text-center mb-12 slide-up">
              <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Everything you need to excel in your next interview
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 card-entrance">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-16">
            <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md border border-indigo-500/30 hover:from-indigo-500/25 hover:to-purple-500/25 transition-all duration-300 slide-up">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-white mb-4">Why Choose Neuro Ask?</CardTitle>
                <CardDescription className="text-lg text-white/80 max-w-2xl mx-auto">
                  Join thousands of professionals who have transformed their careers with our AI-powered interview preparation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4 fade-in">
                      <div className="flex-shrink-0 p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                        <p className="text-white/80">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <div className="text-center mb-12 slide-up">
              <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-lg text-white/80">Simple steps to interview success</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Customize Your Session",
                  description: "Select your industry, experience level, and interview type for personalized questions."
                },
                {
                  step: "02", 
                  title: "Practice with AI",
                  description: "Engage in realistic conversations with our intelligent AI interviewer."
                },
                {
                  step: "03",
                  title: "Get Feedback",
                  description: "Receive detailed analysis and actionable insights to improve your performance."
                }
              ].map((item, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 text-center card-entrance">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center scale-in">
            <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md border border-cyan-500/30 hover:from-cyan-500/25 hover:to-blue-500/25 transition-all duration-300">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Ready to Transform Your Interview Skills?
                </h2>
                <p className="text-xl mb-8 text-white/80">
                  Start practicing today and land your dream job with confidence
                </p>
                <Button 
                  size="lg" 
                  onClick={onBack}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Now
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};
