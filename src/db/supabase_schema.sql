// This file defines the Supabase database schema for user workflow submissions
// It should be executed in the Supabase SQL editor to create the necessary table

-- Create table for tracking user-specific workflow submissions
CREATE TABLE user_workflow_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  workflow_id INTEGER NOT NULL,
  submission_count INTEGER DEFAULT 0,
  has_processing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workflow_id)
);

-- Add Row Level Security (RLS) to ensure users can only access their own data
ALTER TABLE user_workflow_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting records (users can only see their own data)
CREATE POLICY "Users can view their own submission counts" 
  ON user_workflow_submissions
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Create policy for inserting records
CREATE POLICY "Users can insert their own submission counts" 
  ON user_workflow_submissions
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Create policy for updating records
CREATE POLICY "Users can update their own submission counts" 
  ON user_workflow_submissions
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Create function to increment submission count
CREATE OR REPLACE FUNCTION increment_submission_count(
  p_user_id TEXT,
  p_workflow_id INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_workflow_submissions (user_id, workflow_id, submission_count)
  VALUES (p_user_id, p_workflow_id, 1)
  ON CONFLICT (user_id, workflow_id) 
  DO UPDATE SET 
    submission_count = user_workflow_submissions.submission_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql; 