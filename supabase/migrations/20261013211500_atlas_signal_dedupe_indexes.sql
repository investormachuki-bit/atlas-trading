CREATE UNIQUE INDEX IF NOT EXISTS setups_market_strategy_detected_unique ON public.setups (market_id, strategy_id, detected_at);
CREATE UNIQUE INDEX IF NOT EXISTS signals_setup_unique ON public.signals (setup_id);
