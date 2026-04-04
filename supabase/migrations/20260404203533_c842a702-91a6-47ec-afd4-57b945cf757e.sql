
-- Platform wallets table
CREATE TABLE public.platform_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  address text NOT NULL,
  wallet_type text NOT NULL DEFAULT 'primary' CHECK (wallet_type IN ('primary', 'backup', 'emergency')),
  is_active boolean NOT NULL DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access wallets" ON public.platform_wallets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Operators view wallets" ON public.platform_wallets
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators read pools" ON public.staking_pools
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators read stakes" ON public.stakes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators read settings" ON public.platform_settings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators read activity_log" ON public.activity_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators read project_accounts" ON public.project_accounts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators read project_payments" ON public.project_payments
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators update pools" ON public.staking_pools
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'operator'::app_role));

CREATE POLICY "Operators update project_accounts" ON public.project_accounts
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'operator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'operator'::app_role));

CREATE TRIGGER update_platform_wallets_updated_at BEFORE UPDATE ON public.platform_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
