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
  TIMEFRAME,
  TOTAL_CANDLES
} from "./lib/constants";

import useBacktest from "./hooks/useBacktest";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  /* ==========================================================
     BACKTEST ENGINE
     ========================================================== */

  const {
    running,
    progress,
    progressText,
    error,
    results,
    runBacktest
  } = useBacktest();


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
     START BACKTEST
     ========================================================== */

  async function handleRunBacktest() {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      window.location.href = "/login";
      return;
    }

    await runBacktest(
      session.access_token
    );
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
          onRun={handleRunBacktest}
          error={error}
        />


        <BacktestResults
          results={results}
        />


        <ResearchDiagnostics
          results={results}
        />


        <div style={styles.account}>
          SIGNED IN AS {user.email}
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