import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, Clock, Target, Award, MessageCircle, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SessionReviewProps {
  onBack: () => void;
  session?: any;
  sessionData?: any;
  sessionId?: string | null;
}

export const SessionReview = ({ onBack, session, sessionData, sessionId }: SessionReviewProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actualSessionData, setActualSessionData] = useState<any>(null);

  useEffect(() => {
    if (sessionId && !session && !sessionData) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setActualSessionData(data);
    } catch (error) {
      console.error('Error fetching session data:', error);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use actual session data if available, otherwise fallback to props or mock data
  const mockSessionData = {
    id: '1',
    session_type: 'text',
    duration_seconds: 2700,
    overall_score: 85,
    completed_at: new Date().toISOString(),
    strengths: ['Excellent problem-solving approach', 'Clear communication'],
    weaknesses: ['Could elaborate more on testing strategies'],
    recommendations: ['Review advanced algorithms', 'Practice system design'],
    skill_breakdown: {
      communication: 88,
      technical_knowledge: 85,
      problem_solving: 82,
      cultural_fit: 87
    },
    questions_answered: 8,
    total_questions: 10,
    detailed_feedback: 'Overall strong performance with good technical knowledge and communication skills.',
    analysis_data: null
  };

  const data = actualSessionData || session || sessionData || mockSessionData;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {data.session_type === 'voice' ? (
                <Mic className="w-4 h-4 text-primary" />
              ) : (
                <MessageCircle className="w-4 h-4 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {data.session_type === 'voice' ? 'Voice' : 'Text'} Interview Review
              </h1>
              <p className="text-muted-foreground">
                Session completed on {new Date(data.completed_at || data.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {data.duration_seconds ? `${Math.floor(data.duration_seconds / 60)} minutes` : 'Duration not recorded'}
            </span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {data.overall_score || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {data.questions_answered || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.session_type === 'voice' ? 'Responses Given' : 'Questions Answered'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-500 mr-2" />
                <span className="text-lg font-semibold">
                  {data.overall_score >= 90 ? 'Excellent' : 
                   data.overall_score >= 80 ? 'Great' : 
                   data.overall_score >= 70 ? 'Good' : 
                   data.overall_score >= 60 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.strengths || []).map((strength: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
              {(!data.strengths || data.strengths.length === 0) && (
                <p className="text-sm text-muted-foreground">No specific strengths recorded for this session.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <XCircle className="w-5 h-5 mr-2" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.weaknesses || data.improvements || []).map((improvement: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </div>
              ))}
              {(!data.weaknesses && !data.improvements) && (
                <p className="text-sm text-muted-foreground">No specific areas for improvement identified.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {data.skill_breakdown ? (
                Object.entries(data.skill_breakdown).map(([skill, score]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{skill.replace('_', ' ')}</span>
                      <span className="text-muted-foreground">{score as number}%</span>
                    </div>
                    <Progress value={score as number} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Skill breakdown not available for this session.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.recommendations || []).map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
              {(!data.recommendations || data.recommendations.length === 0) && (
                <p className="text-sm text-muted-foreground">No specific recommendations available.</p>
              )}
            </div>

            {/* Detailed Feedback Section */}
            {data.detailed_feedback && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.detailed_feedback}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Session Transcript/Questions */}
            {data.questions_data && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {data.session_type === 'voice' ? 'Session Transcript' : 'Interview Questions & Answers'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.session_type === 'voice' ? (
                    <div className="text-sm text-muted-foreground">
                      {data.questions_data.transcript || 
                       (data.questions_data.messages && data.questions_data.messages.length > 0 
                        ? data.questions_data.messages.join('\n') 
                        : 'Voice transcript not available')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(data.questions_data) ? (
                        data.questions_data
                          .filter((msg: any) => msg.sender === 'ai' || msg.sender === 'user' || msg.role === 'assistant' || msg.role === 'user')
                          .map((msg: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-muted/50">
                              <div className="font-medium text-sm mb-1">
                                {(msg.sender === 'ai' || msg.role === 'assistant') ? 'Interviewer' : 'You'}:
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {msg.text || msg.content}
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Interview data not available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button onClick={onBack} className="w-full max-w-md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};