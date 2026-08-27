"use client";

import { getResearchVerdict } from "../lib/diagnostics";

export default function ResearchDiagnostics({
  results
}) {
  if (!results) {
    return null;
  }

  const {
    pf,
    expectancy,
    totalR,
    drawdown,
    trades,
    checks
  } = getResearchVerdict(results);

  const { verdict } =
    getResearchVerdict(results);

  let verdictMessage =
    "ATLAS needs more evidence before judging the strategy.";

  if (verdict === "POSITIVE EDGE") {
    verdictMessage =
      "The current test demonstrates positive profitability, expectancy and equity growth within the research risk limits.";
  }

  if (verdict === "PROMISING") {
    verdictMessage =
      "The strategy shows positive characteristics but requires additional validation before being considered reliable.";
  }

  if (verdict === "NO EDGE") {
    verdictMessage =
      "The tested strategy does not currently demonstrate a positive statistical edge.";
  }

  if (verdict === "INSUFFICIENT SAMPLE") {
    verdictMessage =
      "The current test does not contain enough trades to make a reliable statistical judgment.";
  }

  return (
    <section style={styles.panel}>
      <div style={styles.eyebrow}>
        RESEARCH DIAGNOSTICS
      </div>

      <h2 style={styles.panelTitle}>
        Statistical Edge Assessment
      </h2>

      <p style={styles.description}>
        ATLAS evaluates profitability,
        expectancy, equity growth, sample
        size and drawdown before assigning
        a research verdict.
      </p>

      <div
        style={{
          ...styles.verdict,
          borderColor:
            verdict === "POSITIVE EDGE"
              ? "#315f42"
              : verdict === "NO EDGE"
              ? "#6b3038"
              : "#394052"
        }}
      >
        <div style={styles.verdictLabel}>
          CURRENT VERDICT
        </div>

        <div
          style={{
            ...styles.verdictTitle,
            color:
              verdict === "POSITIVE EDGE"
                ? "#a8e6bb"
                : verdict === "NO EDGE"
                ? "#ff9b9b"
                : "#d3d9e5"
          }}
        >
          {verdict}
        </div>

        <div style={styles.verdictMessage}>
          {verdictMessage}
        </div>
      </div>

      <div style={styles.diagnosticGrid}>
        <Diagnostic
          label="Profit Factor"
          passed={checks.profitability}
          detail={
            Number.isFinite(pf)
              ? `${pf.toFixed(2)} · target > 1.00`
              : "Unavailable"
          }
        />

        <Diagnostic
          label="Expectancy"
          passed={checks.expectancy}
          detail={
            Number.isFinite(expectancy)
              ? `${expectancy.toFixed(3)} R · target > 0`
              : "Unavailable"
          }
        />

        <Diagnostic
          label="Net Result"
          passed={checks.equity}
          detail={
            Number.isFinite(totalR)
              ? `${totalR.toFixed(2)} R · target > 0`
              : "Unavailable"
          }
        />

        <Diagnostic
          label="Sample Size"
          passed={checks.sample}
          detail={
            `${trades.toLocaleString()} trades · minimum 100`
          }
        />

        <Diagnostic
          label="Drawdown"
          passed={checks.drawdown}
          detail={
            Number.isFinite(drawdown)
              ? `${(
                  drawdown * 100
                ).toFixed(2)}% · research limit < 25%`
              : "Unavailable"
          }
        />
      </div>

      <div style={styles.researchNote}>
        <strong>
          ATLAS interpretation
        </strong>

        <p style={styles.researchNoteText}>
          A large number of candles does not
          automatically mean a strategy has
          an edge. ATLAS looks for positive
          expectancy and profitability while
          also considering sample size and
          drawdown.
        </p>
      </div>
    </section>
  );
}


/* ============================================================
   DIAGNOSTIC
   ============================================================ */

function Diagnostic({
  label,
  passed,
  detail
}) {
  return (
    <div style={styles.diagnosticCard}>
      <div style={styles.diagnosticTop}>
        <span style={styles.cardLabel}>
          {label}
        </span>

        <span
          style={{
            ...styles.status,
            color: passed
              ? "#a8e6bb"
              : "#ff9b9b"
          }}
        >
          {passed ? "PASS" : "FAIL"}
        </span>
      </div>

      <div style={styles.diagnosticDetail}>
        {detail}
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

  description: {
    color: "#8d96a8",
    lineHeight: 1.6,
    maxWidth: "700px"
  },

  verdict: {
    marginTop: "24px",
    padding: "22px",
    background: "#080b12",
    border: "1px solid",
    borderRadius: "14px"
  },

  verdictLabel: {
    color: "#7f899b",
    fontSize: "11px",
    letterSpacing: "1.5px"
  },

  verdictTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginTop: "8px"
  },

  verdictMessage: {
    color: "#8d96a8",
    marginTop: "8px",
    lineHeight: 1.5
  },

  diagnosticGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    marginTop: "20px"
  },

  diagnosticCard: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "12px",
    padding: "18px"
  },

  diagnosticTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  cardLabel: {
    color: "#7f899b",
    fontSize: "14px",
    marginBottom: "10px"
  },

  status: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px"
  },

  diagnosticDetail: {
    color: "#a0a9ba",
    fontSize: "13px",
    lineHeight: 1.5
  },

  researchNote: {
    marginTop: "22px",
    padding: "18px",
    borderRadius: "12px",
    background: "#0b1019",
    color: "#9da8bb",
    fontSize: "13px",
    lineHeight: 1.5
  },

  researchNoteText: {
    margin: "8px 0 0"
  }
};