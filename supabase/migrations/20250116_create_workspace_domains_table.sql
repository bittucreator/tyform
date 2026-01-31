-- Create workspace domains table for custom domain management
CREATE TABLE IF NOT EXISTS workspace_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    verification_token VARCHAR(64) NOT NULL, -- Unique token for TXT record verification
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    
    CONSTRAINT workspace_domains_domain_format CHECK (domain ~* '^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$')
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_domains_workspace_id ON workspace_domains(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_domains_domain ON workspace_domains(domain);
CREATE INDEX IF NOT EXISTS idx_workspace_domains_status ON workspace_domains(status);

-- Enable RLS
ALTER TABLE workspace_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view domains for workspaces they belong to
CREATE POLICY "Users can view domains for their workspaces"
    ON workspace_domains
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = workspace_domains.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- Policy: Admins and owners can create domains
CREATE POLICY "Admins can create domains"
    ON workspace_domains
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = workspace_domains.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- Policy: Admins and owners can update domains
CREATE POLICY "Admins can update domains"
    ON workspace_domains
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = workspace_domains.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- Policy: Admins and owners can delete domains
CREATE POLICY "Admins can delete domains"
    ON workspace_domains
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = workspace_domains.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- Add comment
COMMENT ON TABLE workspace_domains IS 'Stores custom domains for workspace forms with verification status';
