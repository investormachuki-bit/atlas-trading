import { BACKTEST_API } from "./constants";


/* ============================================================
   API CONFIGURATION
   ============================================================ */

const REQUEST_TIMEOUT = 30000;


/* ============================================================
   GENERIC API CALL
   ============================================================ */

export async function apiCall(body, token) {
  if (!token) {
    throw new Error(
      "Authentication session is missing. Please sign in again."
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(BACKTEST_API, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify(body),

      signal: controller.signal
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Backtest API returned invalid JSON (HTTP ${response.status}).`
        );
      }
    } else {
      const text = await response.text();

      if (text) {
        data = {
          error: text
        };
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `Backtest API returned HTTP ${response.status}.`
      );
    }

    if (!data) {
      throw new Error(
        "Backtest API returned an empty response."
      );
    }

    return data;

  } catch (error) {

    if (error?.name === "AbortError") {
      throw new Error(
        "Backtest request timed out. The server may still be processing the job."
      );
    }

    if (
      error instanceof TypeError &&
      error.message === "Failed to fetch"
    ) {
      throw new Error(
        "Unable to connect to the backtest engine. Check your connection and try again."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
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
  } = {}
) {
  if (!marketId) {
    throw new Error(
      "Market ID is required to start a backtest."
    );
  }

  if (!strategyId) {
    throw new Error(
      "Strategy ID is required to start a backtest."
    );
  }

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
  if (!jobId) {
    throw new Error(
      "Backtest job ID is missing."
    );
  }

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