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

  const diagnostics =
    results.diagnostics || {};

  const sessions =
    diagnostics.sessions || {};

  const directions =
    diagnostics.directions || {};

  const volatility =
    diagnostics.volatility || {};

  const years =
    diagnostics.years || {};

  const months =
    diagnostics.months || {};

  const exitReasons =
    diagnostics.exit_reasons || {};

  return (
    <section style={styles.panel}>

      {/* ======================================================
         HEADER
         ====================================================== */}

      <div style={styles.eyebrow}>
        BACKTEST RESULTS
      </div>

      <h2 style={styles.panelTitle}>
        Five-Year Research Results
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


      {/* ======================================================
         CORE PERFORMANCE
         ====================================================== */}

      <ResearchSection
        title="Core Performance"
        subtitle="Primary measures of strategy performance."
      />

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
                  Number(results.win_rate) * 100
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


      {/* ======================================================
         TRADE BEHAVIOUR
         ====================================================== */}

      <ResearchSection
        title="Trade Behaviour"
        subtitle="How the strategy behaves once trades are triggered."
      />

      <div style={styles.resultsGrid}>

        <ResultCard
          label="Average MFE"
          value={
            diagnostics.average_MFE_R != null
              ? `${Number(
                  diagnostics.average_MFE_R
                ).toFixed(3)} R`
              : "—"
          }
        />

        <ResultCard
          label="Average MAE"
          value={
            diagnostics.average_MAE_R != null
              ? `${Number(
                  diagnostics.average_MAE_R
                ).toFixed(3)} R`
              : "—"
          }
        />

        <ResultCard
          label="Max Consecutive Losses"
          value={
            diagnostics.max_consecutive_losses ??
            "—"
          }
        />

      </div>


      {/* ======================================================
         EDGE BREAKDOWN
         ====================================================== */}

      <ResearchSection
        title="Edge Breakdown"
        subtitle="Where the strategy performs and where it struggles."
      />

      <Breakdown
        title="Direction"
        data={directions}
      />

      <Breakdown
        title="Trading Session"
        data={sessions}
      />

      <Breakdown
        title="Volatility"
        data={volatility}
      />

      <Breakdown
        title="Exit Reasons"
        data={exitReasons}
      />


      {/* ======================================================
         YEARLY PERFORMANCE
         ====================================================== */}

      <ResearchSection
        title="Year-by-Year Performance"
        subtitle="Consistency of the edge across the historical period."
      />

      <Breakdown
        title="Years"
        data={years}
        showRows
      />


      {/* ======================================================
         MONTHLY PERFORMANCE
         ====================================================== */}

      <ResearchSection
        title="Monthly Performance"
        subtitle="Distribution of performance across individual months."
      />

      <Breakdown
        title="Months"
        data={months}
        showRows
      />


      {/* ======================================================
         HISTORICAL COVERAGE
         ====================================================== */}

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
   RESEARCH SECTION
   ============================================================ */

function ResearchSection({
  title,
  subtitle
}) {
  return (
    <div style={styles.sectionHeader}>

      <h3 style={styles.sectionTitle}>
        {title}
      </h3>

      <div style={styles.sectionSubtitle}>
        {subtitle}
      </div>

    </div>
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
   BREAKDOWN
   ============================================================ */

function Breakdown({
  title,
  data,
  showRows = false
}) {
  const entries =
    Object.entries(data || {});

  if (!entries.length) {
    return (
      <div style={styles.empty}>
        {title} data unavailable.
      </div>
    );
  }

  return (
    <div style={styles.breakdown}>

      <div style={styles.breakdownTitle}>
        {title}
      </div>

      <div style={styles.breakdownGrid}>

        {entries.map(
          ([key, value]) => {

            const trades =
              Number(
                value?.trades || 0
              );

            const winRate =
              Number(
                value?.win_rate || 0
              );

            const expectancy =
              Number(
                value?.expectancy_R || 0
              );

            const totalR =
              Number(
                value?.totalR || 0
              );

            return (
              <div
                key={key}
                style={styles.breakdownCard}
              >

                <div style={styles.breakdownName}>
                  {key}
                </div>

                <div style={styles.breakdownStats}>

                  <span>
                    {trades.toLocaleString()} trades
                  </span>

                  <span>
                    {(winRate * 100).toFixed(1)}% win
                  </span>

                </div>

                <div
                  style={{
                    ...styles.breakdownResult,
                    color:
                      expectancy > 0
                        ? "#a8e6bb"
                        : "#ff9b9b"
                  }}
                >
                  {expectancy >= 0
                    ? "+"
                    : ""}
                  {expectancy.toFixed(3)} R expectancy
                </div>

                {showRows && (
                  <div style={styles.totalR}>
                    Total:{" "}
                    {totalR >= 0
                      ? "+"
                      : ""}
                    {totalR.toFixed(2)} R
                  </div>
                )}

              </div>
            );
          }
        )}

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

  sectionHeader: {
    marginTop: "30px",
    marginBottom: "14px"
  },

  sectionTitle: {
    fontSize: "18px",
    margin: "0 0 5px"
  },

  sectionSubtitle: {
    color: "#687386",
    fontSize: "12px",
    lineHeight: 1.5
  },

  resultsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "14px"
  },

  resultCard: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "12px",
    padding: "18px"
  },

  cardLabel: {
    color: "#7f899b",
    fontSize: "13px",
    marginBottom: "9px"
  },

  resultValue: {
    fontSize: "21px",
    fontWeight: "700"
  },

  breakdown: {
    marginTop: "14px"
  },

  breakdownTitle: {
    color: "#9da8bb",
    fontSize: "13px",
    marginBottom: "10px"
  },

  breakdownGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px"
  },

  breakdownCard: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "12px",
    padding: "14px"
  },

  breakdownName: {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "8px"
  },

  breakdownStats: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    color: "#7f899b",
    fontSize: "11px"
  },

  breakdownResult: {
    marginTop: "10px",
    fontSize: "13px",
    fontWeight: "600"
  },

  totalR: {
    marginTop: "5px",
    color: "#687386",
    fontSize: "11px"
  },

  empty: {
    padding: "14px",
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "10px",
    color: "#687386",
    fontSize: "12px"
  },

  notice: {
    marginTop: "26px",
    padding: "14px",
    borderRadius: "10px",
    background: "#0b1019",
    color: "#7f899b",
    fontSize: "13px",
    lineHeight: 1.5
  }

};