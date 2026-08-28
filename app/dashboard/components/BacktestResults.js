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

  /*
   * ------------------------------------------------------------
   * EQUITY CURVE
   * ------------------------------------------------------------
   *
   * Supports several possible backend formats so the frontend
   * remains compatible while the research engine evolves.
   */

  const equityCurve =
    normalizeEquityCurve(
      results.equity_curve ||
      results.equityCurve ||
      diagnostics.equity_curve ||
      []
    );


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
              ? formatSignedR(
                  results.total_R,
                  2
                )
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
         EQUITY CURVE
         ====================================================== */}

      <ResearchSection
        title="Equity Curve"
        subtitle="Cumulative strategy performance across executed trades."
      />

      <EquityCurve
        data={equityCurve}
      />


      {/* ======================================================
         DRAWDOWN
         ====================================================== */}

      <ResearchSection
        title="Drawdown Analysis"
        subtitle="Depth and persistence of equity declines."
      />

      <DrawdownSummary
        data={equityCurve}
        maxDrawdown={results.max_drawdown}
      />


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
   EQUITY CURVE
   ============================================================ */

function EquityCurve({
  data
}) {
  if (!data.length) {
    return (
      <div style={styles.chartEmpty}>

        <div style={styles.chartEmptyTitle}>
          Equity curve unavailable
        </div>

        <div style={styles.chartEmptyText}>
          The backtest engine has not returned
          an equity-series yet. Aggregate
          performance results are still available
          above.
        </div>

      </div>
    );
  }

  const width = 1000;
  const height = 300;

  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const values =
    data.map(
      item => item.cumulativeR
    );

  const minValue =
    Math.min(
      0,
      ...values
    );

  const maxValue =
    Math.max(
      0,
      ...values
    );

  const range =
    Math.max(
      0.000001,
      maxValue - minValue
    );

  const points =
    data.map(
      (item, index) => {

        const x =
          paddingLeft +
          (
            index /
            Math.max(
              1,
              data.length - 1
            )
          ) *
          chartWidth;

        const y =
          paddingTop +
          (
            1 -
            (
              item.cumulativeR -
              minValue
            ) /
            range
          ) *
          chartHeight;

        return {
          x,
          y,
          value:
            item.cumulativeR
        };
      }
    );

  const line =
    points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");

  const zeroY =
    paddingTop +
    (
      1 -
      (
        0 -
        minValue
      ) /
      range
    ) *
    chartHeight;

  const first =
    data[0]?.cumulativeR ?? 0;

  const last =
    data[data.length - 1]?.cumulativeR ?? 0;

  return (
    <div style={styles.chartContainer}>

      <div style={styles.chartHeader}>

        <div>
          <div style={styles.chartLabel}>
            CUMULATIVE R
          </div>

          <div
            style={{
              ...styles.chartValue,
              color:
                last >= 0
                  ? "#a8e6bb"
                  : "#ff9b9b"
            }}
          >
            {formatSignedR(
              last,
              2
            )}
          </div>
        </div>

        <div style={styles.chartMeta}>
          {data.length.toLocaleString()} points
        </div>

      </div>

      <div style={styles.chartViewport}>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >

          {/* --------------------------------------------------
             GRID
             -------------------------------------------------- */}

          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={width - paddingRight}
            y2={zeroY}
            stroke="#263044"
            strokeWidth="1"
            strokeDasharray="4 5"
          />

          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="#1e2738"
            strokeWidth="1"
          />

          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#1e2738"
            strokeWidth="1"
          />

          {/* --------------------------------------------------
             EQUITY LINE
             -------------------------------------------------- */}

          <path
            d={line}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* --------------------------------------------------
             FINAL POINT
             -------------------------------------------------- */}

          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill="#ffffff"
            />
          )}

        </svg>

        {/* ----------------------------------------------------
           Y AXIS LABELS
           ---------------------------------------------------- */}

        <div style={styles.yAxisTop}>
          {formatSignedR(
            maxValue,
            1
          )}
        </div>

        <div style={styles.yAxisZero}>
          0 R
        </div>

        <div style={styles.yAxisBottom}>
          {formatSignedR(
            minValue,
            1
          )}
        </div>

      </div>

      <div style={styles.chartFooter}>

        <span>
          Trade 1
        </span>

        <span>
          Start: {formatSignedR(first, 2)}
        </span>

        <span>
          Trade {data.length.toLocaleString()}
        </span>

      </div>

    </div>
  );
}


