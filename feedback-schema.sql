-- Create feedback table
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  feedback_type TEXT NOT NULL, -- 'Bug Report', 'Feature Request', 'General Feedback'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'reviewing', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX feedback_user_id_idx ON feedback(user_id);
CREATE INDEX feedback_status_idx ON feedback(status);
CREATE INDEX feedback_created_at_idx ON feedback(created_at);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING ((select auth.uid()) = user_id);

-- Create policy: Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Create policy: Users can update their own feedback
CREATE POLICY "Users can update own feedback" ON feedback
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Note: Users cannot delete feedback (only admin can via Supabase dashboard)
-- Admin access should be handled via service role key in admin views

