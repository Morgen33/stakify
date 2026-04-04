
-- 1. Fix privilege escalation: tighten user_roles INSERT policy
DROP POLICY IF EXISTS "Only existing admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Create airdrops table for project owners to send rewards to stakers
CREATE TABLE public.airdrops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_account_id uuid NOT NULL REFERENCES public.project_accounts(id) ON DELETE CASCADE,
  pool_id uuid REFERENCES public.staking_pools(id) ON DELETE SET NULL,
  recipient_user_id uuid NOT NULL,
  airdrop_type text NOT NULL DEFAULT 'token',
  asset_name text NOT NULL,
  asset_image_url text,
  amount numeric NOT NULL DEFAULT 0,
  message text,
  status text NOT NULL DEFAULT 'pending',
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.airdrops ENABLE ROW LEVEL SECURITY;

-- Users can view their own airdrops
CREATE POLICY "Users view own airdrops"
ON public.airdrops FOR SELECT TO authenticated
USING (auth.uid() = recipient_user_id);

-- Project owners can insert airdrops for their project
CREATE POLICY "Project owners send airdrops"
ON public.airdrops FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_accounts
    WHERE project_accounts.id = airdrops.project_account_id
    AND project_accounts.owner_id = auth.uid()
  )
);

-- Project owners can view airdrops they sent
CREATE POLICY "Project owners view sent airdrops"
ON public.airdrops FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_accounts
    WHERE project_accounts.id = airdrops.project_account_id
    AND project_accounts.owner_id = auth.uid()
  )
);

-- Admins full access
CREATE POLICY "Admins full access airdrops"
ON public.airdrops FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can update their own airdrops (claim)
CREATE POLICY "Users claim own airdrops"
ON public.airdrops FOR UPDATE TO authenticated
USING (auth.uid() = recipient_user_id)
WITH CHECK (auth.uid() = recipient_user_id);

-- Operators can view airdrops
CREATE POLICY "Operators read airdrops"
ON public.airdrops FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'operator'::app_role));