/* ============================================================
   DRAWDOWN SUMMARY
   ============================================================ */

function DrawdownSummary({
  data,
  maxDrawdown
}) {
  const calculated =
    calculateDrawdownStats(data);

  const backendDrawdown =
    maxDrawdown != null
      ? Number(maxDrawdown)
      : null;

  const drawdownPercent =
    Number.isFinite(
      backendDrawdown
    )
      ? backendDrawdown * 100
      : null;

  return (
    <div style={styles.drawdownPanel}>

      <div style={styles.drawdownGrid}>

        <div style={styles.drawdownCard}>

          <div style={styles.cardLabel}>
            Maximum Drawdown
          </div>

          <div style={styles.drawdownValue}>
            {drawdownPercent != null
              ? `${drawdownPercent.toFixed(2)}%`
              : calculated.maxDrawdownR != null
              ? `${calculated.maxDrawdownR.toFixed(2)} R`
              : "—"}
          </div>

        </div>


        <div style={styles.drawdownCard}>

          <div style={styles.cardLabel}>
            Lowest Equity
          </div>

          <div style={styles.drawdownValue}>
            {calculated.lowestEquity != null
              ? formatSignedR(
                  calculated.lowestEquity,
                  2
                )
              : "—"}
          </div>

        </div>


        <div style={styles.drawdownCard}>

          <div style={styles.cardLabel}>
            Current Equity
          </div>

          <div
            style={{
              ...styles.drawdownValue,
              color:
                calculated.currentEquity >= 0
                  ? "#a8e6bb"
                  : "#ff9b9b"
            }}
          >
            {calculated.currentEquity != null
              ? formatSignedR(
                  calculated.currentEquity,
                  2
                )
              : "—"}
          </div>

        </div>

      </div>

      {!data.length && (
        <div style={styles.drawdownNotice}>
          Detailed drawdown sequencing will become
          available once the engine returns the
          equity curve.
        </div>
      )}

    </div>
  );
}


/* ============================================================
   CALCULATE DRAWDOWN STATS
   ============================================================ */

function calculateDrawdownStats(
  data
) {
  if (!data.length) {
    return {
      maxDrawdownR: null,
      lowestEquity: null,
      currentEquity: null
    };
  }

  let peak = data[0].cumulativeR;
  let maxDrawdown = 0;
  let lowestEquity = data[0].cumulativeR;

  for (const point of data) {

    const equity =
      Number(
        point.cumulativeR
      );

    if (equity > peak) {
      peak = equity;
    }

    const drawdown =
      peak - equity;

    if (
      drawdown >
      maxDrawdown
    ) {
      maxDrawdown =
        drawdown;
    }

    if (
      equity <
      lowestEquity
    ) {
      lowestEquity =
        equity;
    }
  }

  return {
    maxDrawdownR:
      maxDrawdown,

    lowestEquity,

    currentEquity:
      data[data.length - 1]
        .cumulativeR
  };
}


/* ============================================================
   NORMALIZE EQUITY CURVE
   ============================================================ */

