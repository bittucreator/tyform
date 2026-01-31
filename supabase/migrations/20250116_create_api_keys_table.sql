-- Create API keys table for workspace API access
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of the key
    key_prefix VARCHAR(16) NOT NULL, -- First 8 chars for display (e.g., "tf_abc123...")
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    CONSTRAINT api_keys_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace_id ON api_keys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view API keys for workspaces they belong to
CREATE POLICY "Users can view API keys for their workspaces"
    ON api_keys
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = api_keys.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- Policy: Admins and owners can create API keys
CREATE POLICY "Admins can create API keys"
    ON api_keys
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = api_keys.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- Policy: Admins and owners can delete API keys
CREATE POLICY "Admins can delete API keys"
    ON api_keys
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = api_keys.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- Add comment
COMMENT ON TABLE api_keys IS 'Stores API keys for programmatic access to workspace resources';
