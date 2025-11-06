-- Fix essays table to ensure all required columns exist
-- Run this in your Supabase SQL Editor

-- Check current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'essays' 
  AND table_schema = 'public';

-- Add rubric_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'essays' 
          AND column_name = 'rubric_id'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.essays 
        ADD COLUMN rubric_id uuid REFERENCES public.rubrics(id);
        
        RAISE NOTICE 'Added rubric_id column to essays table';
    ELSE
        RAISE NOTICE 'rubric_id column already exists';
    END IF;
END $$;

-- Add student_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'essays' 
          AND column_name = 'student_id'
          AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.essays 
        ADD COLUMN student_id uuid REFERENCES public.students(id);
        
        RAISE NOTICE 'Added student_id column to essays table';
    ELSE
        RAISE NOTICE 'student_id column already exists';
    END IF;
END $$;

-- Verify the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'essays' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
