-- Create admin_audit_log table
-- This table stores all admin actions for audit purposes
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL, -- Could be 'system' or admin email
  action TEXT NOT NULL CHECK (action IN ('grant_access', 'revoke_access', 'update_tier', 'bulk_action')),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  old_tier TEXT,
  new_tier TEXT,
  reason TEXT,
  metadata JSONB, -- Stores any extra data (specialPricing, customPrice, expiryDate, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS admin_audit_log_user_id_idx ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_id_idx ON admin_audit_log(admin_id);

-- Enable Row Level Security
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins (via service role) can access this table
-- In production, this should be accessed via service role key which bypasses RLS
-- For now, we'll create a policy that allows service role access
-- Note: Service role key bypasses RLS, so this is mainly for documentation

