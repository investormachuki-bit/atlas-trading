import {
  BACKTEST_API,
  RESEARCH_API
} from "./constants";


/* ============================================================
   API CONFIGURATION
   ============================================================ */

const REQUEST_TIMEOUT = 30000;
const RESEARCH_TIMEOUT = 60000;


/* ============================================================
   GENERIC API CALL
   ============================================================ */

export async function apiCall(
  body,
  token,
  {
    endpoint = BACKTEST_API,
    timeoutMs = REQUEST_TIMEOUT
  } = {}
) {
  if (!token) {
    throw new Error(
      "Authentication session is missing. Please sign in again."
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(endpoint, {
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
          `API returned invalid JSON (HTTP ${response.status}).`
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
          `API returned HTTP ${response.status}.`
      );
    }

    if (!data) {
      throw new Error(
        "API returned an empty response."
      );
    }

    return data;

  } catch (error) {

    if (error?.name === "AbortError") {
      throw new Error(
        "API request timed out. The server may still be processing the job."
      );
    }

    if (
      error instanceof TypeError &&
      error.message === "Failed to fetch"
    ) {
      throw new Error(
        "Unable to connect to the ATLAS engine. Check your connection and try again."
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

  const result = await apiCall(
    {
      action: "step",

      job_id: jobId,

      risk_reward: riskReward,

      risk_per_trade: riskPerTrade
    },

    token
  );


  /* ==========================================================
     AUTOMATIC RESEARCH HANDOFF
     ==========================================================

     The backtest engine remains responsible for producing
     the historical trade results.

     Once the backtest is COMPLETE, the completed job is
     handed to the separate ATLAS Research Engine.

     IMPORTANT:

     Research failure does NOT invalidate a completed
     historical backtest.

     The historical result is preserved and returned with
     a research status/error so the dashboard can distinguish
     between:

       BACKTEST COMPLETE
       RESEARCH COMPLETE
       RESEARCH FAILED
  */

  if (
    result?.status === "complete" &&
    result?.results
  ) {

    try {

      const research =
        await analyzeBacktest(
          jobId,
          token
        );


      /*
       * Preserve the complete historical
       * backtest result exactly as produced
       * by backtest-api.
       *
       * Research is added as a separate layer.
       */

      return {
        ...result,

        results: {
          ...result.results,

          research:
            research?.research || null,

          research_experiment_id:
            research?.research_experiment_id ||
            null,

          research_status:
            research?.research
              ? "COMPLETE"
              : "UNAVAILABLE"
        }
      };

    } catch (researchError) {

      console.error(
        "ATLAS research engine error:",
        researchError
      );


      /*
       * DO NOT throw here.
       *
       * The historical backtest itself has
       * already completed successfully.
       */

      return {
        ...result,

        results: {
          ...result.results,

          research: null,

          research_experiment_id:
            null,

          research_status:
            "FAILED",

          research_error:
            researchError?.message ||
            "Research engine analysis failed."
        }
      };
    }
  }


  return result;
}


/* ============================================================
   ANALYZE COMPLETED BACKTEST
   ============================================================

   Sends the completed backtest job to the existing
   ATLAS Research Engine.

   Research Engine v0.6 performs:

     • 70/30 chronological split
     • baseline analysis
     • London experiment
     • Long experiment
     • Short experiment
     • London + Long
     • No High Volatility
     • London + No High Volatility
     • Long + No High Volatility
     • expanding-window walk-forward
     • research verdict

   The source trade log remains in:

     backtest_jobs.results.diagnostics.trade_log
  */

export async function analyzeBacktest(
  jobId,
  token,
  {
    marketId = null,
    strategyId = null,
    name = "ATLAS Baseline Research",
    dataStart = null,
    dataEnd = null
  } = {}
) {
  if (!jobId) {
    throw new Error(
      "Backtest job ID is required for research analysis."
    );
  }


  const body = {
    action: "analyze_backtest",

    job_id: jobId,

    name,

    data_start: dataStart,

    data_end: dataEnd
  };


  /*
   * Only send these when supplied.
   *
   * This keeps the function compatible with
   * completed jobs even when the dashboard does
   * not explicitly pass the IDs.
   */

  if (marketId) {
    body.market_id = marketId;
  }

  if (strategyId) {
    body.strategy_id = strategyId;
  }


  return apiCall(
    body,
    token,
    {
      endpoint: RESEARCH_API,
      timeoutMs: RESEARCH_TIMEOUT
    }
  );
}


/* ============================================================
   WALK-FORWARD RESEARCH
   ============================================================

   This is intentionally exposed separately.

   The automatic completion flow already runs the complete
   research analysis, which itself includes the 5-fold
   expanding-window walk-forward test.

   This function allows the dashboard or a future dedicated
   research screen to explicitly request walk-forward analysis
   without rerunning all research experiments.
  */

export async function runWalkForward(
  jobId,
  token,
  {
    folds = 5
  } = {}
) {
  if (!jobId) {
    throw new Error(
      "Backtest job ID is required for walk-forward analysis."
    );
  }


  const safeFolds =
    Math.min(
      8,
      Math.max(
        3,
        Number(folds) || 5
      )
    );


  return apiCall(
    {
      action: "walk_forward",

      job_id: jobId,

      folds: safeFolds
    },

    token,

    {
      endpoint: RESEARCH_API,
      timeoutMs: RESEARCH_TIMEOUT
    }
  );
}


/* ============================================================
   RESEARCH STATUS HELPER
   ============================================================ */

export function getResearchStatus(
  results
) {
  if (!results) {
    return "NOT_STARTED";
  }

  if (
    results.research_status ===
    "COMPLETE"
  ) {
    return "COMPLETE";
  }

  if (
    results.research_status ===
    "FAILED"
  ) {
    return "FAILED";
  }

  if (
    results.research
  ) {
    return "COMPLETE";
  }

  return "UNAVAILABLE";
}


/* ============================================================
   RESEARCH VERDICT HELPER
   ============================================================

   Converts the research-engine verdict into a simple
   dashboard-safe state.

   This does NOT replace the ResearchDiagnostics logic.

   It simply gives future components a consistent way
   to determine the current research state.
  */

export function getResearchState(
  results
) {
  const verdict =
    results?.research?.verdict;


  if (
    verdict ===
    "POSITIVE_EDGE_VALIDATED_BY_WALK_FORWARD"
  ) {
    return "VALIDATED";
  }


  if (
    verdict ===
    "POSITIVE_EDGE_REQUIRES_VALIDATION"
  ) {
    return "REQUIRES_VALIDATION";
  }


  if (
    verdict ===
    "NO_POSITIVE_EDGE"
  ) {
    return "NO_EDGE";
  }


  if (
    verdict ===
    "INSUFFICIENT_SAMPLE"
  ) {
    return "INSUFFICIENT_SAMPLE";
  }


  return "NOT_AVAILABLE";
}