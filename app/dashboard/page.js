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
} from "./lib/backtestApi";


export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

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


  /* ============================================================
     AUTHENTICATION
     ============================================================ */

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


  /* ============================================================
     LOGOUT
     ============================================================ */

  async function handleLogout() {
    await supabase.auth.signOut();

    window.location.href = "/login";
  }


  /* ============================================================
     RUN BACKTEST
     ============================================================ */

  async function runBacktest() {
    if (running) {
      return;
    }

    setRunning(true);
    setError("");
    setResults(null);
    setProgress(0);
    setProgressText("Starting backtest...");

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/login";
        return;
      }

      const token =
        session.access_token;


      /* --------------------------------------------------------
         START BACKTEST JOB
         -------------------------------------------------------- */

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


      const jobId =
        start?.job_id;

      if (!jobId) {
        throw new Error(
          "Backtest API did not return a job ID."
        );
      }


      const total =
        Number(
          start?.total_candles ||
          TOTAL_CANDLES
        );


      setProgressText(
        `Job created · ${total.toLocaleString()} candles`
      );


      /* --------------------------------------------------------
         PROCESS BACKTEST
         -------------------------------------------------------- */

      let finished = false;

      while (!finished) {

        const step =
          await stepBacktest(
            jobId,
            token,
            {
              riskReward:
                RISK_REWARD,

              riskPerTrade:
                RISK_PER_TRADE
            }
          );


        /* ------------------------------------------------------
           RUNNING
           ------------------------------------------------------ */

        if (
          step?.status === "running"
        ) {

          const tested =
            Number(
              step?.progress
                ?.candles_tested || 0
            );


          const percent =
            step?.progress?.percent != null
              ? Number(
                  step.progress.percent
                )
              : total > 0
              ? Math.min(
                  99,
                  (tested / total) * 100
                )
              : 0;


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


          /*
           * Prevent continuous API hammering.
           */

          await new Promise(
            (resolve) =>
              setTimeout(resolve, 80)
          );

          continue;
        }


        /* ------------------------------------------------------
           COMPLETE
           ------------------------------------------------------ */

        if (
          step?.status === "complete"
        ) {

          finished = true;

          setProgress(100);

          setProgressText(
            `Complete · ${total.toLocaleString()} candles tested`
          );

          setResults(
            step?.results || null
          );

          continue;
        }


        /* ------------------------------------------------------
           UNKNOWN STATUS
           ------------------------------------------------------ */

        throw new Error(
          step?.error ||
          "Unexpected backtest status."
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


  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <main style={styles.loading}>
        Loading ATLAS...
      </main>
    );
  }


  /* ============================================================
     DASHBOARD
     ============================================================ */

  return (
    <main style={styles.page}>

      <div style={styles.container}>

        <DashboardHeader
          onLogout={handleLogout}
        />


        <MarketHeader
          market="XAUUSD"
          timeframe={TIMEFRAME}
          datasetLabel="Historical Dataset"
        />


        <MarketStats
          candles={TOTAL_CANDLES}
          market="XAUUSD"
          timeframe={TIMEFRAME}
          engine={
            running
              ? "RUNNING"
              : "READY"
          }
        />


        <BacktestLab
          running={running}
          progress={progress}
          progressText={progressText}
          onRun={runBacktest}
          error={error}
        />


        <BacktestResults
          results={results}
        />


        <ResearchDiagnostics
          results={results}
        />


        <div style={styles.account}>
          SIGNED IN AS {user?.email}
        </div>

      </div>

    </main>
  );
}


/* ============================================================
   PAGE STYLES
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


  account: {
    marginTop: "28px",
    color: "#596477",
    fontSize: "12px"
  }

};