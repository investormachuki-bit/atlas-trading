"use client";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import {
  MARKET_ID,
  TIMEFRAME
} from "../dashboard/lib/constants";


const FUNCTION_NAME =
  "robustness-testing";


export default function RobustnessPage() {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [running, setRunning] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);


  /* ============================================================
     AUTH
     ============================================================ */

  useEffect(() => {

    let mounted = true;

    async function loadUser() {

      try {

        const {
          data: { user },
          error
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          window.location.href = "/login";
          return;
        }

        if (mounted) {
          setUser(user);
          setLoading(false);
        }

      } catch (err) {

        console.error(
          "ATLAS robustness authentication error:",
          err
        );

        if (mounted) {
          setLoading(false);
          window.location.href = "/login";
        }

      }

    }

    loadUser();

    return () => {
      mounted = false;
    };

  }, []);


  /* ============================================================
     RUN ROBUSTNESS TEST
     ============================================================ */

  async function runRobustness() {

    if (running) {
      return;
    }

    setRunning(true);
    setError("");
    setResult(null);

    try {

      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        window.location.href = "/login";
        return;
      }


      const {
        data,
        error: functionError
      } = await supabase.functions.invoke(
        FUNCTION_NAME,
        {
          body: {
            market_id: MARKET_ID,
            timeframe: TIMEFRAME
          }
        }
      );


      if (functionError) {
        throw functionError;
      }


      if (!data) {
        throw new Error(
          "Robustness engine returned no data."
        );
      }


      if (data.error) {
        throw new Error(
          data.error
        );
      }


      setResult(
        data.result || data
      );

    } catch (err) {

      console.error(
        "ATLAS robustness error:",
        err
      );

      setError(
        err?.message ||
        "Unable to run robustness testing."
      );

    } finally {

      setRunning(false);

    }

  }


  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {

    return (
      <main style={styles.loading}>
        Loading ATLAS Robustness Testing...
      </main>
    );

  }


  /* ============================================================
     PAGE
     ============================================================ */

  return (

    <main style={styles.page}>

      <div style={styles.container}>

        {/* ======================================================
           HEADER
           ====================================================== */}

        <div style={styles.eyebrow}>
          ATLAS RESEARCH LAB
        </div>

        <h1 style={styles.title}>
          Robustness Testing
        </h1>

        <p style={styles.description}>
          ATLAS stress-tests discovered strategies
          across parameter variations, trading costs
          and historical conditions before they can
          advance toward out-of-sample validation.
        </p>


        {/* ======================================================
           ENGINE STATUS
           ====================================================== */}

        <section style={styles.engineCard}>

          <div>

            <div style={styles.engineLabel}>
              ROBUSTNESS ENGINE
            </div>

            <div style={styles.engineTitle}>
              ATLAS Robustness Testing Engine
            </div>

            <div style={styles.engineVersion}>
              Version 1.0.0
            </div>

          </div>

          <div
            style={{
              ...styles.engineStatus,
              color:
                running
                  ? "#ffcf8a"
                  : "#a8e6bb"
            }}
          >
            {running
              ? "RUNNING"
              : "READY"}
          </div>

        </section>


        {/* ======================================================
           TEST CONFIGURATION
           ====================================================== */}

        <section style={styles.card}>

          <div style={styles.sectionTitle}>
            TEST CONFIGURATION
          </div>

          <div style={styles.configGrid}>

            <Config
              label="Market"
              value="XAUUSD"
            />

            <Config
              label="Timeframe"
              value={TIMEFRAME}
            />

            <Config
              label="RR Variations"
              value="1.5R · 2R · 2.5R"
            />

            <Config
              label="Stop Variations"
              value="0.9 · 1.2 · 1.5 ATR"
            />

            <Config
              label="Holding Period"
              value="48 · 72 · 96 bars"
            />

            <Config
              label="Parameter Tests"
              value="27 per candidate"
            />

            <Config
              label="Slippage"
              value="0.02R"
            />

            <Config
              label="Transaction Cost"
              value="0.01R"
            />

          </div>

        </section>


        {/* ======================================================
           RUN BUTTON
           ====================================================== */}

        <button
          type="button"
          onClick={runRobustness}
          disabled={running}
          style={{
            ...styles.runButton,
            opacity:
              running
                ? 0.6
                : 1
          }}
        >

          {running
            ? "RUNNING ROBUSTNESS TEST..."
            : "RUN ROBUSTNESS TEST"}

        </button>


        {/* ======================================================
           ERROR
           ====================================================== */}

        {error && (

          <div style={styles.error}>
            <strong>
              ROBUSTNESS TEST FAILED
            </strong>

            <div style={styles.errorText}>
              {error}
            </div>
          </div>

        )}


        {/* ======================================================
           RESULTS
           ====================================================== */}

        {result && (

          <RobustnessResults
            result={result}
          />

        )}


        {/* ======================================================
           RESEARCH PIPELINE
           ====================================================== */}

        <section style={styles.pipeline}>

          <div style={styles.sectionTitle}>
            VALIDATION PIPELINE
          </div>

          <Pipeline
            number="01"
            title="Historical Backtest"
            status="COMPLETE"
            active
          />

          <Pipeline
            number="02"
            title="Robustness Testing"
            status={
              result
                ? "COMPLETE"
                : "CURRENT"
            }
            active
          />

          <Pipeline
            number="03"
            title="Out-of-Sample Testing"
            status="NEXT"
          />

          <Pipeline
            number="04"
            title="Walk-Forward Validation"
            status="LOCKED"
          />

          <Pipeline
            number="05"
            title="Monte Carlo Analysis"
            status="LOCKED"
          />

          <Pipeline
            number="06"
            title="Paper Trading"
            status="LOCKED"
          />

          <Pipeline
            number="07"
            title="Controlled Live Test"
            status="LOCKED"
          />

        </section>


        <div style={styles.account}>
          SIGNED IN AS {user?.email}
        </div>

      </div>

    </main>

  );

}


