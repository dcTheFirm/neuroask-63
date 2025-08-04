-- Add columns to practice_sessions table for detailed interview analysis
ALTER TABLE public.practice_sessions 
ADD COLUMN IF NOT EXISTS questions_data JSONB,
ADD COLUMN IF NOT EXISTS analysis_data JSONB,
ADD COLUMN IF NOT EXISTS strengths TEXT[],
ADD COLUMN IF NOT EXISTS weaknesses TEXT[],
ADD COLUMN IF NOT EXISTS recommendations TEXT[],
ADD COLUMN IF NOT EXISTS skill_breakdown JSONB,
ADD COLUMN IF NOT EXISTS detailed_feedback TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_created 
ON public.practice_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_status 
ON public.practice_sessions(status);

-- Update existing records to have proper session_type if NULL
UPDATE public.practice_sessions 
SET session_type = 'text' 
WHERE session_type IS NULL;