
-- Add project_owner to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_owner';

-- Project accounts table - represents projects onboarded to the platform
CREATE TABLE public.project_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  project_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  contact_email text,
  platform_fee_pct numeric NOT NULL DEFAULT 10,
  payment_plan text NOT NULL DEFAULT 'upfront' CHECK (payment_plan IN ('upfront', 'gradual')),
  payment_status text NOT NULL DEFAULT 'active' CHECK (payment_status IN ('active', 'overdue', 'suspended', 'blacklisted')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'blacklisted')),
  blacklisted_at timestamp with time zone,
  blacklist_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Project payments tracking
CREATE TABLE public.project_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.project_accounts(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ETH',
  payment_type text NOT NULL DEFAULT 'platform_fee' CHECK (payment_type IN ('platform_fee', 'onboarding', 'penalty', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add project_account_id to staking_pools to link pools to projects
ALTER TABLE public.staking_pools ADD COLUMN project_account_id uuid REFERENCES public.project_accounts(id);

-- Enable RLS
ALTER TABLE public.project_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_payments ENABLE ROW LEVEL SECURITY;

-- Project accounts RLS
CREATE POLICY "Admins full access project_accounts" ON public.project_accounts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Project owners view own account" ON public.project_accounts FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Project owners update own account limited" ON public.project_accounts FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Public view active projects" ON public.project_accounts FOR SELECT TO public USING (status = 'active');

-- Project payments RLS
CREATE POLICY "Admins full access project_payments" ON public.project_payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Project owners view own payments" ON public.project_payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.project_accounts WHERE id = project_id AND owner_id = auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_project_accounts_updated_at BEFORE UPDATE ON public.project_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
