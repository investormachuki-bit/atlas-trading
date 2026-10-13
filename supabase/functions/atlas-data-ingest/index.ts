import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const headers = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
  "vary": "Origin",
};
const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const timeframes = new Set(["M1","M5","M15","M30","H1","H4","D1"]);
const numeric = (v: unknown) => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v));
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return out({ error: "POST required" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization) return out({ error: "Authorization required" }, 401);
  const userClient = createClient(URL, ANON, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return out({ error: "Unauthorized" }, 401);
  let body: any;
  try { body = await req.json(); } catch { return out({ error: "Invalid JSON" }, 400); }
  if (!body.market_id || !/^[0-9a-f-]{36}$/i.test(body.market_id)) return out({ error: "Valid market_id UUID required" }, 400);
  if (!timeframes.has(body.timeframe)) return out({ error: "Unsupported timeframe" }, 400);
  if (!Array.isArray(body.candles) || body.candles.length < 1) return out({ error: "candles array required" }, 400);
  if (body.candles.length > 1000) return out({ error: "Maximum 1,000 candles per request; paginate upstream batches" }, 400);
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 80) : "authenticated_ingest";
  const rows: any[] = [];
  const seen = new Set<string>();
  for (let i=0; i<body.candles.length; i++) {
    const c = body.candles[i];
    if (!c || !c.timestamp || !Number.isFinite(Date.parse(c.timestamp))) return out({ error: "Each candle needs a valid ISO timestamp", candle_index: i }, 400);
    if (![c.open,c.high,c.low,c.close].every(numeric)) return out({ error: "OHLC values must be numeric", candle_index: i }, 400);
    const open=Number(c.open), high=Number(c.high), low=Number(c.low), close=Number(c.close);
    const volume = c.volume == null ? null : Number(c.volume);
    if (![open,high,low,close].every(Number.isFinite) || Math.min(open,high,low,close) <= 0 || high < Math.max(open,close,low) || low > Math.min(open,close,high) || (volume !== null && (!Number.isFinite(volume) || volume < 0))) {
      return out({ error: "Invalid OHLCV candle geometry", candle_index: i }, 400);
    }
    const timestamp = new Date(c.timestamp).toISOString();
    if (seen.has(timestamp)) return out({ error: "Duplicate candle timestamp within request", candle_index: i }, 400);
    seen.add(timestamp);
    rows.push({ market_id: body.market_id, timeframe: body.timeframe, candle_time: timestamp, open, high, low, close, volume, source });
  }
  const db = createClient(URL, SERVICE);
  const { data: market, error: marketError } = await db.from("markets").select("id,status").eq("id", body.market_id).maybeSingle();
  if (marketError) return out({ error: marketError.message }, 500);
  if (!market) return out({ error: "Market not found" }, 404);
  const { error: upsertError } = await db.from("market_data").upsert(rows, { onConflict: "market_id,timeframe,candle_time" });
  if (upsertError) return out({ error: upsertError.message }, 500);
  const { data: latest, error: latestError } = await db.from("market_data").select("candle_time").eq("market_id",body.market_id).eq("timeframe",body.timeframe).order("candle_time",{ascending:false}).limit(1).maybeSingle();
  if (latestError) return out({ error: latestError.message }, 500);
  return out({ ok:true, ingested:rows.length, market_id:body.market_id, timeframe:body.timeframe, source, latest_candle:latest?.candle_time ?? null, note:"This endpoint validates and stores authenticated submissions; it does not itself connect to a broker or prove that a feed is live." });
});