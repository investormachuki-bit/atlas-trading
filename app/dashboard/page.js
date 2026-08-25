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

  async function runBacktest() {
    setRunning(true);
    setError("");
    setResults(null);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(BACKTEST_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          market_id: MARKET_ID,
          strategy_id: STRATEGY_ID,
          timeframe: "M5",
          risk_reward: 2,
          risk_per_trade: 0.01,
          limit: 100000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Backtest failed");
      }

      setResults(data);
    } catch (err) {
      setError(err.message || "Unable to run backtest");
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
            <div style={styles.logo}>ATLAS</div>
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
            5-Minute · Historical Dataset
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
            value="READY"
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
            Run the ATLAS Trend Continuation strategy
            against XAUUSD M5 historical data.
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

          <button
            onClick={runBacktest}
            disabled={running}
            style={{
              ...styles.runButton,
              opacity: running ? 0.65 : 1
            }}
          >
            {running ? "RUNNING BACKTEST..." : "RUN BACKTEST"}
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
              Backtest Complete
            </h2>

            <div style={styles.resultsGrid}>

              <ResultCard
                label="Trades"
                value={results.results?.trades ?? "—"}
              />

              <ResultCard
                label="Win Rate"
                value={
                  results.results?.win_rate != null
                    ? `${(
                        results.results.win_rate * 100
                      ).toFixed(2)}%`
                    : "—"
                }
              />

              <ResultCard
                label="Profit Factor"
                value={
                  results.results?.profit_factor != null
                    ? Number(
                        results.results.profit_factor
                      ).toFixed(2)
                    : "—"
                }
              />

              <ResultCard
                label="Expectancy"
                value={
                  results.results?.expectancy_R != null
                    ? `${Number(
                        results.results.expectancy_R
                      ).toFixed(3)} R`
                    : "—"
                }
              />

              <ResultCard
                label="Total R"
                value={
                  results.results?.total_R != null
                    ? `${Number(
                        results.results.total_R
                      ).toFixed(2)} R`
                    : "—"
                }
              />

              <ResultCard
                label="Max Drawdown"
                value={
                  results.results?.max_drawdown != null
                    ? `${(
                        results.results.max_drawdown * 100
                      ).toFixed(2)}%`
                    : "—"
                }
              />

              <ResultCard
                label="Equity Multiple"
                value={
                  results.results?.equity_multiple != null
                    ? `${Number(
                        results.results.equity_multiple
                      ).toFixed(3)}x`
                    : "—"
                }
              />

              <ResultCard
                label="Data Tested"
                value={
                  results.results?.trades
                    ? `${results.results.trades} trades`
                    : "—"
                }
              />

            </div>

            <div style={styles.notice}>
              This first connection uses the current API
              limit of 100,000 candles. The next engine
              upgrade will process the complete 329,103-candle
              five-year dataset.
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