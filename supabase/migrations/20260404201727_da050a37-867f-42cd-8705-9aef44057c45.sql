-- Fix: Profiles only visible to authenticated users
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix: Platform settings only visible to admins
DROP POLICY IF EXISTS "Public read settings" ON public.platform_settings;
CREATE POLICY "Admins read settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));