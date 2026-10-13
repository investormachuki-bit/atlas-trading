-- ATLAS signal evaluation ledger v1
-- Additive only: preserves existing setups, signals, trades and historical backtests.
CREATE TABLE IF NOT EXISTS public.signal_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL UNIQUE REFERENCES public.signals(id) ON DELETE RESTRICT,
  setup_id uuid NOT NULL REFERENCES public.setups(id) ON DELETE RESTRICT,
  organization_id uuid NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
  timeframe text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('long','short','LONG','SHORT','buy','sell','BUY','SELL')),
  signal_candle_time timestamptz NOT NULL,
  entry_price numeric NOT NULL CHECK (entry_price > 0),
  stop_price numeric NOT NULL CHECK (stop_price > 0),
  tp1_price numeric NULL CHECK (tp1_price IS NULL OR tp1_price > 0),
  tp2_price numeric NULL CHECK (tp2_price IS NULL OR tp2_price > 0),
  tp3_price numeric NULL CHECK (tp3_price IS NULL OR tp3_price > 0),
  risk_distance numeric NOT NULL CHECK (risk_distance > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','evaluating','closed','expired','invalidated','data_gap')),
  tp1_reached boolean NOT NULL DEFAULT false,
  tp2_reached boolean NOT NULL DEFAULT false,
  tp3_reached boolean NOT NULL DEFAULT false,
  stop_reached boolean NOT NULL DEFAULT false,
  terminal_outcome text NULL CHECK (terminal_outcome IS NULL OR terminal_outcome IN ('stop_loss','tp1','tp2','tp3','timeout','invalidated','unresolved')),
  exit_price numeric NULL,
  realized_r numeric NULL,
  evaluated_through timestamptz NULL,
  closed_at timestamptz NULL,
  evaluator_version text NOT NULL DEFAULT 'signal-evaluator-v1',
  execution_assumptions jsonb NOT NULL DEFAULT '{}'::jsonb,
  feature_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (tp2_reached = false OR tp1_reached = true),
  CHECK (tp3_reached = false OR tp2_reached = true),
  CHECK (terminal_outcome IS NULL OR status IN ('closed','expired','invalidated','data_gap'))
);
CREATE INDEX IF NOT EXISTS signal_evaluations_org_created_idx ON public.signal_evaluations (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS signal_evaluations_market_tf_status_idx ON public.signal_evaluations (market_id, timeframe, status);
CREATE INDEX IF NOT EXISTS signal_evaluations_signal_time_idx ON public.signal_evaluations (signal_candle_time DESC);
ALTER TABLE public.signal_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS signal_evaluations_member_read ON public.signal_evaluations;
CREATE POLICY signal_evaluations_member_read ON public.signal_evaluations
  FOR SELECT TO authenticated
  USING (organization_id IS NULL OR public.is_org_member(organization_id));
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.signal_evaluations FROM anon, authenticated;
GRANT SELECT ON public.signal_evaluations TO authenticated;
GRANT ALL ON public.signal_evaluations TO service_role;
