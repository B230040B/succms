#!/bin/bash

echo "======================================"
echo "Grade Display Fix - Updated Guide"
echo "======================================"
echo ""
echo "ISSUE FOUND: The RLS (Row Level Security) policy was"
echo "preventing lecturers from saving grades!"
echo ""
echo "To fix this, run the following SQL in your Supabase Dashboard:"
echo ""
echo "--------------------------------------"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click 'SQL Editor' in the sidebar"
echo "4. Click 'New query'"
echo "5. Paste and run this SQL:"
echo "--------------------------------------"
echo ""
cat << 'EOF'
-- Fix RLS policy to allow lecturers to update grades
DROP POLICY IF EXISTS "Allow students to update their submissions" ON public.assignment_submissions;

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
EOF
echo ""
echo "--------------------------------------"
echo "6. Click 'RUN' to execute"
echo "7. Refresh your application"
echo "--------------------------------------"
echo ""
echo "What this fixes:"
echo "  ✓ Allows lecturers to save grades"
echo "  ✓ Allows students to update their submissions"
echo "  ✓ Grades will now display correctly"
echo ""
echo "The app also now has debugging enabled - check the"
echo "browser console (F12) to see what's happening!"
echo ""
