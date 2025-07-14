-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user full profile
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'expert')),
  preferred_industries TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview_configurations table
CREATE TABLE public.interview_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_role TEXT,
  company_type TEXT,
  experience_level TEXT,
  interview_type TEXT CHECK (interview_type IN ('behavioral', 'technical', 'mixed')),
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  duration_minutes INTEGER DEFAULT 30,
  question_count INTEGER DEFAULT 10,
  focus_areas TEXT[],
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice_sessions table
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  configuration_id UUID REFERENCES public.interview_configurations(id) ON DELETE SET NULL,
  session_type TEXT CHECK (session_type IN ('text', 'voice', 'quick')) NOT NULL,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  total_questions INTEGER,
  questions_answered INTEGER DEFAULT 0,
  overall_score DECIMAL(3,2),
  feedback_summary TEXT,
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create text_interviews table
CREATE TABLE public.text_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  user_answer TEXT,
  ai_feedback TEXT,
  score DECIMAL(3,2),
  time_taken_seconds INTEGER,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_interviews table (storing transcribed text)
CREATE TABLE public.voice_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  user_answer_transcript TEXT,
  audio_duration_seconds INTEGER,
  ai_feedback TEXT,
  score DECIMAL(3,2),
  speaking_pace_score DECIMAL(3,2),
  clarity_score DECIMAL(3,2),
  confidence_score DECIMAL(3,2),
  time_taken_seconds INTEGER,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for interview_configurations
CREATE POLICY "Users can view their own configurations" 
ON public.interview_configurations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own configurations" 
ON public.interview_configurations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configurations" 
ON public.interview_configurations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configurations" 
ON public.interview_configurations FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for practice_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.practice_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.practice_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.practice_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for text_interviews
CREATE POLICY "Users can view their own text interviews" 
ON public.text_interviews FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own text interviews" 
ON public.text_interviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own text interviews" 
ON public.text_interviews FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for voice_interviews
CREATE POLICY "Users can view their own voice interviews" 
ON public.voice_interviews FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice interviews" 
ON public.voice_interviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice interviews" 
ON public.voice_interviews FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_configurations_updated_at
  BEFORE UPDATE ON public.interview_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_interview_configurations_user_id ON public.interview_configurations(user_id);
CREATE INDEX idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_created_at ON public.practice_sessions(created_at DESC);
CREATE INDEX idx_text_interviews_session_id ON public.text_interviews(session_id);
CREATE INDEX idx_text_interviews_user_id ON public.text_interviews(user_id);
CREATE INDEX idx_voice_interviews_session_id ON public.voice_interviews(session_id);
CREATE INDEX idx_voice_interviews_user_id ON public.voice_interviews(user_id);