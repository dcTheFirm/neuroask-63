import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LogOut, 
  Play, 
  BarChart3, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock,
  FileText,
  Brain,
  Mic,
  MessageSquare,
  Zap,
  Target,
  Star
} from "lucide-react";
import { UserProfile } from "./UserProfile";
import { InterviewSetup } from "./InterviewSetup";
import { SessionReview } from "./SessionReview";
import { QuickSession } from "./QuickSession";
import { RandomPractice } from "./RandomPractice";
import { ProgressTracker } from "./ProgressTracker";
import { AccountStats } from "./AccountStats";
import { ProjectReport } from "./ProjectReport";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface DashboardProps {
  user: any;
  onSignOut: () => void;
}

export const Dashboard = ({ user, onSignOut }: DashboardProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showInterviewSetup, setShowInterviewSetup] = useState(false);
  const [showSessionReview, setShowSessionReview] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQuickSession, setShowQuickSession] = useState(false);
  const [showRandomPractice, setShowRandomPractice] = useState(false);

  const [showProjectReport, setShowProjectReport] = useState(false);

  const { data: sessions, isLoading, isError, refetch } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to ensure fresh data
  });

  useEffect(() => {
    if (isError) {
      console.error("Error fetching sessions:", isError);
      // Check if user is authenticated
      if (!user?.id) {
        console.error("User not authenticated");
      }
    }
  }, [isError, user]);

  const handleSessionReview = (id: string) => {
    setSessionId(id);
    setShowSessionReview(true);
  };

  if (showProjectReport) {
    return <ProjectReport onBack={() => setShowProjectReport(false)} />;
  }

  if (showProfile) {
    return <UserProfile user={user} onBack={() => setShowProfile(false)} />;
  }

  if (showInterviewSetup) {
    return <InterviewSetup onBack={() => setShowInterviewSetup(false)} onComplete={() => {
      setShowInterviewSetup(false);
      refetch(); // Refetch sessions after interview completion
    }} />;
  }

  if (showSessionReview && sessionId) {
    return <SessionReview sessionId={sessionId} onBack={() => setShowSessionReview(false)} />;
  }

  if (showQuickSession) {
    return <QuickSession onBack={() => setShowQuickSession(false)} onComplete={() => {
      setShowQuickSession(false);
      refetch(); // Refetch sessions after interview completion
    }} interviewConfig={{ industry: 'Software Engineering', level: 'Mid Level', type: 'Technical', duration: '30 minutes' }} />;
  }

  if (showRandomPractice) {
    return <RandomPractice onBack={() => setShowRandomPractice(false)} onComplete={() => {
      setShowRandomPractice(false);
      refetch(); // Refetch sessions after interview completion
    }} interviewConfig={{ industry: 'Software Engineering', level: 'Mid Level', type: 'Technical', duration: '30 minutes' }} />;
  }

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
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-12 fade-in">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 text-reveal">
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </h1>
              <p className="text-xl text-white/80 text-reveal">
                Ready to practice your interview skills?
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Button
                onClick={() => setShowProjectReport(true)}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Project Report
              </Button>
              <Button
                onClick={() => setShowProfile(true)}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button
                onClick={onSignOut}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 card-entrance">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setShowQuickSession(true)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Quick Session
                </Button>
                <Button
                  onClick={() => setShowInterviewSetup(true)}
                  variant="secondary"
                  className="w-full bg-white/10 hover:bg-white/20 text-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Customize Interview
                </Button>
                <Button
                  onClick={() => setShowRandomPractice(true)}
                  variant="secondary"
                  className="w-full bg-white/10 hover:bg-white/20 text-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Random Practice
                </Button>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <AccountStats />

            {/* Progress Tracker */}
            <ProgressTracker sessions={sessions?.map(session => ({
              id: session.id,
              date: session.created_at,
              type: session.session_type || 'text',
              industry: session.feedback_summary || 'General',
              score: (session.overall_score || 0) * 100,
              duration: session.duration_seconds ? `${Math.floor(session.duration_seconds / 60)} min` : '0 min'
            })) || []} />

            {/* Recent Sessions */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 card-entrance lg:col-span-2">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full p-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">Recent Sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-white/60">Loading sessions...</p>
                ) : isError ? (
                  <p className="text-red-400">Error fetching sessions.</p>
                ) : sessions && sessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {sessions.slice(0, 6).map((session) => (
                      <Card key={session.id} className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">{session.session_type || 'Text'} Interview</CardTitle>
                          <div className="space-x-1">
                            <Badge variant="secondary">{session.status}</Badge>
                            <Badge variant="outline">
                              {session.overall_score ? `${Math.round(session.overall_score * 100)}%` : 'No Score'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-white/70">
                            <p>
                              <Calendar className="h-4 w-4 inline-block mr-1" />
                              {new Date(session.created_at).toLocaleDateString()}
                            </p>
                            <p>
                              <Clock className="h-4 w-4 inline-block mr-1" />
                              {new Date(session.created_at).toLocaleTimeString()}
                            </p>
                            {session.duration_seconds && (
                              <p>
                                <Clock className="h-4 w-4 inline-block mr-1" />
                                {Math.floor(session.duration_seconds / 60)} minutes
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleSessionReview(session.id)}
                            variant="link"
                            className="mt-4 text-blue-400 hover:text-blue-300"
                          >
                            Review Session <BarChart3 className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60">No sessions found. Start practicing to see your sessions here!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
