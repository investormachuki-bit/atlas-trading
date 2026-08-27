"use client";

import { useCallback, useState } from "react";

import {
  MARKET_ID,
  STRATEGY_ID,
  TIMEFRAME,
  RISK_PER_TRADE,
  RISK_REWARD,
  TOTAL_CANDLES
} from "../lib/constants";

import {
  startBacktest,
  stepBacktest
} from "../lib/api";


const STEP_DELAY = 80;


/* ============================================================
   BACKTEST HOOK
   ============================================================ */

export default function useBacktest() {
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


  /* ==========================================================
     RUN BACKTEST
     ========================================================== */

  const runBacktest = useCallback(
    async (token) => {
      if (!token) {
        setError(
          "Authentication session is missing. Please sign in again."
        );

        return;
      }

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


        /* ------------------------------------------------------
           PROCESS JOB
           ------------------------------------------------------ */

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
                Math.min(
                  99,
                  (tested / total) * 100
                );
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
              (resolve) =>
                setTimeout(
                  resolve,
                  STEP_DELAY
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
             FAILED / UNKNOWN
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
          "Backtest error:",
          err
        );

        setError(
          err?.message ||
          "Unable to complete backtest."
        );

      } finally {

        setRunning(false);
      }
    },
    [running]
  );


  /* ==========================================================
     RESET
     ========================================================== */

  const resetBacktest =
    useCallback(() => {
      if (running) {
        return;
      }

      setProgress(0);
      setProgressText("");
      setError("");
      setResults(null);
    }, [running]);


  return {
    running,
    progress,
    progressText,
    error,
    results,
    runBacktest,
    resetBacktest
  };
}