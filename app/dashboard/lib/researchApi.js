import { RESEARCH_API } from "./constants";


/* ============================================================
   API CONFIGURATION
   ============================================================ */

const REQUEST_TIMEOUT = 30000;


/* ============================================================
   GENERIC RESEARCH API CALL
   ============================================================ */

async function researchApiCall(body, token) {
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
    const response = await fetch(RESEARCH_API, {
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
          `Research engine returned invalid JSON (HTTP ${response.status}).`
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
          `Research engine returned HTTP ${response.status}.`
      );
    }

    if (!data) {
      throw new Error(
        "Research engine returned an empty response."
      );
    }

    return data;

  } catch (error) {

    if (error?.name === "AbortError") {
      throw new Error(
        "Research analysis timed out. Please try again."
      );
    }

    if (
      error instanceof TypeError &&
      error.message === "Failed to fetch"
    ) {
      throw new Error(
        "Unable to connect to the research engine."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}


/* ============================================================
   ANALYZE COMPLETED BACKTEST
   ============================================================ */

export async function analyzeBacktest(
  token,
  {
    jobId,
    marketId,
    strategyId
  } = {}
) {

  if (!jobId) {
    throw new Error(
      "Backtest job ID is required for research analysis."
    );
  }

  if (!marketId) {
    throw new Error(
      "Market ID is required for research analysis."
    );
  }

  if (!strategyId) {
    throw new Error(
      "Strategy ID is required for research analysis."
    );
  }

  return researchApiCall(
    {
      action: "analyze_backtest",

      job_id: jobId,

      market_id: marketId,

      strategy_id: strategyId
    },

    token
  );
}