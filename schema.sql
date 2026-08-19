-- Create profiles table for user roles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'surveyor')) DEFAULT 'surveyor'
);

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow user edit own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile entry when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'surveyor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create assets table
CREATE TABLE public.assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  owner TEXT,
  legal TEXT,
  price TEXT,
  value TEXT,
  status TEXT NOT NULL,
  address TEXT,
  center DOUBLE PRECISION[], -- [lat, lng]
  coordinates DOUBLE PRECISION[][], -- [[lat, lng], ...]
  area_m2 INTEGER,
  area_ha NUMERIC,
  area TEXT,
  property_sold INTEGER DEFAULT 0,
  property_installment INTEGER DEFAULT 0,
  property_available INTEGER DEFAULT 0,
  land_stage TEXT,
  land_condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_by TEXT DEFAULT 'Admin'
);

-- Enable RLS for assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for assets" ON public.assets
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users write access" ON public.assets
  FOR ALL USING (auth.role() = 'authenticated');
