-- Add files column to assignment_submissions table to support multiple file uploads
-- This allows students to submit multiple files per assignment

ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.assignment_submissions.files IS 'Array of file objects with name and path properties for multiple file submissions';

-- Update existing records to have empty array if null
UPDATE public.assignment_submissions
SET files = '[]'::jsonb
WHERE files IS NULL;
