-- LeadLines Maximum Permissions SQL
-- This script implements fully permissive policies for all tables and storage buckets
-- while maintaining the original ID mapping between components

-- =============================================
-- SECTION 1: CSV SUBMISSIONS TABLE
-- =============================================

-- Drop existing policies for csv_submissions table
DROP POLICY IF EXISTS "Users can view their own submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Users can delete their own submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Allow anonymous inserts to csv_submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Allow Firebase authenticated inserts to csv_submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Allow all inserts to csv_submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Users can view all submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Users can update all submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Users can delete all submissions" ON csv_submissions;
DROP POLICY IF EXISTS "Allow all operations on csv_submissions" ON csv_submissions;

-- Create a single fully permissive policy for csv_submissions
CREATE POLICY "Allow all operations on csv_submissions" 
ON csv_submissions FOR ALL 
TO anon, authenticated
USING (true) 
WITH CHECK (true);

-- Make sure RLS is enabled for csv_submissions
ALTER TABLE csv_submissions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECTION 2: STORAGE BUCKETS
-- =============================================

-- Drop existing policies for csv-files bucket
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to csv-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow Firebase authenticated uploads to csv-files" ON storage.objects;
DROP POLICY IF EXISTS "CSV files storage delete policy" ON storage.objects;
DROP POLICY IF EXISTS "CSV files storage insert policy" ON storage.objects;
DROP POLICY IF EXISTS "CSV files storage read policy" ON storage.objects;
DROP POLICY IF EXISTS "CSV files storage update policy" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to csv-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow viewing all files in csv-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow updating all files in csv-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow deleting all files in csv-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on csv-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own files 1ebbldc_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload their own files 1ebbldc_0" ON storage.objects;

-- Create a single fully permissive policy for all storage operations
CREATE POLICY "Allow all storage operations" 
ON storage.objects FOR ALL 
TO anon, authenticated
USING (true) 
WITH CHECK (true);

-- =============================================
-- SECTION 3: AI ASSISTANT TABLES (if they exist)
-- =============================================

-- Check if user_assistants table exists and apply permissive policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_assistants') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "user_assistants_select_policy" ON user_assistants;
    DROP POLICY IF EXISTS "user_assistants_insert_policy" ON user_assistants;
    DROP POLICY IF EXISTS "user_assistants_update_policy" ON user_assistants;
    DROP POLICY IF EXISTS "user_assistants_delete_policy" ON user_assistants;
    
    -- Create fully permissive policy
    CREATE POLICY "Allow all operations on user_assistants" 
    ON user_assistants FOR ALL 
    TO anon, authenticated
    USING (true) 
    WITH CHECK (true);
    
    -- Make sure RLS is enabled
    ALTER TABLE user_assistants ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check if assistant_files table exists and apply permissive policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assistant_files') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "assistant_files_select_policy" ON assistant_files;
    DROP POLICY IF EXISTS "assistant_files_insert_policy" ON assistant_files;
    DROP POLICY IF EXISTS "assistant_files_update_policy" ON assistant_files;
    DROP POLICY IF EXISTS "assistant_files_delete_policy" ON assistant_files;
    
    -- Create fully permissive policy
    CREATE POLICY "Allow all operations on assistant_files" 
    ON assistant_files FOR ALL 
    TO anon, authenticated
    USING (true) 
    WITH CHECK (true);
    
    -- Make sure RLS is enabled
    ALTER TABLE assistant_files ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check if assistant_threads table exists and apply permissive policies
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assistant_threads') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "assistant_threads_select_policy" ON assistant_threads;
    DROP POLICY IF EXISTS "assistant_threads_insert_policy" ON assistant_threads;
    DROP POLICY IF EXISTS "assistant_threads_update_policy" ON assistant_threads;
    DROP POLICY IF EXISTS "assistant_threads_delete_policy" ON assistant_threads;
    
    -- Create fully permissive policy
    CREATE POLICY "Allow all operations on assistant_threads" 
    ON assistant_threads FOR ALL 
    TO anon, authenticated
    USING (true) 
    WITH CHECK (true);
    
    -- Make sure RLS is enabled
    ALTER TABLE assistant_threads ENABLE ROW LEVEL SECURITY;
  END IF;
END $$; 