function normalizeEquityCurve(
  raw
) {
  if (!Array.isArray(raw)) {
    return [];
  }

  let runningR = 0;

  const normalized = [];

  for (
    let index = 0;
    index < raw.length;
    index++
  ) {

    const item =
      raw[index];

    /*
     * Format 1:
     *
     * {
     *   cumulative_R: 5.2
     * }
     */

    if (
      item &&
      item.cumulative_R != null
    ) {

      const cumulative =
        Number(
          item.cumulative_R
        );

      if (
        Number.isFinite(
          cumulative
        )
      ) {

        runningR =
          cumulative;

        normalized.push({
          trade:
            item.trade ??
            index + 1,

          cumulativeR:
            cumulative
        });

        continue;
      }
    }


    /*
     * Format 2:
     *
     * {
     *   cumulativeR: 5.2
     * }
     */

    if (
      item &&
      item.cumulativeR != null
    ) {

      const cumulative =
        Number(
          item.cumulativeR
        );

      if (
        Number.isFinite(
          cumulative
        )
      ) {

        runningR =
          cumulative;

        normalized.push({
          trade:
            item.trade ??
            index + 1,

          cumulativeR:
            cumulative
        });

        continue;
      }
    }


    /*
     * Format 3:
     *
     * {
     *   total_R: 2
     * }
     */

    if (
      item &&
      item.total_R != null
    ) {

      const cumulative =
        Number(
          item.total_R
        );

      if (
        Number.isFinite(
          cumulative
        )
      ) {

        runningR =
          cumulative;

        normalized.push({
          trade:
            item.trade ??
            index + 1,

          cumulativeR:
            cumulative
        });

        continue;
      }
    }


    /*
     * Format 4:
     *
     * {
     *   r: 2
     * }
     *
     * This is interpreted as the R result
     * of an individual trade.
     */

    if (
      item &&
      item.r != null
    ) {

      const tradeR =
        Number(
          item.r
        );

      if (
        Number.isFinite(
          tradeR
        )
      ) {

        runningR +=
          tradeR;

        normalized.push({
          trade:
            item.trade ??
            index + 1,

          cumulativeR:
            runningR
        });

        continue;
      }
    }


    /*
     * Format 5:
     *
     * raw numeric array
     *
     * [2, -1, 2, -1, ...]
     */

    if (
      typeof item ===
      "number"
    ) {

      const tradeR =
        Number(item);

      if (
        Number.isFinite(
          tradeR
        )
      ) {

        runningR +=
          tradeR;

        normalized.push({
          trade:
            index + 1,

          cumulativeR:
            runningR
        });
      }
    }
  }

  return normalized;
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
    Object.entries(
      data || {}
    );

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
                value?.totalR ??
                value?.total_R ??
                0
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
                        : expectancy < 0
                        ? "#ff9b9b"
                        : "#9da8bb"
                  }}
                >
                  {expectancy > 0
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
   FORMAT SIGNED R
   ============================================================ */

function formatSignedR(
  value,
  decimals = 2
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "—";
  }

  if (number > 0) {
    return `+${number.toFixed(decimals)} R`;
  }

  return `${number.toFixed(decimals)} R`;
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

  /* ----------------------------------------------------------
     CHART
     ---------------------------------------------------------- */

  chartContainer: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "14px",
    padding: "18px"
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "10px"
  },

  chartLabel: {
    color: "#687386",
    fontSize: "10px",
    letterSpacing: "1.2px"
  },

  chartValue: {
    fontSize: "20px",
    fontWeight: "700",
    marginTop: "4px"
  },

  chartMeta: {
    color: "#596477",
    fontSize: "11px"
  },

  chartViewport: {
    position: "relative",
    width: "100%",
    height: "300px"
  },

  yAxisTop: {
    position: "absolute",
    left: "0",
    top: "4px",
    color: "#596477",
    fontSize: "10px"
  },

  yAxisZero: {
    position: "absolute",
    left: "0",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#596477",
    fontSize: "10px"
  },

  yAxisBottom: {
    position: "absolute",
    left: "0",
    bottom: "22px",
    color: "#596477",
    fontSize: "10px"
  },

  chartFooter: {
    display: "flex",
    justifyContent: "space-between",
    color: "#596477",
    fontSize: "10px",
    marginTop: "4px"
  },

  chartEmpty: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "14px",
    padding: "24px"
  },

  chartEmptyTitle: {
    color: "#9da8bb",
    fontSize: "14px",
    fontWeight: "600"
  },

  chartEmptyText: {
    color: "#687386",
    fontSize: "12px",
    lineHeight: 1.6,
    marginTop: "7px",
    maxWidth: "650px"
  },

  /* ----------------------------------------------------------
     DRAWDOWN
     ---------------------------------------------------------- */

  drawdownPanel: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "14px",
    padding: "16px"
  },

  drawdownGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px"
  },

  drawdownCard: {
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "10px",
    padding: "14px"
  },

  drawdownValue: {
    fontSize: "19px",
    fontWeight: "700"
  },

  drawdownNotice: {
    marginTop: "12px",
    color: "#687386",
    fontSize: "11px",
    lineHeight: 1.5
  },

  /* ----------------------------------------------------------
     BREAKDOWNS
     ---------------------------------------------------------- */

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