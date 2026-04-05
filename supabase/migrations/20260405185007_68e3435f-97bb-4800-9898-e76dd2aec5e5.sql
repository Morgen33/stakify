
-- Fix 1: Add WITH CHECK to admin UPDATE policy on user_roles
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND role <> 'master'::app_role);

-- Fix 2: Trigger to restrict project owner column changes
CREATE OR REPLACE FUNCTION public.restrict_project_owner_updates()
RETURNS TRIGGER
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
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    RAISE EXCEPTION 'You cannot modify the payment status.';
  END IF;
  IF NEW.payment_plan IS DISTINCT FROM OLD.payment_plan THEN
    RAISE EXCEPTION 'You cannot modify the payment plan.';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'You cannot modify the account status.';
  END IF;
  IF NEW.blacklisted_at IS DISTINCT FROM OLD.blacklisted_at THEN
    RAISE EXCEPTION 'You cannot modify the blacklist status.';
  END IF;
  IF NEW.blacklist_reason IS DISTINCT FROM OLD.blacklist_reason THEN
    RAISE EXCEPTION 'You cannot modify the blacklist reason.';
  END IF;
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'You cannot transfer project ownership.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER restrict_project_owner_updates
BEFORE UPDATE ON public.project_accounts
FOR EACH ROW
EXECUTE FUNCTION public.restrict_project_owner_updates();
