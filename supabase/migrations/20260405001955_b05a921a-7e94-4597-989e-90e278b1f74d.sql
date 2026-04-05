-- Fix privilege escalation: remove the duplicate INSERT policy that lacks the master-role restriction
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;

-- Fix profiles INSERT/UPDATE policies: restrict to authenticated only
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);