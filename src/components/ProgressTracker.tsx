
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Award } from "lucide-react";

interface SessionData {
  id: string;
  date: string;
  type: string;
  industry: string;
  score: number;
  duration: string;
}

interface ProgressTrackerProps {
  sessions: SessionData[];
}

export const ProgressTracker = ({ sessions }: ProgressTrackerProps) => {
  const getProgressTrend = () => {
    if (sessions.length < 2) return { trend: "neutral", change: 0 };
    
    const recent = sessions.slice(-3);
    const older = sessions.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, s) => sum + s.score, 0) / older.length : recentAvg;
    
    const change = recentAvg - olderAvg;
    
    if (change > 5) return { trend: "up", change: Math.round(change) };
    if (change < -5) return { trend: "down", change: Math.round(Math.abs(change)) };
    return { trend: "neutral", change: 0 };
  };

  const getAverageScore = () => {
    if (sessions.length === 0) return 0;
    return Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length);
  };

  const getStrongAreas = () => {
    const industryScores: { [key: string]: number[] } = {};
    sessions.forEach(session => {
      if (!industryScores[session.industry]) {
        industryScores[session.industry] = [];
      }
      industryScores[session.industry].push(session.score);
    });

    return Object.entries(industryScores)
      .map(([industry, scores]) => ({
        industry,
        avgScore: scores.reduce((sum, score) => sum + score, 0) / scores.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3);
  };

  const progress = getProgressTrend();
  const avgScore = getAverageScore();
  const strongAreas = getStrongAreas();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-800">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-indigo-600 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-indigo-800">{sessions.length}</p>
            </div>
            <div>
              <p className="text-sm text-indigo-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-indigo-800">{avgScore}%</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-indigo-600">Overall Progress</span>
              <div className="flex items-center space-x-1">
                {progress.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                {progress.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                {progress.trend === "neutral" && <Minus className="h-4 w-4 text-gray-600" />}
                <span className={`text-sm font-medium ${
                  progress.trend === "up" ? "text-green-600" : 
                  progress.trend === "down" ? "text-red-600" : "text-gray-600"
                }`}>
                  {progress.change > 0 ? `+${progress.change}%` : progress.change < 0 ? `-${progress.change}%` : "Stable"}
                </span>
              </div>
            </div>
            <Progress value={avgScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {strongAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strongAreas.map((area, index) => (
                <div key={area.industry} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{area.industry}</span>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {Math.round(area.avgScore)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
