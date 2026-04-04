
-- Raffles table
CREATE TABLE public.raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  ticket_price numeric NOT NULL DEFAULT 0.01,
  currency text NOT NULL DEFAULT 'ETH',
  max_tickets integer NOT NULL DEFAULT 100,
  tickets_sold integer NOT NULL DEFAULT 0,
  prize_description text NOT NULL,
  prize_image_url text,
  prize_type text NOT NULL DEFAULT 'nft',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  winner_user_id uuid,
  status text NOT NULL DEFAULT 'upcoming',
  project_account_id uuid REFERENCES public.project_accounts(id) ON DELETE SET NULL,
  listing_fee numeric NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Raffles viewable by everyone" ON public.raffles FOR SELECT TO public USING (true);
CREATE POLICY "Admins full access raffles" ON public.raffles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Operators read raffles" ON public.raffles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'operator'::app_role));
CREATE POLICY "Project owners create raffles" ON public.raffles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.project_accounts WHERE id = raffles.project_account_id AND owner_id = auth.uid()));
CREATE POLICY "Project owners view own raffles" ON public.raffles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_accounts WHERE id = raffles.project_account_id AND owner_id = auth.uid()));
CREATE POLICY "Project owners update own raffles" ON public.raffles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.project_accounts WHERE id = raffles.project_account_id AND owner_id = auth.uid()));

-- Raffle tickets
CREATE TABLE public.raffle_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ticket_count integer NOT NULL DEFAULT 1,
  tx_hash text,
  paid_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ETH',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own tickets" ON public.raffle_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users buy tickets" ON public.raffle_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access tickets" ON public.raffle_tickets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Project owners view raffle tickets" ON public.raffle_tickets FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.raffles r JOIN public.project_accounts pa ON r.project_account_id = pa.id
    WHERE r.id = raffle_tickets.raffle_id AND pa.owner_id = auth.uid()
  ));

-- Feature toggle settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('feature_arcade', 'true'),
  ('feature_leaderboard', 'true'),
  ('feature_raffle', 'false'),
  ('feature_prize_wheel', 'true'),
  ('feature_seasonal_decorations', 'true'),
  ('seasonal_theme', 'none'),
  ('seasonal_message', ''),
  ('raffle_listing_fee', '0.05')
ON CONFLICT DO NOTHING;
