ALTER TABLE public.staking_pools ADD COLUMN IF NOT EXISTS early_unlock_fee_pct numeric NOT NULL DEFAULT 5;

CREATE TABLE IF NOT EXISTS public.early_unlock_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_id uuid NOT NULL REFERENCES public.stakes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  pool_id uuid NOT NULL REFERENCES public.staking_pools(id),
  fee_amount numeric NOT NULL DEFAULT 0,
  fee_currency text NOT NULL DEFAULT 'ETH',
  admin_share numeric NOT NULL DEFAULT 0,
  operator_share numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid
);

ALTER TABLE public.early_unlock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access early_unlock" ON public.early_unlock_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators read early_unlock" ON public.early_unlock_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Users request own early_unlock" ON public.early_unlock_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own early_unlock" ON public.early_unlock_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.project_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_account_id uuid NOT NULL REFERENCES public.project_accounts(id) ON DELETE CASCADE,
  reward_type text NOT NULL DEFAULT 'points',
  amount numeric NOT NULL DEFAULT 0,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access project_rewards" ON public.project_rewards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Operators read project_rewards" ON public.project_rewards
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Project owners view own rewards" ON public.project_rewards
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_accounts WHERE project_accounts.id = project_rewards.project_account_id AND project_accounts.owner_id = auth.uid()
  ));