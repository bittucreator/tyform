-- Fix RLS policies for workspace_domains to avoid infinite recursion with workspace_members
-- Simple policy: Allow users to see domains they created

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view domains for their workspaces" ON workspace_domains;
DROP POLICY IF EXISTS "Users can view domains" ON workspace_domains;

-- Create simple SELECT policy based on creator
-- This avoids the workspace_members recursion issue
CREATE POLICY "Users can view domains"
    ON workspace_domains
    FOR SELECT
    USING (created_by = auth.uid());
