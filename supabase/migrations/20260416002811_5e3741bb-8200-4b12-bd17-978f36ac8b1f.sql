
-- Add configurable columns to staking_pools
ALTER TABLE public.staking_pools
  ADD COLUMN IF NOT EXISTS allowed_modes text[] NOT NULL DEFAULT '{soft,hard,flexible}',
  ADD COLUMN IF NOT EXISTS custom_lock_options int[] NOT NULL DEFAULT '{7,14,30,60,90}',
  ADD COLUMN IF NOT EXISTS soft_reward_multiplier numeric NOT NULL DEFAULT 0.8,
  ADD COLUMN IF NOT EXISTS hard_reward_multiplier numeric NOT NULL DEFAULT 1.2,
  ADD COLUMN IF NOT EXISTS early_unlock_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pool_description text,
  ADD COLUMN IF NOT EXISTS pool_banner_url text;

-- Allow project owners to update their own pools
CREATE POLICY "Project owners update own pools"
ON public.staking_pools
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_accounts
    WHERE project_accounts.id = staking_pools.project_account_id
    AND project_accounts.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_accounts
    WHERE project_accounts.id = staking_pools.project_account_id
    AND project_accounts.owner_id = auth.uid()
  )
);

-- Protect platform_fee_pct from project owner changes on staking_pools
CREATE OR REPLACE FUNCTION public.restrict_pool_owner_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins, masters, and operators can change anything
  IF has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master') OR has_role(auth.uid(), 'operator') THEN
    RETURN NEW;
  END IF;

  -- Project owners cannot modify protected fields
  IF NEW.platform_fee_pct IS DISTINCT FROM OLD.platform_fee_pct THEN
    RAISE EXCEPTION 'You cannot modify the platform fee.';
  END IF;
  IF NEW.early_unlock_fee_pct IS DISTINCT FROM OLD.early_unlock_fee_pct THEN
    RAISE EXCEPTION 'You cannot modify the early unlock fee.';
  END IF;
  IF NEW.total_staked IS DISTINCT FROM OLD.total_staked THEN
    RAISE EXCEPTION 'You cannot modify total staked.';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'You cannot modify the pool status.';
  END IF;
  IF NEW.project_account_id IS DISTINCT FROM OLD.project_account_id THEN
    RAISE EXCEPTION 'You cannot transfer pool ownership.';
  END IF;
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'You cannot modify the creator.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER restrict_pool_owner_updates_trigger
BEFORE UPDATE ON public.staking_pools
FOR EACH ROW
EXECUTE FUNCTION public.restrict_pool_owner_updates();
