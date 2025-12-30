# Grade Display Fix

## Problem
Grades are not displaying on assignment cards or in the assignment details view because the `assignment_submissions` table is missing the `grade` and `feedback` columns.

## Root Cause
The database schema defined `assignment_submissions` without grade/feedback columns, but the application code expects these fields to exist.

## Solution
Add `grade` and `feedback` columns to the `assignment_submissions` table.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy and paste the following SQL:

```sql
-- Add grade and feedback columns to assignment_submissions table
ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.assignment_submissions.grade IS 'The grade/score assigned by the lecturer';
COMMENT ON COLUMN public.assignment_submissions.feedback IS 'Feedback provided by the lecturer';
```

6. Click "Run" to execute the migration
7. Verify the columns were added by going to "Table Editor" > "assignment_submissions"

### Option 2: Using Supabase CLI
If you have Supabase CLI installed:

```bash
cd /workspaces/succms/succms
./apply-grade-migration.sh
```

### Option 3: Manual SQL via psql
If you have direct database access:

```bash
psql <your-connection-string> -f supabase/migrations/add_grade_to_submissions.sql
```

## Verification
After applying the migration:

1. Go to your application
2. As a lecturer, grade an assignment
3. As a student, view the assignment
4. The grade should now display:
   - On the assignment card in the list
   - In the assignment details modal
   - In a green badge showing "Graded"

## Files Modified
- `/workspaces/succms/succms/supabase/schema.sql` - Updated schema documentation
- `/workspaces/succms/succms/supabase/migrations/add_grade_to_submissions.sql` - Migration file
- `/workspaces/succms/succms/apply-grade-migration.sh` - Helper script to apply migration

## No Code Changes Required
The application code in CoursePage.tsx is already correctly written to use these fields. Once the database schema is updated, grades will display automatically.
