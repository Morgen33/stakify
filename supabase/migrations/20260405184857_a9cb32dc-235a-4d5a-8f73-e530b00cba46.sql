
CREATE OR REPLACE FUNCTION public.restrict_airdrop_claim_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the user is an admin, master, or operator, allow all changes
  IF has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master') OR has_role(auth.uid(), 'operator') THEN
    RETURN NEW;
  END IF;

  -- For regular users (recipients), restrict column changes
  -- Only allow status and claimed_at to change
  IF NEW.amount IS DISTINCT FROM OLD.amount THEN
    RAISE EXCEPTION 'You cannot modify the airdrop amount.';
  END IF;
  IF NEW.asset_name IS DISTINCT FROM OLD.asset_name THEN
    RAISE EXCEPTION 'You cannot modify the asset name.';
  END IF;
  IF NEW.asset_image_url IS DISTINCT FROM OLD.asset_image_url THEN
    RAISE EXCEPTION 'You cannot modify the asset image.';
  END IF;
  IF NEW.airdrop_type IS DISTINCT FROM OLD.airdrop_type THEN
    RAISE EXCEPTION 'You cannot modify the airdrop type.';
  END IF;
  IF NEW.project_account_id IS DISTINCT FROM OLD.project_account_id THEN
    RAISE EXCEPTION 'You cannot modify the project account.';
  END IF;
  IF NEW.recipient_user_id IS DISTINCT FROM OLD.recipient_user_id THEN
    RAISE EXCEPTION 'You cannot modify the recipient.';
  END IF;
  IF NEW.pool_id IS DISTINCT FROM OLD.pool_id THEN
    RAISE EXCEPTION 'You cannot modify the pool.';
  END IF;
  IF NEW.message IS DISTINCT FROM OLD.message THEN
    RAISE EXCEPTION 'You cannot modify the message.';
  END IF;

  -- Only allow status transition from pending to claimed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status <> 'pending' OR NEW.status <> 'claimed' THEN
      RAISE EXCEPTION 'Invalid status transition. Can only change from pending to claimed.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER restrict_airdrop_claim_updates
BEFORE UPDATE ON public.airdrops
FOR EACH ROW
EXECUTE FUNCTION public.restrict_airdrop_claim_updates();
