#!/bin/bash

# This script applies the migration to add grade and feedback columns to assignment_submissions

echo "🔧 Applying database migration..."
echo ""
echo "This will add 'grade' and 'feedback' columns to the assignment_submissions table."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or apply the migration manually through Supabase Dashboard:"
    echo "  1. Go to https://supabase.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Go to SQL Editor"
    echo "  4. Run the following SQL:"
    echo ""
    cat supabase/migrations/add_grade_to_submissions.sql
    echo ""
    exit 1
fi

echo "Applying migration using Supabase CLI..."
supabase db push

echo ""
echo "✅ Migration complete!"
echo ""
echo "The assignment_submissions table now has:"
echo "  - grade (INTEGER): The score assigned by the lecturer"
echo "  - feedback (TEXT): Feedback provided by the lecturer"
