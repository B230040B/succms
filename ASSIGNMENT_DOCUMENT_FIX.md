# Assignment Document Upload Fix - Complete Solution

## Problem Summary
Lecturers could see that a student had submitted an assignment, but **could not see the submitted documents**. This was due to a mismatch between the code implementation and the database schema.

## Root Causes Identified

### 1. **Missing Database Columns**
The `assignment_submissions` table was missing critical columns:
- `files` - JSONB array to store multiple submitted files
- `grade` - INTEGER for storing the assigned grade
- `feedback` - TEXT for lecturer feedback

### 2. **Non-existent Table Reference**
The code was referencing a `course_assignments` table that didn't exist in the database schema.
- Database has: `assignments` table
- Code was using: `course_assignments` table

### 3. **Incorrect Field Names**
The code was using field names that don't exist in the database schema:
- Code used: `points`, `attachments`
- Database has: `max_score` (for assignments), no attachments field

## Solution Implemented

### 1. **Created Database Migration**
File: `/workspaces/succms/supabase/migrations/add_files_and_grades_to_submissions.sql`

Added missing columns to `assignment_submissions` table:
```sql
ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS feedback TEXT;
```

### 2. **Fixed Code References**
Updated all component files to use correct table and field names:

#### Files Changed:
- **CoursePage.tsx**
  - Changed `course_assignments` → `assignments`
  - Changed `points` → `max_score`
  - Removed invalid `attachments` field from assignment creation
  - Removed `attachments` display from instructions (not in schema)

- **Assignments.tsx**
  - Changed `course_assignments` → `assignments`
  - Changed `item.points` → `item.max_score`

- **App.tsx**
  - Changed `course_assignments` → `assignments` in crucial assignments checker

### 3. **Updated TypeScript Definitions**
File: `/workspaces/succms/src/lib/database.types.ts`

Added missing columns to `assignment_submissions` type definitions:
```typescript
files: Array<{name: string, path: string}> | null;
grade: number | null;
feedback: string | null;
```

## How It Works Now

### Student Submission Flow:
1. Student uploads file(s) in the assignment submission dialog
2. Files are stored in `submissionFiles` state as `{name, path}` objects
3. On "Turn In", the submission is saved with:
   - `assignment_id`
   - `student_id`
   - `files: [{name, path}, ...]` ← **This now stores in database**
   - `submitted_at`

### Lecturer Grading Flow:
1. Lecturer clicks on an assignment to view submissions
2. Selects a student from the submission list
3. Sees the student's submitted files from the `files` JSONB column
4. Can download/view the files
5. Can assign grade and feedback
6. Grade and feedback are saved to `grade` and `feedback` columns

## How to Apply the Migration

### Option 1: Using Supabase CLI
```bash
# From project root
supabase migration up
```

### Option 2: Using Supabase Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of: `supabase/migrations/add_files_and_grades_to_submissions.sql`
3. Paste and execute

### Option 3: Direct SQL Execution
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS feedback TEXT;

UPDATE public.assignment_submissions
SET files = '[]'::jsonb
WHERE files IS NULL;
```

## Testing the Fix

1. **Create an assignment** (as lecturer)
2. **Submit assignment** (as student)
3. **Upload files** in the submission dialog
4. **Click "Turn In"**
5. **Go back to course** → Assignments tab
6. **As lecturer**: Click assignment → Select student
7. **Verify**: Student's submitted files should now be visible in the "Student Submission" section

## Files Modified

1. `/workspaces/succms/src/components/CoursePage.tsx` - Fixed table/field names
2. `/workspaces/succms/src/components/Assignments.tsx` - Fixed table/field names
3. `/workspaces/succms/src/App.tsx` - Fixed table name in crucial assignments checker
4. `/workspaces/succms/src/lib/database.types.ts` - Added missing column types
5. `/workspaces/succms/supabase/migrations/add_files_and_grades_to_submissions.sql` - **NEW: Database migration**

## Database Changes Summary

| Column | Type | Purpose |
|--------|------|---------|
| `files` | JSONB | Stores array of {name, path} objects for submitted files |
| `grade` | INTEGER | Lecturer-assigned grade |
| `feedback` | TEXT | Lecturer feedback on submission |

---

**Status**: ✅ Code fixes complete, awaiting database migration application
