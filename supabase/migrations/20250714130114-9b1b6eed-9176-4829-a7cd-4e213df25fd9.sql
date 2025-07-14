-- Rename tables as requested
ALTER TABLE public.profiles RENAME TO account_stuff;
ALTER TABLE public.interview_configurations RENAME TO profiles;

-- Update the foreign key reference in account_stuff table  
ALTER TABLE public.account_stuff DROP CONSTRAINT profiles_user_id_fkey;
ALTER TABLE public.account_stuff ADD CONSTRAINT account_stuff_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the foreign key reference in profiles table
ALTER TABLE public.profiles DROP CONSTRAINT interview_configurations_user_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the foreign key reference in practice_sessions table
ALTER TABLE public.practice_sessions DROP CONSTRAINT practice_sessions_configuration_id_fkey;
ALTER TABLE public.practice_sessions ADD CONSTRAINT practice_sessions_configuration_id_fkey 
  FOREIGN KEY (configuration_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update RLS policy names for account_stuff (formerly profiles)
DROP POLICY "Users can view their own profile" ON public.account_stuff;
DROP POLICY "Users can create their own profile" ON public.account_stuff;  
DROP POLICY "Users can update their own profile" ON public.account_stuff;

CREATE POLICY "Users can view their own account" 
ON public.account_stuff FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own account" 
ON public.account_stuff FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own account" 
ON public.account_stuff FOR UPDATE 
USING (auth.uid() = user_id);

-- Update RLS policy names for profiles (formerly interview_configurations)  
DROP POLICY "Users can view their own configurations" ON public.profiles;
DROP POLICY "Users can create their own configurations" ON public.profiles;
DROP POLICY "Users can update their own configurations" ON public.profiles;
DROP POLICY "Users can delete their own configurations" ON public.profiles;

CREATE POLICY "Users can view their own profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" 
ON public.profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Update trigger names
DROP TRIGGER update_profiles_updated_at ON public.account_stuff;
DROP TRIGGER update_interview_configurations_updated_at ON public.profiles;

CREATE TRIGGER update_account_stuff_updated_at
  BEFORE UPDATE ON public.account_stuff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update function to create account_stuff instead of profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.account_stuff (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update index names
DROP INDEX idx_profiles_user_id;
DROP INDEX idx_interview_configurations_user_id;

CREATE INDEX idx_account_stuff_user_id ON public.account_stuff(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);