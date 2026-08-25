"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const MARKET_ID = "ee6cf0c3-1a03-48a9-9d76-7aa36ad62657";
const STRATEGY_ID = "22aab602-2282-4393-bd9c-efa82171b6d5";

const BACKTEST_API =
  "https://ookqbnpjtiqixamacalv.supabase.co/functions/v1/backtest-api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function apiCall(body, token) {
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
        data.error ||
        `Backtest failed with HTTP ${response.status}`
      );
    }

    return data;
  }

  async function runBacktest() {
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

      const token = session.access_token;

      /*
       * STEP 1
       * Create the persistent backtest job.
       */
      const start = await apiCall(
        {
          action: "start",
          market_id: MARKET_ID,
          strategy_id: STRATEGY_ID,
          timeframe: "M5",
          risk_reward: 2,
          risk_per_trade: 0.01
        },
        token
      );

      const jobId = start.job_id;
      const total = Number(start.total_candles || 329103);

      setProgressText(
        `Job created · ${total.toLocaleString()} candles`
      );

      /*
       * STEP 2
       * Process the dataset chunk-by-chunk.
       */
      let finished = false;

      while (!finished) {
        const step = await apiCall(
          {
            action: "step",
            job_id: jobId,
            risk_reward: 2,
            risk_per_trade: 0.01
          },
          token
        );

        if (step.status === "running") {
          const tested =
            step.progress?.candles_tested || 0;

          const percent =
            step.progress?.percent ||
            Math.min(99, (tested / total) * 100);

          setProgress(percent);

          setProgressText(
            `${tested.toLocaleString()} / ${total.toLocaleString()} candles`
          );

          /*
           * Give the browser a tiny pause between chunks.
           */
          await new Promise(resolve =>
            setTimeout(resolve, 80)
          );

          continue;
        }

        if (step.status === "complete") {
          finished = true;

          setProgress(100);
          setProgressText(
            "Complete · 329,103 candles tested"
          );

          setResults(step.results);
        } else {
          throw new Error(
            "Unexpected backtest status"
          );
        }
      }

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to complete backtest"
      );
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        Loading ATLAS...
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <header style={styles.header}>
          <div>
            <div style={styles.logo}>
              ATLAS
            </div>

            <div style={styles.subtitle}>
              Trading Intelligence
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={styles.logout}
          >
            LOG OUT
          </button>
        </header>

        <section>
          <div style={styles.eyebrow}>
            RESEARCH MARKET
          </div>

          <h1 style={styles.title}>
            XAUUSD
          </h1>

          <div style={styles.marketSubtitle}>
            5-Minute · 5-Year Historical Dataset
          </div>
        </section>

        <section style={styles.grid}>

          <StatCard
            label="Candles"
            value="329,103"
          />

          <StatCard
            label="Market"
            value="XAUUSD"
          />

          <StatCard
            label="Timeframe"
            value="M5"
          />

          <StatCard
            label="Engine"
            value={running ? "RUNNING" : "READY"}
          />

        </section>

        <section style={styles.panel}>

          <div style={styles.eyebrow}>
            BACKTEST LAB
          </div>

          <h2 style={styles.panelTitle}>
            Trend Continuation
          </h2>

          <p style={styles.description}>
            Run ATLAS Trend Continuation against
            the complete five-year XAUUSD M5 dataset.
          </p>

          <div style={styles.parameters}>

            <div>
              <span style={styles.parameterLabel}>
                Risk / Trade
              </span>
              <strong>1%</strong>
            </div>

            <div>
              <span style={styles.parameterLabel}>
                Risk / Reward
              </span>
              <strong>1 : 2</strong>
            </div>

            <div>
              <span style={styles.parameterLabel}>
                Timeframe
              </span>
              <strong>M5</strong>
            </div>

          </div>

          {running && (
            <div style={styles.progressBox}>

              <div style={styles.progressHeader}>
                <span>
                  BACKTESTING
                </span>

                <strong>
                  {progress.toFixed(1)}%
                </strong>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${progress}%`
                  }}
                />
              </div>

              <div style={styles.progressText}>
                {progressText}
              </div>

            </div>
          )}

          <button
            onClick={runBacktest}
            disabled={running}
            style={{
              ...styles.runButton,
              opacity: running ? 0.55 : 1
            }}
          >
            {running
              ? "BACKTEST RUNNING..."
              : "RUN BACKTEST"}
          </button>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

        </section>

        {results && (
          <section style={styles.panel}>

            <div style={styles.eyebrow}>
              RESULTS
            </div>

            <h2 style={styles.panelTitle}>
              Five-Year Backtest Complete
            </h2>

            <div style={styles.coverage}>
              <strong>
                {Number(
                  results.candles_tested
                ).toLocaleString()}
              </strong>

              {" "}candles tested

              {results.complete && (
                <span>
                  {" "}· COMPLETE DATASET
                </span>
              )}
            </div>

            <div style={styles.resultsGrid}>

              <ResultCard
                label="Trades"
                value={
                  results.trades ?? "—"
                }
              />

              <ResultCard
                label="Win Rate"
                value={
                  results.win_rate != null
                    ? `${(
                        results.win_rate * 100
                      ).toFixed(2)}%`
                    : "—"
                }
              />

              <ResultCard
                label="Profit Factor"
                value={
                  results.profit_factor != null
                    ? Number(
                        results.profit_factor
                      ).toFixed(2)
                    : "—"
                }
              />

              <ResultCard
                label="Expectancy"
                value={
                  results.expectancy_R != null
                    ? `${Number(
                        results.expectancy_R
                      ).toFixed(3)} R`
                    : "—"
                }
              />

              <ResultCard
                label="Total R"
                value={
                  results.total_R != null
                    ? `${Number(
                        results.total_R
                      ).toFixed(2)} R`
                    : "—"
                }
              />

              <ResultCard
                label="Max Drawdown"
                value={
                  results.max_drawdown != null
                    ? `${(
                        results.max_drawdown * 100
                      ).toFixed(2)}%`
                    : "—"
                }
              />

              <ResultCard
                label="Equity Multiple"
                value={
                  results.equity_multiple != null
                    ? `${Number(
                        results.equity_multiple
                      ).toFixed(3)}x`
                    : "—"
                }
              />

              <ResultCard
                label="Test Trades"
                value={
                  results.test_trades ?? "—"
                }
              />

            </div>

            <div style={styles.notice}>
              <strong>
                Full historical coverage:
              </strong>{" "}
              {results.complete
                ? "ATLAS processed the complete 329,103-candle dataset."
                : "The dataset was not completely processed."}
            </div>

          </section>
        )}

        <div style={styles.account}>
          SIGNED IN AS {user.email}
        </div>

      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>
        {label}
      </div>

      <div style={styles.cardValue}>
        {value}
      </div>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div style={styles.resultCard}>
      <div style={styles.cardLabel}>
        {label}
      </div>

      <div style={styles.resultValue}>
        {value}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080b12",
    color: "#ffffff",
    padding: "24px",
    fontFamily: "Arial, sans-serif"
  },

  loading: {
    minHeight: "100vh",
    background: "#080b12",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif"
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "48px"
  },

  logo: {
    fontSize: "30px",
    fontWeight: "700",
    letterSpacing: "3px"
  },

  subtitle: {
    color: "#8d96a8",
    marginTop: "5px"
  },

  logout: {
    background: "transparent",
    color: "#9da8bb",
    border: "1px solid #263044",
    borderRadius: "8px",
    padding: "10px 14px"
  },

  eyebrow: {
    color: "#7f899b",
    fontSize: "12px",
    letterSpacing: "1.5px",
    marginBottom: "8px"
  },

  title: {
    fontSize: "42px",
    margin: "0 0 8px"
  },

  marketSubtitle: {
    color: "#8d96a8",
    fontSize: "18px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginTop: "28px"
  },

  card: {
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "16px",
    padding: "22px"
  },

  cardLabel: {
    color: "#7f899b",
    fontSize: "14px",
    marginBottom: "10px"
  },

  cardValue: {
    fontSize: "22px",
    fontWeight: "700"
  },

  panel: {
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "18px",
    padding: "26px",
    marginTop: "28px"
  },

  panelTitle: {
    fontSize: "28px",
    margin: "8px 0"
  },

  description: {
    color: "#8d96a8",
    lineHeight: 1.6,
    maxWidth: "700px"
  },

  parameters: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "16px",
    margin: "24px 0"
  },

  parameterLabel: {
    display: "block",
    color: "#7f899b",
    fontSize: "12px",
    marginBottom: "6px"
  },

  progressBox: {
    marginBottom: "18px"
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#8d96a8",
    fontSize: "12px",
    marginBottom: "8px"
  },

  progressTrack: {
    height: "8px",
    background: "#080b12",
    borderRadius: "20px",
    overflow: "hidden"
  },

  progressBar: {
    height: "100%",
    background: "#ffffff",
    borderRadius: "20px",
    transition: "width 0.2s ease"
  },

  progressText: {
    marginTop: "8px",
    color: "#7f899b",
    fontSize: "12px"
  },

  runButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#080b12",
    fontWeight: "700",
    fontSize: "15px"
  },

  error: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "10px",
    background: "#251318",
    color: "#ff9b9b"
  },

  coverage: {
    color: "#8d96a8",
    marginTop: "18px"
  },

  resultsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "14px",
    marginTop: "20px"
  },

  resultCard: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "12px",
    padding: "18px"
  },

  resultValue: {
    fontSize: "21px",
    fontWeight: "700"
  },

  notice: {
    marginTop: "22px",
    padding: "14px",
    borderRadius: "10px",
    background: "#0b1019",
    color: "#7f899b",
    fontSize: "13px",
    lineHeight: 1.5
  },

  account: {
    marginTop: "28px",
    color: "#596477",
    fontSize: "12px"
  }
};