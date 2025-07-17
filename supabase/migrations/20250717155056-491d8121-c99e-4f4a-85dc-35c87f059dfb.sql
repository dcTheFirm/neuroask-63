-- Rename interview_configurations table to User_profiles
ALTER TABLE public.interview_configurations RENAME TO User_profiles;

-- Add additional profile fields to the User_profiles table to consolidate profile data
ALTER TABLE public.User_profiles 
ADD COLUMN full_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN location TEXT,
ADD COLUMN avatar_url TEXT,
ADD COLUMN preferred_industries TEXT[];

-- Update RLS policies for the renamed table
DROP POLICY IF EXISTS "Users can create their own profiles" ON public.User_profiles;
DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.User_profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.User_profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.User_profiles;

-- Create new RLS policies for User_profiles
CREATE POLICY "Users can create their own user profiles" 
ON public.User_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user profiles" 
ON public.User_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own user profiles" 
ON public.User_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own user profiles" 
ON public.User_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add member_since column to dashboard_analytics table
ALTER TABLE public.dashboard_analytics 
ADD COLUMN member_since DATE DEFAULT CURRENT_DATE;