"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import DashboardHeader from "./components/DashboardHeader";
import MarketHeader from "./components/MarketHeader";
import MarketStats from "./components/MarketStats";
import BacktestLab from "./components/BacktestLab";
import BacktestResults from "./components/BacktestResults";
import ResearchDiagnostics from "./components/ResearchDiagnostics";

import {
  MARKET_ID,
  STRATEGY_ID,
  TIMEFRAME,
  RISK_PER_TRADE,
  RISK_REWARD,
  TOTAL_CANDLES
} from "./lib/constants";

import {
  startBacktest,
  stepBacktest
} from "./lib/api";

import {
  analyzeBacktest
} from "./lib/researchApi";


export default function Dashboard() {

  /* ==========================================================
     AUTH
     ========================================================== */

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  /* ==========================================================
     BACKTEST STATE
     ========================================================== */

  const [running, setRunning] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [progressText, setProgressText] =
    useState("");

  const [error, setError] =
    useState("");

  const [results, setResults] =
    useState(null);

  const [jobId, setJobId] =
    useState(null);


  /* ==========================================================
     RESEARCH STATE
     ========================================================== */

  const [researchRunning, setResearchRunning] =
    useState(false);

  const [researchResults, setResearchResults] =
    useState(null);

  const [researchError, setResearchError] =
    useState("");


  /* ==========================================================
     AUTHENTICATION
     ========================================================== */

  useEffect(() => {

    async function loadUser() {

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();

  }, []);


  /* ==========================================================
     LOGOUT
     ========================================================== */

  async function handleLogout() {

    await supabase.auth.signOut();

    window.location.href = "/login";
  }


  /* ==========================================================
     RUN BACKTEST
     ========================================================== */

  async function runBacktest() {

    if (running || researchRunning) {
      return;
    }

    setRunning(true);

    setError("");

    setResults(null);

    setJobId(null);

    setResearchResults(null);

    setResearchError("");

    setProgress(0);

    setProgressText(
      "Starting backtest..."
    );


    try {

      /* ------------------------------------------------------
         GET SESSION
         ------------------------------------------------------ */

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {

        window.location.href =
          "/login";

        return;
      }

      const token =
        session.access_token;


      /* ------------------------------------------------------
         START JOB
         ------------------------------------------------------ */

      const start =
        await startBacktest(
          token,
          {
            marketId: MARKET_ID,
            strategyId: STRATEGY_ID,
            timeframe: TIMEFRAME,
            riskReward: RISK_REWARD,
            riskPerTrade: RISK_PER_TRADE
          }
        );


      const newJobId =
        start?.job_id;

      if (!newJobId) {

        throw new Error(
          "Backtest engine did not return a job ID."
        );
      }


      setJobId(newJobId);


      const total =
        Number(
          start?.total_candles ||
          TOTAL_CANDLES
        );


      setProgressText(
        `Job created · ${total.toLocaleString()} candles`
      );


      /* ------------------------------------------------------
         PROCESS JOB
         ------------------------------------------------------ */

      while (true) {

        const step =
          await stepBacktest(
            newJobId,
            token,
            {
              riskReward:
                RISK_REWARD,

              riskPerTrade:
                RISK_PER_TRADE
            }
          );


        /* ----------------------------------------------------
           RUNNING
           ---------------------------------------------------- */

        if (
          step?.status === "running"
        ) {

          const tested =
            Number(
              step?.progress
                ?.candles_tested || 0
            );


          let percent;

          if (
            step?.progress?.percent != null
          ) {

            percent =
              Number(
                step.progress.percent
              );

          } else {

            percent =
              total > 0
                ? Math.min(
                    99,
                    (tested / total) * 100
                  )
                : 0;
          }


          setProgress(
            Math.min(
              99,
              Math.max(
                0,
                percent
              )
            )
          );


          setProgressText(
            `${tested.toLocaleString()} / ${total.toLocaleString()} candles`
          );


          await new Promise(
            resolve =>
              setTimeout(
                resolve,
                80
              )
          );

          continue;
        }


        /* ----------------------------------------------------
           COMPLETE
           ---------------------------------------------------- */

        if (
          step?.status === "complete"
        ) {

          setProgress(100);

          setProgressText(
            `Complete · ${total.toLocaleString()} candles tested`
          );


          setResults(
            step?.results || null
          );


          return;
        }


        /* ----------------------------------------------------
           FAILED
           ---------------------------------------------------- */

        if (
          step?.status === "failed"
        ) {

          throw new Error(
            step?.error ||
            "The backtest engine reported a failed job."
          );
        }


        throw new Error(
          `Unexpected backtest status: ${
            step?.status || "unknown"
          }`
        );
      }

    } catch (err) {

      console.error(
        "ATLAS backtest error:",
        err
      );

      setError(
        err?.message ||
        "Unable to complete backtest."
      );

    } finally {

      setRunning(false);
    }
  }


  /* ==========================================================
     RUN RESEARCH
     ========================================================== */

  async function runResearch() {

    if (
      researchRunning ||
      running ||
      !jobId
    ) {
      return;
    }


    setResearchRunning(true);

    setResearchError("");

    setResearchResults(null);


    try {

      /* ------------------------------------------------------
         GET SESSION
         ------------------------------------------------------ */

      const {
        data: { session }
      } = await supabase.auth.getSession();


      if (!session?.access_token) {

        window.location.href =
          "/login";

        return;
      }


      const token =
        session.access_token;


      /* ------------------------------------------------------
         RUN RESEARCH ENGINE
         ------------------------------------------------------ */

      const research =
        await analyzeBacktest(
          token,
          {
            jobId,

            marketId:
              MARKET_ID,

            strategyId:
              STRATEGY_ID
          }
        );


      setResearchResults(
        research
      );

    } catch (err) {

      console.error(
        "ATLAS research error:",
        err
      );

      setResearchError(
        err?.message ||
        "Unable to complete research analysis."
      );

    } finally {

      setResearchRunning(false);
    }
  }


  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {

    return (
      <main style={styles.loading}>
        Loading ATLAS...
      </main>
    );
  }


  /* ==========================================================
     DASHBOARD
     ========================================================== */

  return (

    <main style={styles.page}>

      <div style={styles.container}>


        {/* ----------------------------------------------------
           HEADER
        ---------------------------------------------------- */}

        <DashboardHeader
          onLogout={handleLogout}
        />


        {/* ----------------------------------------------------
           MARKET
        ---------------------------------------------------- */}

        <MarketHeader
          market="XAUUSD"
          timeframe={TIMEFRAME}
          datasetLabel="Historical Dataset"
        />


        {/* ----------------------------------------------------
           MARKET STATS
        ---------------------------------------------------- */}

        <MarketStats
          candles={TOTAL_CANDLES}
          market="XAUUSD"
          timeframe={TIMEFRAME}
          engine={
            running
              ? "RUNNING"
              : researchRunning
              ? "RESEARCH"
              : "READY"
          }
        />


        {/* ----------------------------------------------------
           BACKTEST LAB
        ---------------------------------------------------- */}

        <BacktestLab
          running={
            running ||
            researchRunning
          }

          progress={progress}

          progressText={
            progressText
          }

          onRun={
            runBacktest
          }

          error={
            error
          }
        />


        {/* ----------------------------------------------------
           BACKTEST RESULTS
        ---------------------------------------------------- */}

        <BacktestResults
          results={results}
        />


        {/* ----------------------------------------------------
           RESEARCH ACTION
        ---------------------------------------------------- */}

        {results && jobId && (

          <section
            style={styles.researchPanel}
          >

            <div
              style={styles.researchEyebrow}
            >
              RESEARCH ENGINE
            </div>


            <h2
              style={styles.researchTitle}
            >
              Validate Strategy Robustness
            </h2>


            <p
              style={styles.researchDescription}
            >
              ATLAS will split the completed
              backtest chronologically, test
              multiple strategy variations,
              compare train and test
              performance, and determine
              whether the observed edge
              survives out-of-sample testing.
            </p>


            <div
              style={styles.researchMeta}
            >

              <span>
                BACKTEST JOB
              </span>

              <strong>
                {jobId}
              </strong>

            </div>


            <button
              onClick={runResearch}
              disabled={
                researchRunning
              }
              style={{
                ...styles.researchButton,
                opacity:
                  researchRunning
                    ? 0.55
                    : 1
              }}
            >

              {researchRunning
                ? "RESEARCH RUNNING..."
                : "RUN RESEARCH"}

            </button>


            {researchError && (

              <div
                style={styles.researchError}
              >
                {researchError}
              </div>

            )}

          </section>

        )}


        {/* ----------------------------------------------------
           RESEARCH RESULTS
        ---------------------------------------------------- */}

        {researchResults && (

          <ResearchResults
            data={
              researchResults
            }
          />

        )}


        {/* ----------------------------------------------------
           DIAGNOSTICS
        ---------------------------------------------------- */}

        <ResearchDiagnostics
          results={results}
        />


        {/* ----------------------------------------------------
           ACCOUNT
        ---------------------------------------------------- */}

        <div
          style={styles.account}
        >
          SIGNED IN AS {user?.email}
        </div>


      </div>

    </main>
  );
}


/* ============================================================
   RESEARCH RESULTS
   ============================================================ */

function ResearchResults({
  data
}) {

  const verdict =
    data?.verdict ||
    data?.research_verdict ||
    "RESEARCH COMPLETE";


  const message =
    data?.message ||
    data?.verdict_message ||
    data?.summary ||
    "Research analysis completed.";


  return (

    <section
      style={styles.researchResults}
    >

      <div
        style={styles.researchEyebrow}
      >
        RESEARCH VERDICT
      </div>


      <h2
        style={styles.researchTitle}
      >
        {verdict}
      </h2>


      <p
        style={styles.researchDescription}
      >
        {message}
      </p>


      <ResearchData
        data={data}
      />

    </section>
  );
}


/* ============================================================
   RESEARCH DATA
   ============================================================ */

function ResearchData({
  data
}) {

  const experiments =
    data?.experiments ||
    data?.results ||
    data?.candidates ||
    [];


  if (
    !Array.isArray(experiments) ||
    experiments.length === 0
  ) {

    return null;
  }


  return (

    <div
      style={styles.experimentGrid}
    >

      {experiments.map(
        (experiment, index) => (

          <div
            key={
              experiment?.id ||
              experiment?.name ||
              index
            }
            style={
              styles.experimentCard
            }
          >

            <div
              style={
                styles.experimentName
              }
            >
              {experiment?.name ||
                experiment?.strategy ||
                `Experiment ${index + 1}`}
            </div>


            <div
              style={
                styles.experimentStats
              }
            >

              {experiment?.train_pf != null && (
                <span>
                  Train PF:{" "}
                  {Number(
                    experiment.train_pf
                  ).toFixed(2)}
                </span>
              )}

              {experiment?.test_pf != null && (
                <span>
                  Test PF:{" "}
                  {Number(
                    experiment.test_pf
                  ).toFixed(2)}
                </span>
              )}

              {experiment?.test_expectancy_R != null && (
                <span>
                  Test Exp:{" "}
                  {Number(
                    experiment.test_expectancy_R
                  ).toFixed(3)} R
                </span>
              )}

            </div>

          </div>

        )
      )}

    </div>
  );
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


  researchPanel: {
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "18px",
    padding: "26px",
    marginTop: "28px"
  },


  researchResults: {
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "18px",
    padding: "26px",
    marginTop: "28px"
  },


  researchEyebrow: {
    color: "#7f899b",
    fontSize: "12px",
    letterSpacing: "1.5px",
    marginBottom: "8px"
  },


  researchTitle: {
    fontSize: "28px",
    margin: "8px 0"
  },


  researchDescription: {
    color: "#8d96a8",
    lineHeight: 1.6,
    maxWidth: "760px"
  },


  researchMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "20px",
    marginBottom: "18px",
    color: "#596477",
    fontSize: "11px",
    letterSpacing: "1px"
  },


  researchMetaStrong: {
    color: "#8d96a8"
  },


  researchButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#080b12",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },


  researchError: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "10px",
    background: "#251318",
    color: "#ff9b9b",
    lineHeight: 1.5
  },


  experimentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginTop: "22px"
  },


  experimentCard: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "12px",
    padding: "16px"
  },


  experimentName: {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "10px"
  },


  experimentStats: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    color: "#7f899b",
    fontSize: "12px"
  },


  account: {
    marginTop: "28px",
    color: "#596477",
    fontSize: "12px"
  }

};