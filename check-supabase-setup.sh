#!/bin/bash

# SUCCMS Supabase Setup Verification Script
# This script checks if all required environment variables and packages are set up

echo "=========================================="
echo "SUCCMS Supabase Setup Verification"
echo "=========================================="
echo ""

# Check if .env.local exists
echo "1. Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✓ .env.local file found"
    
    # Check for required env vars
    if grep -q "VITE_SUPABASE_URL" .env.local; then
        echo "✓ VITE_SUPABASE_URL is set"
    else
        echo "✗ VITE_SUPABASE_URL is missing"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo "✓ VITE_SUPABASE_ANON_KEY is set"
    else
        echo "✗ VITE_SUPABASE_ANON_KEY is missing"
    fi
else
    echo "✗ .env.local file not found"
    echo "  Please create one using .env.example as a template"
fi

echo ""
echo "2. Checking npm packages..."

# Check if package.json has Supabase dependencies
if grep -q "@supabase/supabase-js" package.json; then
    echo "✓ @supabase/supabase-js is in package.json"
else
    echo "✗ @supabase/supabase-js is missing from package.json"
fi

if grep -q "@supabase/auth-helpers-react" package.json; then
    echo "✓ @supabase/auth-helpers-react is in package.json"
else
    echo "✗ @supabase/auth-helpers-react is missing from package.json"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ node_modules directory found"
    
    if [ -d "node_modules/@supabase" ]; then
        echo "✓ Supabase packages are installed"
    else
        echo "✗ Supabase packages are not installed"
        echo "  Run: npm install"
    fi
else
    echo "✗ node_modules not found"
    echo "  Run: npm install"
fi

echo ""
echo "3. Checking required files..."

# Check for necessary files
files=(
    "src/lib/supabase.ts"
    "src/contexts/AuthContext.tsx"
    "src/hooks/useDatabase.ts"
    "supabase/schema.sql"
    "SUPABASE_SETUP.md"
    "SUPABASE_EXAMPLES.md"
    ".env.example"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file found"
    else
        echo "✗ $file missing"
    fi
done

echo ""
echo "4. Checking database schema..."

if [ -f "supabase/schema.sql" ]; then
    # Count tables
    table_count=$(grep -c "CREATE TABLE IF NOT EXISTS public\." supabase/schema.sql)
    echo "✓ Found $table_count database tables in schema.sql"
    
    # Check for RLS policies
    if grep -q "ROW LEVEL SECURITY" supabase/schema.sql; then
        echo "✓ RLS policies are included"
    fi
    
    # Check for triggers
    if grep -q "CREATE TRIGGER" supabase/schema.sql; then
        echo "✓ Database triggers are included"
    fi
else
    echo "✗ supabase/schema.sql not found"
fi

echo ""
echo "=========================================="
echo "Setup Verification Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If any checks failed, please address them"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test the authentication flow"
echo "4. Check Supabase dashboard for data"
echo ""
echo "For troubleshooting, see SUPABASE_SETUP.md"
