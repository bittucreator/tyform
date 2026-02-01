-- Create webhook_logs table for tracking webhook delivery attempts
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_id UUID REFERENCES responses(id) ON DELETE SET NULL,
  webhook_id TEXT NOT NULL, -- ID of the webhook from form settings
  webhook_url TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'response.created' | 'response.updated'
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  status_code INTEGER, -- HTTP status code returned
  request_body JSONB, -- The payload sent to the webhook
  response_body TEXT, -- Response from the webhook endpoint (truncated if too long)
  error_message TEXT, -- Error message if failed
  duration_ms INTEGER, -- How long the request took
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for querying by form
  CONSTRAINT fk_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX idx_webhook_logs_form_id ON webhook_logs(form_id);
CREATE INDEX idx_webhook_logs_response_id ON webhook_logs(response_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);

-- Enable RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view webhook logs for forms they own (through workspaces)
CREATE POLICY "Users can view webhook logs for their forms" ON webhook_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms f
      JOIN workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE f.id = webhook_logs.form_id
      AND wm.user_id = auth.uid()
    )
  );

-- Policy: Service role can insert logs (for webhook delivery)
CREATE POLICY "Service role can insert webhook logs" ON webhook_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can delete logs for their forms
CREATE POLICY "Users can delete webhook logs for their forms" ON webhook_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms f
      JOIN workspace_members wm ON wm.workspace_id = f.workspace_id
      WHERE f.id = webhook_logs.form_id
      AND wm.user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE webhook_logs IS 'Stores webhook delivery logs for form responses';
COMMENT ON COLUMN webhook_logs.webhook_id IS 'The ID of the webhook configuration from form settings';
COMMENT ON COLUMN webhook_logs.status IS 'success: 2xx response, failed: error or non-2xx, pending: not yet delivered';
COMMENT ON COLUMN webhook_logs.duration_ms IS 'Request duration in milliseconds';
COMMENT ON COLUMN webhook_logs.retry_count IS 'Number of retry attempts for failed webhooks';
