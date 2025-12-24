-- Create usage_tracking table
-- This table tracks usage of rate-limited features per user
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('bet', 'ai_insight', 'export')),
  count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, resource_type, period_start)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_resource_type_idx ON usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS usage_tracking_period_idx ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS usage_tracking_user_resource_period_idx ON usage_tracking(user_id, resource_type, period_start);

-- Enable Row Level Security
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own usage
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Create policy: Users can insert their own usage (for tracking)
CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Create policy: Users can update their own usage
CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

