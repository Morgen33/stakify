
-- Activity log / Battle log for admin
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'info' CHECK (event_type IN ('error', 'warning', 'info', 'action', 'security', 'payment', 'system')),
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  message text NOT NULL,
  details jsonb,
  error_code text,
  source text,
  user_id uuid,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins full access activity_log" ON public.activity_log
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to insert logs (for error reporting)
CREATE POLICY "Users can insert activity_log" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
