-- Team Invitations and Members Schema for Tyform
-- Run this in Supabase SQL Editor
-- NOTE: Run 003_workspaces.sql FIRST before running this migration

-- Team Invitations Table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTE: Team members are now managed via workspace_members table in 003_workspaces.sql

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_inviter ON team_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_workspace ON team_invitations(workspace_id);

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Invitations: Users can manage their own invitations
CREATE POLICY "Users can view their sent invitations"
  ON team_invitations FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their invitations"
  ON team_invitations FOR UPDATE
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can delete their invitations"
  ON team_invitations FOR DELETE
  USING (auth.uid() = inviter_id);

-- Allow anyone to view invitation by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
  ON team_invitations FOR SELECT
  USING (true);

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run expiration (requires pg_cron extension)
-- SELECT cron.schedule('expire-invitations', '0 * * * *', 'SELECT expire_old_invitations()');