/* ============================================================
   RESULTS
   ============================================================ */

function RobustnessResults({
  result
}) {

  const candidates =
    Array.isArray(result?.candidates)
      ? result.candidates
      : [];


  return (

    <section style={styles.results}>

      <div style={styles.sectionTitle}>
        ROBUSTNESS RESULTS
      </div>


      <div style={styles.resultHeader}>

        <div>

          <div style={styles.resultEngine}>
            {result?.engine ||
              "ATLAS Robustness Testing Engine"}
          </div>

          <div style={styles.resultMeta}>
            {result?.version || "1.0.0"}
          </div>

        </div>

        <div style={styles.dataRange}>

          {formatDate(
            result?.data_start
          )}

          {" → "}

          {formatDate(
            result?.data_end
          )}

        </div>

      </div>


      <div style={styles.summaryGrid}>

        <Metric
          label="Candles Tested"
          value={
            formatNumber(
              result?.total_candles
            )
          }
        />

        <Metric
          label="Candidates"
          value={
            candidates.length
          }
        />

        <Metric
          label="Tests / Candidate"
          value="27"
        />

        <Metric
          label="Recommended"
          value={
            result?.recommended_next_step ||
            "—"
          }
        />

      </div>


      <div style={styles.subTitle}>
        CANDIDATE ROBUSTNESS
      </div>


      {candidates.length === 0 ? (

        <div style={styles.empty}>
          No candidate results returned.
        </div>

      ) : (

        <div style={styles.candidateList}>

          {candidates.map(
            (candidate, index) => (

              <Candidate
                key={
                  candidate.name ||
                  index
                }
                candidate={candidate}
              />

            )
          )}

        </div>

      )}


      <div style={styles.method}>

        <div style={styles.methodTitle}>
          TEST METHODOLOGY
        </div>

        <div style={styles.methodText}>
          {result?.method ||
            "27 parameter perturbations across risk/reward, stop distance and holding period."}
        </div>

      </div>

    </section>

  );

}


/* ============================================================
   CANDIDATE
   ============================================================ */

