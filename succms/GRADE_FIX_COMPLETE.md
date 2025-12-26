# Grade Display Fix - Complete Solution

## Problem Summary
Grades are not displaying on assignment cards even after adding grade/feedback columns to the database.

## Root Cause #2 (Updated)
After adding the database columns, we discovered that the **Row Level Security (RLS) policy** for `assignment_submissions` was too restrictive. The UPDATE policy only allowed students to modify their own submissions, which **prevented lecturers from saving grades**.

## The Fix - Apply This SQL

Run this in your Supabase Dashboard SQL Editor:

```sql
-- Fix RLS policy to allow lecturers to update grades
DROP POLICY IF EXISTS "Allow students to update their submissions" ON public.assignment_submissions;

CREATE POLICY "Allow students and lecturers to update submissions"
  ON public.assignment_submissions FOR UPDATE
  USING (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT created_by FROM public.assignments WHERE id = assignment_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  )
  WITH CHECK (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT created_by FROM public.assignments WHERE id = assignment_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );
```

## How to Apply

1. **Go to**: https://supabase.com/dashboard
2. **Select** your project
3. **Click** "SQL Editor" in the left sidebar
4. **Click** "New query"
5. **Paste** the SQL above
6. **Click** "RUN"
7. **Refresh** your application

## What This Does

### Before (Broken):
- ❌ Only students could update their submissions
- ❌ Lecturers got permission denied when saving grades
- ❌ Grades never saved to database
- ❌ Nothing displayed on assignment cards

### After (Fixed):
- ✅ Students can update their submissions (files, etc.)
- ✅ Lecturers can update submissions to add grades/feedback
- ✅ Admins can modify any submission
- ✅ Grades save successfully
- ✅ Grades display on assignment cards and in detail view

## Debugging Added

The code now includes console logging to help verify the fix:
- 📚 Logs when submissions are fetched
- 💾 Logs when grades are being saved
- 📝 Logs submission data for each assignment card
- ✅/❌ Shows success/error messages

Open your browser console (F12) to see these logs.

## Files Modified

1. **supabase/migrations/fix_assignment_submissions_rls.sql** - Migration to fix RLS
2. **supabase/schema.sql** - Updated schema documentation
3. **src/components/CoursePage.tsx** - Added debugging logs
4. **fix-grades.sh** - Updated quick fix guide

## Testing After Fix

1. **As a Lecturer**:
   - Open a course
   - Go to Assignments tab
   - Click an assignment with a student submission
   - Click on a student card
   - Enter a grade and feedback
   - Click "Save Grade & Return"
   - Check console - should see "✅ Grade saved successfully"

2. **As a Student**:
   - Open the same course
   - Go to Assignments tab
   - You should see:
     - Green "Graded" badge on the assignment card
     - Grade displayed as "X / 100" (or your max points)
   - Click the assignment
   - Should see full grade details with feedback in green box

## No Other Changes Needed

The application code was already correct. This is purely a database permission fix.
