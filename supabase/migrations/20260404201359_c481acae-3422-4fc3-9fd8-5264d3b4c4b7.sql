-- Allow admins to update any stake (emergency unlock)
CREATE POLICY "Admins update any stake"
ON public.stakes
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete stakes if needed
CREATE POLICY "Admins delete any stake"
ON public.stakes
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Change amount to numeric for precision
ALTER TABLE public.stakes ALTER COLUMN amount TYPE numeric USING amount::numeric;
ALTER TABLE public.staking_pools ALTER COLUMN total_staked TYPE numeric USING total_staked::numeric;