function Candidate({
  candidate
}) {

  const score =
    Number(
      candidate?.robustness_score
    );


  const base =
    candidate?.base || {};


  const scoreColor =
    score >= 75
      ? "#a8e6bb"
      : score >= 55
      ? "#ffcf8a"
      : "#ff9b9b";


  return (

    <div style={styles.candidate}>

      <div style={styles.candidateHeader}>

        <div>

          <div style={styles.candidateName}>
            {candidate?.name}
          </div>

          <div style={styles.candidateSignals}>
            {formatNumber(
              candidate?.signal_count
            )} signals
          </div>

        </div>

        <div
          style={{
            ...styles.robustnessScore,
            color: scoreColor
          }}
        >
          {Number.isFinite(score)
            ? score
            : "—"}

          <span style={styles.scoreSmall}>
            /100
          </span>
        </div>

      </div>


      <div style={styles.progressTrack}>

        <div
          style={{
            ...styles.progressBar,
            width: `${Math.max(
              0,
              Math.min(
                100,
                Number.isFinite(score)
                  ? score
                  : 0
              )
            )}%`,
            background: scoreColor
          }}
        />

      </div>


      <div style={styles.metrics}>

        <Metric
          label="Trades"
          value={
            formatNumber(
              base.trades
            )
          }
        />

        <Metric
          label="Profit Factor"
          value={
            formatMetric(
              base.profit_factor
            )
          }
        />

        <Metric
          label="Expectancy"
          value={
            formatR(
              base.expectancy_R
            )
          }
        />

        <Metric
          label="Total R"
          value={
            formatR(
              base.total_R
            )
          }
        />

        <Metric
          label="Drawdown"
          value={
            formatPercent(
              base.max_drawdown
            )
          }
        />

      </div>

    </div>

  );

}


/* ============================================================
   CONFIG
   ============================================================ */

function Config({
  label,
  value
}) {

  return (

    <div style={styles.config}>

      <div style={styles.configLabel}>
        {label}
      </div>

      <div style={styles.configValue}>
        {value}
      </div>

    </div>

  );

}


/* ============================================================
   METRIC
   ============================================================ */

function Metric({
  label,
  value
}) {

  return (

    <div style={styles.metric}>

      <div style={styles.metricLabel}>
        {label}
      </div>

      <div style={styles.metricValue}>
        {value ?? "—"}
      </div>

    </div>

  );

}


/* ============================================================
   PIPELINE
   ============================================================ */

function Pipeline({
  number,
  title,
  status,
  active = false
}) {

  return (

    <div
      style={{
        ...styles.pipelineRow,
        opacity:
          status === "LOCKED"
            ? 0.4
            : 1
      }}
    >

      <div
        style={{
          ...styles.pipelineNumber,
          borderColor:
            active
              ? "#697589"
              : "#293243"
        }}
      >
        {number}
      </div>

      <div style={styles.pipelineTitle}>
        {title}
      </div>

      <div
        style={{
          ...styles.pipelineStatus,
          color:
            status === "COMPLETE"
              ? "#a8e6bb"
              : status === "CURRENT"
              ? "#d3d9e5"
              : "#687386"
        }}
      >
        {status}
      </div>

    </div>

  );

}


/* ============================================================
   FORMATTERS
   ============================================================ */

function formatNumber(
  value
) {

  const n =
    Number(value);

  return Number.isFinite(n)
    ? n.toLocaleString()
    : "—";

}


function formatMetric(
  value
) {

  const n =
    Number(value);

  return Number.isFinite(n)
    ? n.toFixed(2)
    : "—";

}


function formatR(
  value
) {

  const n =
    Number(value);

  return Number.isFinite(n)
    ? `${n.toFixed(2)} R`
    : "—";

}


function formatPercent(
  value
) {

  const n =
    Number(value);

  return Number.isFinite(n)
    ? `${(n * 100).toFixed(2)}%`
    : "—";

}


function formatDate(
  value
) {

  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toISOString()
    .slice(0, 10);

}


