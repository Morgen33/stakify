-- Master can already do everything via "Masters full access user_roles" policy
-- But let's also ensure the admin insert policy is correct after previous migration
DROP POLICY IF EXISTS "Admins can insert non-master roles" ON public.user_roles;
CREATE POLICY "Admins can insert non-master roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND role != 'master'::app_role
);