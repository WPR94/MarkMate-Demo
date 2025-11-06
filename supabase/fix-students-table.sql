-- Fix students table structure
-- Run this in Supabase SQL Editor to update the students table

-- Drop existing table and recreate with correct schema
DROP TABLE IF EXISTS public.students CASCADE;

CREATE TABLE public.students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  name text not null,
  email text,
  grade text,
  class_section text,
  student_id text,
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index
CREATE INDEX idx_students_teacher ON public.students(teacher_id);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can select own students"
  ON public.students FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own students"
  ON public.students FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own students"
  ON public.students FOR UPDATE
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own students"
  ON public.students FOR DELETE
  USING (teacher_id = auth.uid());