/* ============================================================
   STYLES
   ============================================================ */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#080b12",
    color: "#ffffff",
    padding: "24px",
    fontFamily:
      "Arial, sans-serif"
  },

  loading: {
    minHeight: "100vh",
    background: "#080b12",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      "Arial, sans-serif"
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto"
  },

  eyebrow: {
    color: "#7f899b",
    fontSize: "11px",
    letterSpacing: "1.6px",
    marginBottom: "8px"
  },

  title: {
    fontSize: "32px",
    margin: "0 0 8px"
  },

  description: {
    color: "#8d96a8",
    lineHeight: 1.6,
    maxWidth: "760px",
    marginTop: "0"
  },

  engineCard: {
    marginTop: "24px",
    padding: "20px",
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },

  engineLabel: {
    color: "#687386",
    fontSize: "10px",
    letterSpacing: "1.5px"
  },

  engineTitle: {
    color: "#d3d9e5",
    fontSize: "17px",
    fontWeight: "700",
    marginTop: "7px"
  },

  engineVersion: {
    color: "#596477",
    fontSize: "11px",
    marginTop: "5px"
  },

  engineStatus: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.2px"
  },

  card: {
    marginTop: "16px",
    padding: "20px",
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "14px"
  },

  sectionTitle: {
    color: "#9da8bb",
    fontSize: "11px",
    letterSpacing: "1.2px",
    fontWeight: "700",
    marginBottom: "14px"
  },

  configGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px"
  },

  config: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "10px",
    padding: "14px"
  },

  configLabel: {
    color: "#687386",
    fontSize: "10px"
  },

  configValue: {
    color: "#c5cbd6",
    fontSize: "13px",
    marginTop: "6px",
    fontWeight: "600"
  },

  runButton: {
    width: "100%",
    marginTop: "16px",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #394052",
    background: "#111722",
    color: "#d3d9e5",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    cursor: "pointer"
  },

  error: {
    marginTop: "16px",
    padding: "16px",
    background: "#160c10",
    border: "1px solid #6b3038",
    borderRadius: "12px",
    color: "#ff9b9b",
    fontSize: "12px"
  },

  errorText: {
    marginTop: "7px",
    lineHeight: 1.5
  },

  results: {
    marginTop: "18px",
    padding: "20px",
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "14px"
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start"
  },

  resultEngine: {
    color: "#d3d9e5",
    fontWeight: "700",
    fontSize: "15px"
  },

  resultMeta: {
    color: "#687386",
    fontSize: "10px",
    marginTop: "5px"
  },

  dataRange: {
    color: "#7f899b",
    fontSize: "11px"
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginTop: "16px"
  },

  metric: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "10px",
    padding: "13px"
  },

  metricLabel: {
    color: "#687386",
    fontSize: "9px",
    letterSpacing: "1px"
  },

  metricValue: {
    color: "#d3d9e5",
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "6px"
  },

  subTitle: {
    marginTop: "22px",
    marginBottom: "10px",
    color: "#9da8bb",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: "700"
  },

  candidateList: {
    display: "grid",
    gap: "12px"
  },

  candidate: {
    padding: "18px",
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "12px"
  },

  candidateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },

  candidateName: {
    color: "#d3d9e5",
    fontSize: "15px",
    fontWeight: "700"
  },

  candidateSignals: {
    color: "#687386",
    fontSize: "10px",
    marginTop: "5px"
  },

  robustnessScore: {
    fontSize: "25px",
    fontWeight: "700"
  },

  scoreSmall: {
    color: "#687386",
    fontSize: "11px",
    fontWeight: "400"
  },

  progressTrack: {
    height: "5px",
    background: "#111722",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "15px"
  },

  progressBar: {
    height: "100%",
    borderRadius: "20px"
  },

  metrics: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "8px",
    marginTop: "12px"
  },

  method: {
    marginTop: "16px",
    padding: "16px",
    background: "#0b1019",
    border: "1px solid #1e2738",
    borderRadius: "10px"
  },

  methodTitle: {
    color: "#9da8bb",
    fontSize: "11px",
    fontWeight: "700"
  },

  methodText: {
    color: "#687386",
    fontSize: "11px",
    lineHeight: 1.5,
    marginTop: "6px"
  },

  empty: {
    padding: "20px",
    color: "#687386",
    background: "#080b12",
    borderRadius: "10px"
  },

  pipeline: {
    marginTop: "18px",
    padding: "18px",
    background: "#0b1019",
    border: "1px solid #1e2738",
    borderRadius: "14px"
  },

  pipelineRow: {
    display: "grid",
    gridTemplateColumns:
      "38px 1fr auto",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0"
  },

  pipelineNumber: {
    width: "28px",
    height: "28px",
    border: "1px solid",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9da8bb",
    fontSize: "10px"
  },

  pipelineTitle: {
    color: "#aeb7c7",
    fontSize: "12px"
  },

  pipelineStatus: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px"
  },

  account: {
    marginTop: "24px",
    color: "#596477",
    fontSize: "11px"
  }

};