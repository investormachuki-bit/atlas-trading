import { BACKTEST_API } from "./constants";

/* ============================================================
   GENERIC API CALL
   ============================================================ */

export async function apiCall(body, token) {
  const response = await fetch(BACKTEST_API, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify(body)
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Backtest API returned HTTP ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Backtest failed with HTTP ${response.status}`
    );
  }

  return data;
}


/* ============================================================
   START BACKTEST
   ============================================================ */

export async function startBacktest(
  token,
  {
    marketId,
    strategyId,
    timeframe = "M5",
    riskReward = 2,
    riskPerTrade = 0.01
  }
) {
  return apiCall(
    {
      action: "start",

      market_id: marketId,

      strategy_id: strategyId,

      timeframe,

      risk_reward: riskReward,

      risk_per_trade: riskPerTrade
    },
    token
  );
}


/* ============================================================
   PROCESS NEXT BACKTEST CHUNK
   ============================================================ */

export async function stepBacktest(
  jobId,
  token,
  {
    riskReward = 2,
    riskPerTrade = 0.01
  } = {}
) {
  return apiCall(
    {
      action: "step",

      job_id: jobId,

      risk_reward: riskReward,

      risk_per_trade: riskPerTrade
    },
    token
  );
}