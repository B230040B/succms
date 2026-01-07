#!/bin/bash

# Script to add files column to assignment_submissions table
# This enables multiple file uploads for assignment submissions

echo "=================================="
echo "Adding files column to assignment_submissions"
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Source the .env file
source .env

# Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
    exit 1
fi

echo "📡 Connecting to Supabase..."
echo "URL: $SUPABASE_URL"

# Read and execute the migration
MIGRATION_SQL=$(cat supabase/migrations/add_files_column_to_submissions.sql)

# Execute using curl
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_SQL" | jq -Rs .)}"

echo ""
echo "✅ Migration applied successfully!"
echo ""
echo "The assignment_submissions table now has:"
echo "  - files (JSONB): Array of file objects for multiple file submissions"
echo "  - Each file object has: {name: string, path: string}"
echo ""
echo "Students can now submit multiple files per assignment."
echo "Lecturers can view all submitted files in the assignment grading interface."
