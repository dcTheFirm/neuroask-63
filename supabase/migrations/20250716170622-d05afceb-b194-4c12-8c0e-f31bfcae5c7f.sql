-- Create dashboard analytics table to track user statistics
CREATE TABLE public.dashboard_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0.00,
  hours_practiced NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  current_streak INTEGER NOT NULL DEFAULT 0,
  last_session_date DATE,
  weekly_goal INTEGER NOT NULL DEFAULT 5,
  weekly_completed INTEGER NOT NULL DEFAULT 0,
  week_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard analytics
CREATE POLICY "Users can view their own analytics" 
ON public.dashboard_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
ON public.dashboard_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.dashboard_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_analytics_updated_at
BEFORE UPDATE ON public.dashboard_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update dashboard analytics when sessions are completed
CREATE OR REPLACE FUNCTION public.update_dashboard_analytics()
RETURNS TRIGGER AS $$
DECLARE
  user_analytics RECORD;
  avg_score NUMERIC;
  total_hours NUMERIC;
  session_count INTEGER;
  streak_count INTEGER;
  last_session DATE;
BEGIN
  -- Only update on session completion
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Calculate new statistics
    SELECT 
      COUNT(*) as sessions,
      COALESCE(AVG(overall_score), 0) as avg_score,
      COALESCE(SUM(duration_seconds), 0) / 3600.0 as total_hours
    INTO session_count, avg_score, total_hours
    FROM practice_sessions 
    WHERE user_id = NEW.user_id AND status = 'completed';
    
    -- Calculate streak (consecutive days with sessions)
    SELECT COALESCE(MAX(created_at::DATE), CURRENT_DATE) INTO last_session
    FROM practice_sessions 
    WHERE user_id = NEW.user_id AND status = 'completed';
    
    -- Simple streak calculation (can be enhanced)
    streak_count := CASE 
      WHEN last_session = CURRENT_DATE OR last_session = CURRENT_DATE - INTERVAL '1 day' 
      THEN COALESCE((
        SELECT current_streak + 1 
        FROM dashboard_analytics 
        WHERE user_id = NEW.user_id
      ), 1)
      ELSE 1
    END;
    
    -- Upsert dashboard analytics
    INSERT INTO public.dashboard_analytics (
      user_id, 
      total_sessions, 
      average_score, 
      hours_practiced, 
      current_streak,
      last_session_date
    ) VALUES (
      NEW.user_id,
      session_count,
      avg_score,
      total_hours,
      streak_count,
      last_session
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_sessions = session_count,
      average_score = avg_score,
      hours_practiced = total_hours,
      current_streak = streak_count,
      last_session_date = last_session,
      updated_at = now();
      
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update analytics on session completion
CREATE TRIGGER trigger_update_dashboard_analytics
AFTER UPDATE ON public.practice_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_analytics();

-- Add unique constraint for user_id in dashboard_analytics
ALTER TABLE public.dashboard_analytics ADD CONSTRAINT unique_user_analytics UNIQUE (user_id);