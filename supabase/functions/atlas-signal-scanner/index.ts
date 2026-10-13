import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const URL=Deno.env.get("SUPABASE_URL")!, ANON=Deno.env.get("SUPABASE_ANON_KEY")!, SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H={"content-type":"application/json","access-control-allow-origin":"*","access-control-allow-headers":"authorization, x-client-info, apikey, content-type","access-control-allow-methods":"POST, OPTIONS","vary":"Origin"};
const out=(x:unknown,s=200)=>new Response(JSON.stringify(x),{status:s,headers:H});
type Candle={candle_time:string;open:number;high:number;low:number;close:number;volume:number|null};
const ema=(v:number[],p:number)=>{const a=new Array(v.length).fill(NaN);if(v.length<p)return a;let sum=0;for(let i=0;i<p;i++)sum+=v[i];a[p-1]=sum/p;const k=2/(p+1);for(let i=p;i<v.length;i++)a[i]=v[i]*k+a[i-1]*(1-k);return a};
const atr=(c:Candle[],p=14)=>{const tr=c.map((x,i)=>{const pc=i?c[i-1].close:x.open;return Math.max(x.high-x.low,Math.abs(x.high-pc),Math.abs(x.low-pc))});return tr.map((_,i)=>i<p-1?NaN:tr.slice(i-p+1,i+1).reduce((a,b)=>a+b,0)/p)};
const num=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)?n:null};
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:H});
 if(req.method!=="POST")return out({error:"POST required"},405);
 const authorization=req.headers.get("Authorization");if(!authorization)return out({error:"Authorization required"},401);
 try{
  const userClient=createClient(URL,ANON,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error:authErr}=await userClient.auth.getUser();if(authErr||!user)return out({error:"Unauthorized"},401);
  let b:any={};try{b=await req.json()}catch{return out({error:"Invalid JSON"},400)}
  const marketId=String(b.market_id||"ee6cf0c3-1a03-48a9-9d76-7aa36ad62657");
  const timeframe=String(b.timeframe||"M5").toUpperCase();
  const tfMins:Record<string,number>={M1:1,M5:5,M15:15,M30:30,H1:60,H4:240,D1:1440};
  if(!tfMins[timeframe])return out({error:"Unsupported timeframe"},400);
  const db=createClient(URL,SERVICE);
  const {data:strategy,error:strategyErr}=await db.from("strategies").select("id,code,name,version,config").eq("code","trend_continuation").eq("is_active",true).is("organization_id",null).maybeSingle();
  if(strategyErr)return out({error:strategyErr.message},500);if(!strategy)return out({error:"No active platform Trend Continuation strategy found"},409);
  const {data:market,error:marketErr}=await db.from("markets").select("id,symbol,status,market_type").eq("id",marketId).maybeSingle();
  if(marketErr)return out({error:marketErr.message},500);if(!market)return out({error:"Market not found"},404);if(market.status!=="active")return out({error:"Market is not active"},409);
  const {data:rows,error:dataErr}=await db.from("market_data").select("candle_time,open,high,low,close,volume").eq("market_id",marketId).eq("timeframe",timeframe).order("candle_time",{ascending:false}).limit(250);
  if(dataErr)return out({error:dataErr.message},500);
  const candles:Candle[]=(rows||[]).reverse().map((r:any)=>({candle_time:r.candle_time,open:Number(r.open),high:Number(r.high),low:Number(r.low),close:Number(r.close),volume:num(r.volume)}));
  if(candles.length<60)return out({status:"blocked",reason:"insufficient_history",required:60,loaded:candles.length},409);
  const latest=candles[candles.length-1], ageMs=Date.now()-Date.parse(latest.candle_time), maxAge=tfMins[timeframe]*2*60_000;
  if(ageMs< -60_000)return out({status:"blocked",reason:"latest_candle_is_in_the_future",latest_candle:latest.candle_time},409);
  if(ageMs>maxAge)return out({status:"blocked",reason:"stale_market_data",market:market.symbol,timeframe,latest_candle:latest.candle_time,age_minutes:Math.round(ageMs/60000),max_age_minutes:tfMins[timeframe]*2,note:"No signal was created. Ingest fresh, provider-verified candles first."},409);
  const closes=candles.map(c=>c.close),e20=ema(closes,20),e50=ema(closes,50),a=atr(candles,14),i=candles.length-1,x=candles[i],prev=candles[i-1],atrNow=a[i],range=x.high-x.low,body=Math.abs(x.close-x.open);
  if(!Number.isFinite(atrNow)||atrNow<=0||range<=0)return out({status:"no_signal",reason:"indicator_warmup_or_invalid_range",latest_candle:x.candle_time});
  let pullLong=false,pullShort=false;for(let q=i-6;q<i;q++){if(candles[q].low<=e20[q]*1.0003)pullLong=true;if(candles[q].high>=e20[q]*.9997)pullShort=true}
  const isLong=e20[i]>e50[i]&&pullLong&&body/range>=0.55&&x.close>prev.high+0.05*atrNow&&x.close>e20[i];
  const isShort=e20[i]<e50[i]&&pullShort&&body/range>=0.55&&x.close<prev.low-0.05*atrNow&&x.close<e20[i];
  if(!isLong&&!isShort)return out({status:"no_signal",market:market.symbol,timeframe,latest_candle:x.candle_time,checks:{trend_fast_ema:e20[i],trend_slow_ema:e50[i],atr:atrNow,body_ratio:body/range,pullback_long:pullLong,pullback_short:pullShort,breakout_long:x.close>prev.high+0.05*atrNow,breakout_short:x.close<prev.low-0.05*atrNow}});
  const direction=isLong?"buy":"sell", swing=candles.slice(Math.max(0,i-6),i+1);
  const stop=isLong?Math.min(...swing.map(c=>c.low))-1.2*atrNow:Math.max(...swing.map(c=>c.high))+1.2*atrNow;
  const risk=Math.abs(x.close-stop);if(!Number.isFinite(risk)||risk<=0)return out({status:"no_signal",reason:"invalid_risk_distance"});
  const entry=x.close,tp1=isLong?entry+risk:entry-risk,tp2=isLong?entry+1.5*risk:entry-1.5*risk,tp3=isLong?entry+2*risk:entry-2*risk;
  const {data:existing,error:existingErr}=await db.from("setups").select("id").eq("market_id",marketId).eq("strategy_id",strategy.id).eq("detected_at",x.candle_time).maybeSingle();
  if(existingErr)return out({error:existingErr.message},500);
  if(existing)return out({status:"duplicate_prevented",setup_id:existing.id,signal_candle:x.candle_time});
  const snapshot={strategy_code:strategy.code,strategy_version:strategy.version,timeframe,ema20:e20[i],ema50:e50[i],atr14:atrNow,body_ratio:body/range,pullback_lookback:6,confirmation_body_ratio:0.55,breakout_buffer_atr:0.05,stop_atr:1.2,target_r_multiples:[1,1.5,2],signal_candle:x.candle_time,signal_close:x.close,market_data_age_ms:ageMs};
  const {data:setup,error:setupErr}=await db.from("setups").insert({market_id:marketId,strategy_id:strategy.id,detected_at:x.candle_time,direction,entry_price:entry,stop_price:stop,tp1_price:tp1,tp2_price:tp2,tp3_price:tp3,risk_reward:2,score:Math.max(0,Math.min(100,Math.round(50+25*(body/range-0.55)+25*Math.min(1,Math.abs(e20[i]-e50[i])/atrNow)))),status:"qualified",rationale:{summary:"Trend Continuation: EMA trend, recent pullback, and displacement confirmation.",checks:snapshot},feature_vector:snapshot}).select("id").single();
  if(setupErr){if(setupErr.code==="23505")return out({status:"duplicate_prevented",signal_candle:x.candle_time});return out({error:setupErr.message},500)}
  const published=new Date().toISOString(),expires=new Date(Date.now()+4*60*60*1000).toISOString();
  const {data:signal,error:signalErr}=await db.from("signals").insert({setup_id:setup.id,organization_id:null,published_at:published,expires_at:expires,status:"published",message:{market_symbol:market.symbol,timeframe,direction,entry_price:entry,stop_price:stop,tp1_price:tp1,tp2_price:tp2,tp3_price:tp3,risk_reward:2,source:"atlas-trend-continuation-scanner",strategy_version:strategy.version,signal_candle_time:x.candle_time,feature_snapshot:snapshot}}).select("id").single();
  if(signalErr){await db.from("setups").delete().eq("id",setup.id);return out({error:signalErr.message},500)}
  return out({status:"signal_published",signal_id:signal.id,setup_id:setup.id,market:market.symbol,timeframe,direction,entry,stop,tp1,tp2,tp3,signal_candle:x.candle_time,expires_at:expires,execution_note:"Signal is a research alert from candle data, not a broker fill. Verify instrument contract specs and live spread before trading."},201);
 }catch(e){console.error("atlas-signal-scanner",e);return out({error:e instanceof Error?e.message:"Internal error"},500)}
});