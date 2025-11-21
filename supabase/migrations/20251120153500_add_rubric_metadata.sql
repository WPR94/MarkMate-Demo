-- Migration: Add rubric metadata columns for exam board & template reference
-- Timestamp: 2025-11-20 15:35:00

ALTER TABLE public.rubrics
ADD COLUMN IF NOT EXISTS exam_board text,
ADD COLUMN IF NOT EXISTS template_id text,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS cloned_from uuid REFERENCES public.rubrics(id);

-- Helpful index for filtering by exam board
CREATE INDEX IF NOT EXISTS idx_rubrics_exam_board ON public.rubrics(exam_board);
