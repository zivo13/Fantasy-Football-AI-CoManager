-- SUPABASE DATABASE SCHEMA FOR SUPERMACHO.APP
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor -> New Query)

-- 1. Profiles Table (Extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'client', -- 'client' | 'admin'
  plan_id TEXT DEFAULT 'free', -- 'free' | 'pro' | 'commissioner'
  stripe_customer_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY, -- Stripe Subscription ID
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL, -- 'free' | 'pro' | 'commissioner'
  status TEXT NOT NULL, -- 'active' | 'canceled' | 'past_due' | 'trialling'
  stripe_price_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Leagues Parameters Table
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'ESPN', -- 'ESPN' | 'Sleeper' | 'Yahoo'
  league_id TEXT NOT NULL,
  team_id TEXT DEFAULT '1',
  scoring TEXT DEFAULT 'PPR', -- 'PPR' | 'Half-PPR' | 'Standard'
  espn_s2 TEXT,
  swid TEXT,
  status TEXT DEFAULT 'Connected',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS POLICIES FOR LEAGUES
CREATE POLICY "Users can view own leagues" ON public.leagues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leagues" ON public.leagues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leagues" ON public.leagues
  FOR UPDATE USING (auth.uid() = user_id);

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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
