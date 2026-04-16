-- Create our tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, 
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'nurse', 'caregiver', 'doctor')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50),
    date_of_birth DATE NOT NULL,
    admission_date DATE DEFAULT CURRENT_DATE,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL, 
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('hygiene', 'medication', 'feeding', 'vitals', 'other')),
    scheduled_time TIME NOT NULL,
    task_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
    completed_by UUID REFERENCES public.users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_users_facility ON public.users(facility_id);
CREATE INDEX idx_patients_facility ON public.patients(facility_id);
CREATE INDEX idx_daily_tasks_facility ON public.daily_tasks(facility_id);
CREATE INDEX idx_daily_tasks_dashboard ON public.daily_tasks(patient_id, task_date, status);

-- Enable RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's facility_id
CREATE OR REPLACE FUNCTION public.get_user_facility_id()
RETURNS UUID AS $$
  SELECT facility_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS for Facilities
CREATE POLICY "Users can view their own facility" ON public.facilities
  FOR SELECT USING (id = public.get_user_facility_id());

-- RLS for Users
CREATE POLICY "Users can view users in same facility" ON public.users
  FOR SELECT USING (facility_id = public.get_user_facility_id());
CREATE POLICY "Admins can update users in same facility" ON public.users
  FOR ALL USING (
    facility_id = public.get_user_facility_id() AND 
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- RLS for Patients
CREATE POLICY "Users can view patients in their facility" ON public.patients
  FOR SELECT USING (facility_id = public.get_user_facility_id());
CREATE POLICY "Users can update patients in their facility" ON public.patients
  FOR UPDATE USING (facility_id = public.get_user_facility_id());
CREATE POLICY "Users can insert patients in their facility" ON public.patients
  FOR INSERT WITH CHECK (facility_id = public.get_user_facility_id());

-- RLS for Daily Tasks
CREATE POLICY "Users can view daily tasks in their facility" ON public.daily_tasks
  FOR SELECT USING (facility_id = public.get_user_facility_id());
CREATE POLICY "Users can insert daily tasks in their facility" ON public.daily_tasks
  FOR INSERT WITH CHECK (facility_id = public.get_user_facility_id());
CREATE POLICY "Users can update daily tasks in their facility" ON public.daily_tasks
  FOR UPDATE USING (facility_id = public.get_user_facility_id());

-- Supabase Realtime Setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_tasks;
