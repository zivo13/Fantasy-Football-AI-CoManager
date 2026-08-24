-- SUPABASE DATABASE SCHEMA FOR SUPERMACHO.APP
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor -> New Query)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client',
  plan_id TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_price_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Leagues Parameters Table
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'ESPN',
  league_id TEXT NOT NULL,
  team_id TEXT DEFAULT '1',
  scoring TEXT DEFAULT 'PPR',
  espn_s2 TEXT,
  swid TEXT,
  status TEXT DEFAULT 'Connected',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS POLICIES FOR LEAGUES
DROP POLICY IF EXISTS "Users can view own leagues" ON public.leagues;
CREATE POLICY "Users can view own leagues" ON public.leagues
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own leagues" ON public.leagues;
CREATE POLICY "Users can insert own leagues" ON public.leagues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own leagues" ON public.leagues;
CREATE POLICY "Users can update own leagues" ON public.leagues
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own leagues" ON public.leagues;
CREATE POLICY "Users can delete own leagues" ON public.leagues
  FOR DELETE USING (auth.uid() = user_id);

-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, plan_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'client',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Additional profile tracking columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_count INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_team TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- RLS POLICIES FOR SUPPORT TICKETS
DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view own support tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id OR user_email = current_setting('request.jwt.claim.email', true));

DROP POLICY IF EXISTS "Users can insert own support tickets" ON public.support_tickets;
CREATE POLICY "Users can insert own support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own support tickets" ON public.support_tickets;
CREATE POLICY "Users can update own support tickets" ON public.support_tickets
  FOR UPDATE USING (true);

