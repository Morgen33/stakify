
-- Fix: Restrict profile visibility so users only see their own profile
-- (Admins/operators already have separate policies)
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "Admins view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
