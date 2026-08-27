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
          "ATLAS authentication error:",
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
     LOGOUT
     ============================================================ */

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(
        "ATLAS logout error:",
        err
      );
    } finally {
      window.location.href = "/login";
    }
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
    setProgressText(
      "Starting backtest..."
    );

    try {

      /* --------------------------------------------------------
         GET CURRENT SESSION
         -------------------------------------------------------- */

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
          "Backtest engine did not return a job ID."
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
         PROCESS BACKTEST JOB
         -------------------------------------------------------- */

      while (true) {

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


          let percent;

          if (
            step?.progress?.percent != null
          ) {

            percent =
              Number(
                step.progress.percent
              );

          } else if (
            total > 0
          ) {

            percent =
              (tested / total) * 100;

          } else {

            percent = 0;
          }


          const safePercent =
            Math.min(
              99,
              Math.max(
                0,
                percent
              )
            );


          setProgress(
            safePercent
          );


          setProgressText(
            `${tested.toLocaleString()} / ${total.toLocaleString()} candles`
          );


          /*
           * Prevent the browser from
           * continuously hammering Supabase.
           */

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                80
              )
          );

          continue;
        }


        /* ------------------------------------------------------
           COMPLETE
           ------------------------------------------------------ */

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


        /* ------------------------------------------------------
           FAILED
           ------------------------------------------------------ */

        if (
          step?.status === "failed"
        ) {

          throw new Error(
            step?.error ||
            "The backtest engine reported a failed job."
          );
        }


        /* ------------------------------------------------------
           UNKNOWN STATUS
           ------------------------------------------------------ */

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

        {/* ------------------------------------------------------
           HEADER
           ------------------------------------------------------ */}

        <DashboardHeader
          onLogout={handleLogout}
        />


        {/* ------------------------------------------------------
           MARKET
           ------------------------------------------------------ */}

        <MarketHeader
          market="XAUUSD"
          timeframe={TIMEFRAME}
          datasetLabel="Historical Dataset"
        />


        {/* ------------------------------------------------------
           MARKET STATISTICS
           ------------------------------------------------------ */}

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


        {/* ------------------------------------------------------
           BACKTEST LAB
           ------------------------------------------------------ */}

        <BacktestLab
          running={running}
          progress={progress}
          progressText={progressText}
          onRun={runBacktest}
          error={error}
        />


        {/* ------------------------------------------------------
           RESULTS
           ------------------------------------------------------ */}

        <BacktestResults
          results={results}
        />


        {/* ------------------------------------------------------
           RESEARCH DIAGNOSTICS
           ------------------------------------------------------ */}

        <ResearchDiagnostics
          results={results}
        />


        {/* ------------------------------------------------------
           ACCOUNT
           ------------------------------------------------------ */}

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