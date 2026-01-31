-- Domain URLs (Pretty URLs) for mapping forms to custom domain paths
CREATE TABLE IF NOT EXISTS domain_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique slug per domain
  UNIQUE(domain_id, slug)
);

-- Add workspace_id to domains table for better querying
ALTER TABLE domains ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add favicon and meta columns to domains table
ALTER TABLE domains ADD COLUMN IF NOT EXISTS favicon TEXT;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE domains ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS meta_image TEXT;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS search_indexing BOOLEAN DEFAULT true;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS code_injection TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_domain_urls_domain_id ON domain_urls(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_urls_form_id ON domain_urls(form_id);
CREATE INDEX IF NOT EXISTS idx_domain_urls_slug ON domain_urls(slug);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
CREATE INDEX IF NOT EXISTS idx_domains_verified ON domains(verified);

-- Enable RLS
ALTER TABLE domain_urls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for domain_urls
CREATE POLICY "Users can view domain URLs for their domains" ON domain_urls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM domains 
      WHERE domains.id = domain_urls.domain_id 
      AND domains.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert domain URLs for their domains" ON domain_urls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM domains 
      WHERE domains.id = domain_urls.domain_id 
      AND domains.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update domain URLs for their domains" ON domain_urls
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM domains 
      WHERE domains.id = domain_urls.domain_id 
      AND domains.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete domain URLs for their domains" ON domain_urls
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM domains 
      WHERE domains.id = domain_urls.domain_id 
      AND domains.user_id = auth.uid()
    )
  );
