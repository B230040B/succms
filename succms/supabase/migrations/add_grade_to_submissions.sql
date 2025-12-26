-- Add grade and feedback columns to assignment_submissions table
-- This allows storing grades directly on submissions instead of in a separate table

ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.assignment_submissions.grade IS 'The grade/score assigned by the lecturer';
COMMENT ON COLUMN public.assignment_submissions.feedback IS 'Feedback provided by the lecturer';
