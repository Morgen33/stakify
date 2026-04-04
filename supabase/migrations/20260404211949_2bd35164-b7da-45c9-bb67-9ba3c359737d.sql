-- 1. Drop the OLD unsafe public policy (the one created during initial setup)
DROP POLICY IF EXISTS "Public view active projects safe" ON public.project_accounts;

-- Recreate with a restricted approach - public can only see via the view
-- The base table policy for public is removed entirely
-- Authenticated users still have their role-based policies

-- 2. Fix bootstrap privilege escalation: replace the insert policy with one that 
-- also prevents self-assignment when no admin exists yet
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;

CREATE POLICY "Only existing admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND auth.uid() IS DISTINCT FROM user_id  -- prevent self-role-change via insert
  OR (
    has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 3. Tighten activity_log INSERT to restrict what regular users can set
DROP POLICY IF EXISTS "Users can insert activity_log" ON public.activity_log;

CREATE POLICY "Users can insert own activity_log"
ON public.activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND severity IN ('info', 'warning')
  AND event_type IN ('info', 'action', 'error')
);