"use client";

import {
  TOTAL_CANDLES
} from "../lib/constants";

export default function BacktestResults({
  results
}) {
  if (!results) {
    return null;
  }

  const candlesTested = Number(
    results.candles_tested || 0
  );

  const complete =
    results.complete === true;

  return (
    <section style={styles.panel}>
      <div style={styles.eyebrow}>
        RESULTS
      </div>

      <h2 style={styles.panelTitle}>
        Five-Year Backtest Complete
      </h2>

      <div style={styles.coverage}>
        <strong>
          {candlesTested.toLocaleString()}
        </strong>{" "}
        candles tested

        {complete && (
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
                  Number(
                    results.win_rate
                  ) * 100
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
                  Number(
                    results.max_drawdown
                  ) * 100
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
          Historical coverage:
        </strong>{" "}
        {complete
          ? `ATLAS processed the complete ${TOTAL_CANDLES.toLocaleString()}-candle dataset.`
          : `ATLAS processed ${candlesTested.toLocaleString()} of ${TOTAL_CANDLES.toLocaleString()} candles.`}
      </div>
    </section>
  );
}


/* ============================================================
   RESULT CARD
   ============================================================ */

function ResultCard({
  label,
  value
}) {
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


/* ============================================================
   STYLES
   ============================================================ */

const styles = {
  panel: {
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "18px",
    padding: "26px",
    marginTop: "28px"
  },

  eyebrow: {
    color: "#7f899b",
    fontSize: "12px",
    letterSpacing: "1.5px",
    marginBottom: "8px"
  },

  panelTitle: {
    fontSize: "28px",
    margin: "8px 0"
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

  cardLabel: {
    color: "#7f899b",
    fontSize: "14px",
    marginBottom: "10px"
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
  }
};