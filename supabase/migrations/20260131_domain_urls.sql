-- Domain URLs (Pretty URLs) for mapping forms to custom domain paths
-- Uses workspace_domains table which is the main domains table used in Settings modal
CREATE TABLE IF NOT EXISTS domain_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES workspace_domains(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_image TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique slug per domain
  UNIQUE(domain_id, slug)
);

-- Add favicon and meta columns to workspace_domains table
ALTER TABLE workspace_domains ADD COLUMN IF NOT EXISTS favicon TEXT;
ALTER TABLE workspace_domains ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE workspace_domains ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE workspace_domains ADD COLUMN IF NOT EXISTS meta_image TEXT;
ALTER TABLE workspace_domains ADD COLUMN IF NOT EXISTS search_indexing BOOLEAN DEFAULT true;
ALTER TABLE workspace_domains ADD COLUMN IF NOT EXISTS code_injection TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_domain_urls_domain_id ON domain_urls(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_urls_form_id ON domain_urls(form_id);
CREATE INDEX IF NOT EXISTS idx_domain_urls_slug ON domain_urls(slug);
CREATE INDEX IF NOT EXISTS idx_domain_urls_user_id ON domain_urls(user_id);

-- Enable RLS
ALTER TABLE domain_urls ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies using direct user_id (avoids recursion)
CREATE POLICY "domain_urls_select" ON domain_urls
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "domain_urls_insert" ON domain_urls
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "domain_urls_update" ON domain_urls
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "domain_urls_delete" ON domain_urls
  FOR DELETE USING (user_id = auth.uid());
