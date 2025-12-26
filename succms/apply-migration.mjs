#!/usr/bin/env node

/**
 * Apply Grade Migration
 * This script adds grade and feedback columns to assignment_submissions table
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
-- Add grade and feedback columns to assignment_submissions table
ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS feedback TEXT;
`;

async function applyMigration() {
  console.log('🔧 Checking if migration is needed...');
  console.log('');

  try {
    // Check if columns already exist
    const { error: queryError } = await supabase
      .from('assignment_submissions')
      .select('grade, feedback')
      .limit(1);

    if (queryError && queryError.message.includes('column') && queryError.message.includes('does not exist')) {
      console.error('❌ Migration needs to be applied manually');
      console.error('');
      console.error('The grade and feedback columns do not exist.');
      console.error('');
      console.error('Please follow these steps:');
      console.error('1. Go to https://supabase.com/dashboard');
      console.error('2. Select your project');
      console.error('3. Go to SQL Editor');
      console.error('4. Run the following SQL:');
      console.error('');
      console.error(migrationSQL);
      console.error('');
      console.error('COMMENT ON COLUMN public.assignment_submissions.grade IS \'The grade/score assigned by the lecturer\';');
      console.error('COMMENT ON COLUMN public.assignment_submissions.feedback IS \'Feedback provided by the lecturer\';');
      process.exit(1);
    } else if (!queryError) {
      console.log('✅ Columns already exist! No migration needed.');
      console.log('');
      console.log('The assignment_submissions table already has grade and feedback columns.');
      console.log('');
      console.log('If grades still aren\'t displaying, try:');
      console.log('1. Refresh your browser');
      console.log('2. Check if there are any existing grades in the database');
      console.log('3. Try grading an assignment as a lecturer');
      process.exit(0);
    } else {
      throw queryError;
    }
  } catch (err) {
    console.error('❌ Error checking migration status:', err);
    console.error('');
    console.error('Please apply the migration manually through Supabase Dashboard.');
    process.exit(1);
  }
}

applyMigration();
