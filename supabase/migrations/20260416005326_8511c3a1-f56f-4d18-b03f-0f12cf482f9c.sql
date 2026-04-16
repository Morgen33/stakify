-- Fix critical: prevent admins from deleting master roles
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete non-master roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) AND role <> 'master'::app_role);

-- Fix warning: let users read their own activity log
CREATE POLICY "Users view own activity_log"
  ON public.activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);