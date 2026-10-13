import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HEADERS = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
  "vary": "Origin",
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: HEADERS });
const num = (v: unknown): number | null => {
  const n = Number(v);
  return v === null || v === undefined || v === "" || !Number.isFinite(n) ? null : n;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
  if (req.method !== "POST") return response({ error: "POST required" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization) return response({ error: "Authorization required" }, 401);

  try {
    const userClient = createClient(URL, ANON, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return response({ error: "Unauthorized" }, 401);

    let body: { signal_id?: string };
    try { body = await req.json(); } catch { return response({ error: "Valid JSON body required" }, 400); }
    if (!body.signal_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.signal_id)) {
      return response({ error: "A valid signal_id UUID is required" }, 400);
    }

    const db = createClient(URL, SERVICE);
    const { data: signal, error: signalError } = await db.from("signals")
      .select("id,setup_id,organization_id,published_at,expires_at,status,message")
      .eq("id", body.signal_id).maybeSingle();
    if (signalError) return response({ error: signalError.message }, 500);
    if (!signal) return response({ error: "Signal not found" }, 404);

    if (signal.organization_id) {
      const { data: membership, error: memberError } = await db.from("organization_members")
        .select("organization_id")
        .eq("organization_id", signal.organization_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (memberError) return response({ error: memberError.message }, 500);
      if (!membership) return response({ error: "Forbidden" }, 403);
    }

    const { data: setup, error: setupError } = await db.from("setups")
      .select("id,market_id,strategy_id,detected_at,direction,entry_price,stop_price,tp1_price,tp2_price,tp3_price,rationale,feature_vector")
      .eq("id", signal.setup_id).maybeSingle();
    if (setupError) return response({ error: setupError.message }, 500);
    if (!setup) return response({ error: "Signal setup not found" }, 404);

    const entry = num(setup.entry_price);
    const stop = num(setup.stop_price);
    const tp1 = num(setup.tp1_price), tp2 = num(setup.tp2_price), tp3 = num(setup.tp3_price);
    if (entry === null || stop === null || entry <= 0 || stop <= 0 || entry === stop) {
      return response({ error: "Setup needs valid entry and stop prices before evaluation" }, 422);
    }
    const directionRaw = String(setup.direction || "").toLowerCase();
    const isLong = ["long", "buy"].includes(directionRaw);
    if (!isLong && !["short", "sell"].includes(directionRaw)) {
      return response({ error: "Unsupported setup direction" }, 422);
    }
    const direction = isLong ? "long" : "short";
    const timeframeRaw = String(signal.message?.timeframe || setup.rationale?.timeframe || setup.feature_vector?.timeframe || "M5").toUpperCase();
    const timeframeMap: Record<string, string> = { "1M": "M1", "M1": "M1", "5M": "M5", "M5": "M5", "15M": "M15", "M15": "M15", "30M": "M30", "M30": "M30", "1H": "H1", "H1": "H1", "4H": "H4", "H4": "H4", "1D": "D1", "D1": "D1" };
    const timeframe = timeframeMap[timeframeRaw];
    if (!timeframe) return response({ error: "Unsupported timeframe", timeframe: timeframeRaw }, 422);

    const signalTime = signal.published_at || setup.detected_at;
    if (!signalTime) return response({ error: "Signal has no trustworthy timestamp" }, 422);
    const now = new Date();
    const expiresAt = signal.expires_at ? new Date(signal.expires_at) : null;
    const endTime = expiresAt && expiresAt < now ? expiresAt : now;
    const risk = Math.abs(entry - stop);
    const { count, error: countError } = await db.from("market_data").select("candle_time", { count: "exact", head: true })
      .eq("market_id", setup.market_id).eq("timeframe", timeframe).gt("candle_time", signalTime).lte("candle_time", endTime.toISOString());
    if (countError) return response({ error: countError.message }, 500);

    let tp1Reached = false, tp2Reached = false, tp3Reached = false, stopReached = false;
    let terminalOutcome: string | null = null, exitPrice: number | null = null, closedAt: string | null = null;
    let evaluatedThrough: string | null = null;
    const total = count || 0;
    for (let from = 0; from < total; from += 1000) {
      const { data: candles, error } = await db.from("market_data")
        .select("candle_time,high,low,close")
        .eq("market_id", setup.market_id).eq("timeframe", timeframe)
        .gt("candle_time", signalTime).lte("candle_time", endTime.toISOString())
        .order("candle_time", { ascending: true }).range(from, Math.min(total - 1, from + 999));
      if (error) return response({ error: error.message }, 500);
      for (const candle of candles || []) {
        const high = num(candle.high), low = num(candle.low);
        if (high === null || low === null) continue;
        evaluatedThrough = candle.candle_time;
        const stopHit = isLong ? low <= stop : high >= stop;
        // Conservative collision policy: stop wins when stop and any target are touched in the same candle.
        if (stopHit) {
          stopReached = true; terminalOutcome = "stop_loss"; exitPrice = stop; closedAt = candle.candle_time;
          break;
        }
        if (tp1 !== null && (isLong ? high >= tp1 : low <= tp1)) tp1Reached = true;
        if (tp2 !== null && (isLong ? high >= tp2 : low <= tp2)) tp2Reached = true;
        if (tp3 !== null && (isLong ? high >= tp3 : low <= tp3)) tp3Reached = true;
        if (tp3Reached) {
          terminalOutcome = "tp3"; exitPrice = tp3; closedAt = candle.candle_time;
          break;
        }
      }
      if (terminalOutcome) break;
    }

    let status = "evaluating";
    if (terminalOutcome === "stop_loss" || terminalOutcome === "tp3") status = "closed";
    else if (expiresAt && expiresAt <= now) {
      status = "expired";
      terminalOutcome = tp3Reached ? "tp3" : tp2Reached ? "tp2" : tp1Reached ? "tp1" : "timeout";
      closedAt = expiresAt.toISOString();
    } else if (total === 0) status = "pending";
    // R is deliberately left NULL: TP milestone-only accounting is not equivalent to a defined partial-exit policy.
    const record = {
      signal_id: signal.id, setup_id: setup.id, organization_id: signal.organization_id,
      market_id: setup.market_id, timeframe, direction, signal_candle_time: signalTime,
      entry_price: entry, stop_price: stop, tp1_price: tp1, tp2_price: tp2, tp3_price: tp3,
      risk_distance: risk, status, tp1_reached: tp1Reached, tp2_reached: tp2Reached,
      tp3_reached: tp3Reached, stop_reached: stopReached, terminal_outcome: terminalOutcome,
      exit_price: exitPrice, realized_r: null, evaluated_through: evaluatedThrough, closed_at: closedAt,
      evaluator_version: "signal-evaluator-v1",
      execution_assumptions: { accounting: "milestone_only", same_candle_collision: "stop_first", costs: "not_applied_to_price_milestones" },
      feature_snapshot: { strategy_id: setup.strategy_id, setup_direction: directionRaw, ...(setup.feature_vector || {}) },
      metadata: { candles_available: total, expiry_policy: "use signal expires_at; no expiry means continue evaluating", outcome_policy: "TP milestones tracked separately; realized R withheld until partial-exit policy is configured" },
      updated_at: now.toISOString(),
    };
    const { data: saved, error: saveError } = await db.from("signal_evaluations")
      .upsert(record, { onConflict: "signal_id" }).select("id,signal_id,status,tp1_reached,tp2_reached,tp3_reached,stop_reached,terminal_outcome,evaluated_through,closed_at,realized_r").single();
    if (saveError) return response({ error: saveError.message }, 500);
    return response({ evaluation: saved, note: "Target milestones are recorded separately. Realized R remains null until an explicit partial-exit/accounting policy is configured." });
  } catch (error) {
    console.error("signal-outcome-evaluator", error);
    return response({ error: error instanceof Error ? error.message : "Internal error" }, 500);
  }
});