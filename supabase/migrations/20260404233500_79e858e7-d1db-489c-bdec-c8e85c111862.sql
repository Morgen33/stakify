
-- Master gets full access on all tables
CREATE POLICY "Masters full access activity_log" ON public.activity_log FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access airdrops" ON public.airdrops FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access badges" ON public.badges FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access early_unlock" ON public.early_unlock_requests FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access settings" ON public.platform_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access wallets" ON public.platform_wallets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters view all profiles" ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters update all profiles" ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access project_accounts" ON public.project_accounts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access project_payments" ON public.project_payments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access project_rewards" ON public.project_rewards FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access raffle_tickets" ON public.raffle_tickets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access raffles" ON public.raffles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access referrals" ON public.referrals FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access stakes" ON public.stakes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access staking_pools" ON public.staking_pools FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access user_badges" ON public.user_badges FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Masters full access user_roles" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

-- Master wallets table
CREATE TABLE public.master_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  address text NOT NULL,
  wallet_purpose text NOT NULL DEFAULT 'fee_collection',
  is_active boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.master_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Masters full access master_wallets" ON public.master_wallets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

-- Fee waivers table
CREATE TABLE public.fee_waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  project_account_id uuid,
  waiver_type text NOT NULL DEFAULT 'full',
  reason text,
  granted_by uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_waivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Masters full access fee_waivers" ON public.fee_waivers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Admins read fee_waivers" ON public.fee_waivers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
