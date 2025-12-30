-- Fix RLS policy to allow lecturers to update grades on submissions
-- The original policy only allowed students to update their own submissions,
-- which prevented lecturers from saving grades.

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow students to update their submissions" ON public.assignment_submissions;

-- Create new policy that allows both students and lecturers to update
CREATE POLICY "Allow students and lecturers to update submissions"
  ON public.assignment_submissions FOR UPDATE
  USING (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT user_id FROM public.course_instructors 
      WHERE course_id IN (SELECT course_id FROM public.course_assignments WHERE id = assignment_id)
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT user_id FROM public.course_instructors 
      WHERE course_id IN (SELECT course_id FROM public.course_assignments WHERE id = assignment_id)
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );
