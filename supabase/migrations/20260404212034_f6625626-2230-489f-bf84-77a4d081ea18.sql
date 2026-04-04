-- Remove the original public policy that exposes sensitive data
DROP POLICY IF EXISTS "Public view active projects" ON public.project_accounts;

-- Also consolidate the duplicate insert policies on user_roles
-- (The old "Admins can insert roles" was dropped, but let's be sure)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;