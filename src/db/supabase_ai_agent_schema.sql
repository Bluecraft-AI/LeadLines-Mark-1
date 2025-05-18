-- Create table for associating users with their OpenAI Assistants
CREATE TABLE user_assistants (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,  -- Firebase user ID
  assistant_id TEXT NOT NULL,    -- OpenAI Assistant ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active'
);

-- Create table for storing files associated with each user's assistant
CREATE TABLE assistant_files (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,         -- Firebase user ID
  assistant_id TEXT NOT NULL,    -- OpenAI Assistant ID
  file_id TEXT NOT NULL,         -- OpenAI File ID
  filename TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, file_id)
);

-- Create table for storing conversation threads
CREATE TABLE assistant_threads (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,         -- Firebase user ID
  thread_id TEXT NOT NULL,       -- OpenAI Thread ID
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, thread_id)
);

-- Add Row Level Security (RLS) policies to ensure user data isolation
ALTER TABLE user_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_threads ENABLE ROW LEVEL SECURITY;

-- Create policies for user_assistants table
CREATE POLICY user_assistants_select_policy ON user_assistants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_assistants_insert_policy ON user_assistants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_assistants_update_policy ON user_assistants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_assistants_delete_policy ON user_assistants
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for assistant_files table
CREATE POLICY assistant_files_select_policy ON assistant_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY assistant_files_insert_policy ON assistant_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY assistant_files_update_policy ON assistant_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY assistant_files_delete_policy ON assistant_files
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for assistant_threads table
CREATE POLICY assistant_threads_select_policy ON assistant_threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY assistant_threads_insert_policy ON assistant_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY assistant_threads_update_policy ON assistant_threads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY assistant_threads_delete_policy ON assistant_threads
  FOR DELETE USING (auth.uid() = user_id);

-- Insert test data for the specified user (to be done manually in production)
-- This is just an example of how to associate a user with the test assistant
-- INSERT INTO user_assistants (user_id, assistant_id) 
-- VALUES ('YOUR_FIREBASE_USER_ID', 'asst_CrSvLhBU0gGPeixWGHDzbZtV'); 