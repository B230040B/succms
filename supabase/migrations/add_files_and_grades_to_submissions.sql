-- Add missing columns to assignment_submissions table for multiple file uploads and grades
-- This allows students to submit multiple files and shows grades/feedback

ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.assignment_submissions.files IS 'Array of file objects with name and path properties for multiple file submissions';
COMMENT ON COLUMN public.assignment_submissions.grade IS 'The grade/score assigned by the lecturer';
COMMENT ON COLUMN public.assignment_submissions.feedback IS 'Feedback provided by the lecturer';

-- Update existing records to have empty array if null
UPDATE public.assignment_submissions
SET files = '[]'::jsonb
WHERE files IS NULL;
