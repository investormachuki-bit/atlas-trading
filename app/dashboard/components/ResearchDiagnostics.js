"use client";

import { useMemo, useState } from "react";

import {
  calculateDiagnostics,
  getResearchVerdict
} from "../lib/diagnostics";

export default function ResearchDiagnostics({
  results
}) {
  const [expanded, setExpanded] = useState(false);

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
  } = calculateDiagnostics(results);

  const {
    verdict,
    message: verdictMessage
  } = getResearchVerdict(results);

  const robustness = useMemo(
    () => buildRobustnessAssessment(results, {
      pf,
      expectancy,
      totalR,
      drawdown,
      trades,
      checks
    }),
    [
      results,
      pf,
      expectancy,
      totalR,
      drawdown,
      trades,
      checks
    ]
  );

  const verdictStyle =
    getVerdictStyle(verdict);

  return (
    <section style={styles.panel}>

      {/* ======================================================
         HEADER
         ====================================================== */}

      <div style={styles.eyebrow}>
        RESEARCH DIAGNOSTICS
      </div>

      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.panelTitle}>
            Statistical Edge Assessment
          </h2>

          <p style={styles.description}>
            ATLAS evaluates profitability, risk,
            sample quality, consistency and
            robustness before a strategy advances
            toward live-market validation.
          </p>
        </div>
      </div>


      {/* ======================================================
         CURRENT VERDICT
         ====================================================== */}

      <div
        style={{
          ...styles.verdict,
          borderColor: verdictStyle.border
        }}
      >

        <div style={styles.verdictLabel}>
          CURRENT VERDICT
        </div>

        <div
          style={{
            ...styles.verdictTitle,
            color: verdictStyle.color
          }}
        >
          {verdict}
        </div>

        <div style={styles.verdictMessage}>
          {verdictMessage}
        </div>

      </div>


      {/* ======================================================
         ROBUSTNESS GATE
         ====================================================== */}

      <div
        style={{
          ...styles.robustnessGate,
          borderColor: robustness.border
        }}
      >

        <div style={styles.gateHeader}>

          <div>
            <div style={styles.gateEyebrow}>
              RESEARCH GATE
            </div>

            <div
              style={{
                ...styles.gateTitle,
                color: robustness.color
              }}
            >
              {robustness.label}
            </div>
          </div>

          <div
            style={{
              ...styles.gateScore,
              color: robustness.color
            }}
          >
            {robustness.score}
            <span style={styles.gateScoreSmall}>
              /100
            </span>
          </div>

        </div>

        <div style={styles.gateMessage}>
          {robustness.message}
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${robustness.score}%`,
              background: robustness.color
            }}
          />
        </div>

      </div>


      {/* ======================================================
         VALIDATION STAGE
         ====================================================== */}

      <div style={styles.stageBox}>

        <div style={styles.stageHeader}>
          <span style={styles.stageLabel}>
            VALIDATION PIPELINE
          </span>

          <span style={styles.stageCurrent}>
            CURRENT STAGE: HISTORICAL BACKTEST
          </span>
        </div>

        <div style={styles.stageList}>

          <Stage
            number="01"
            title="Historical Backtest"
            status="CURRENT"
            active
          />

          <Stage
            number="02"
            title="Robustness Testing"
            status={
              robustness.nextStage
                ? "NEXT"
                : "LOCKED"
            }
            active={robustness.nextStage}
          />

          <Stage
            number="03"
            title="Out-of-Sample Testing"
            status="LOCKED"
          />

          <Stage
            number="04"
            title="Walk-Forward Validation"
            status="LOCKED"
          />

          <Stage
            number="05"
            title="Monte Carlo Analysis"
            status="LOCKED"
          />

          <Stage
            number="06"
            title="Paper Trading"
            status="LOCKED"
          />

          <Stage
            number="07"
            title="Controlled Live Test"
            status="LOCKED"
          />

        </div>

      </div>


      {/* ======================================================
         DETAILS TOGGLE
         ====================================================== */}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={styles.toggleButton}
      >
        <span>
          {expanded
            ? "HIDE RESEARCH DETAILS"
            : "VIEW RESEARCH DETAILS"}
        </span>

        <span style={styles.toggleIcon}>
          {expanded ? "−" : "+"}
        </span>
      </button>


      {/* ======================================================
         EXPANDED DETAILS
         ====================================================== */}

      {expanded && (
        <div style={styles.details}>

          {/* --------------------------------------------------
             BASIC DIAGNOSTICS
             -------------------------------------------------- */}

          <div style={styles.subsectionTitle}>
            Core Diagnostic Checks
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
                `${Number(
                  trades || 0
                ).toLocaleString()} trades · minimum 100`
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


          {/* --------------------------------------------------
             ROBUSTNESS CHECKS
             -------------------------------------------------- */}

          <div style={styles.subsectionTitle}>
            Robustness Assessment
          </div>

          <div style={styles.diagnosticGrid}>

            {robustness.checks.map(
              (check) => (
                <Diagnostic
                  key={check.id}
                  label={check.label}
                  passed={check.passed}
                  detail={check.detail}
                  neutral={check.neutral}
                />
              )
            )}

          </div>


          {/* --------------------------------------------------
             RESEARCH INTERPRETATION
             -------------------------------------------------- */}

          <div style={styles.researchNote}>

            <strong>
              ATLAS research rule
            </strong>

            <p style={styles.researchNoteText}>
              A profitable historical backtest is
              evidence of a possible edge, not proof
              of a tradable strategy. ATLAS must test
              whether that edge survives changes in
              market conditions, unseen data and
              statistical stress before it can advance
              toward live trading.
            </p>

          </div>


          {/* --------------------------------------------------
             NEXT ACTION
             -------------------------------------------------- */}

          <div style={styles.nextAction}>

            <div style={styles.nextActionLabel}>
              NEXT RESEARCH ACTION
            </div>

            <div style={styles.nextActionTitle}>
              {robustness.nextAction}
            </div>

            <div style={styles.nextActionText}>
              {robustness.nextActionMessage}
            </div>

          </div>

        </div>
      )}

    </section>
  );
}


/* ============================================================
   ROBUSTNESS ASSESSMENT
   ============================================================ */

function buildRobustnessAssessment(
  results,
  metrics
) {
  const {
    pf,
    expectancy,
    totalR,
    drawdown,
    trades
  } = metrics;

  const diagnostics =
    results?.diagnostics || {};

  const years =
    diagnostics.years || {};

  const months =
    diagnostics.months || {};

  const directions =
    diagnostics.directions || {};

  const sessions =
    diagnostics.sessions || {};

  const volatility =
    diagnostics.volatility || {};


  /* ----------------------------------------------------------
     SAMPLE QUALITY
     ---------------------------------------------------------- */

  const sampleTrades =
    Number(trades || 0);

  const samplePass =
    sampleTrades >= 100;

  const strongSample =
    sampleTrades >= 300;


  /* ----------------------------------------------------------
     PROFITABILITY
     ---------------------------------------------------------- */

  const pfPass =
    Number.isFinite(pf) &&
    pf > 1;

  const strongPF =
    Number.isFinite(pf) &&
    pf >= 1.30;


  /* ----------------------------------------------------------
     EXPECTANCY
     ---------------------------------------------------------- */

  const expectancyPass =
    Number.isFinite(expectancy) &&
    expectancy > 0;

  const strongExpectancy =
    Number.isFinite(expectancy) &&
    expectancy >= 0.10;


  /* ----------------------------------------------------------
     NET RESULT
     ---------------------------------------------------------- */

  const totalRPass =
    Number.isFinite(totalR) &&
    totalR > 0;


  /* ----------------------------------------------------------
     DRAWDOWN
     ---------------------------------------------------------- */

  const ddPass =
    Number.isFinite(drawdown) &&
    drawdown < 0.25;

  const strongDD =
    Number.isFinite(drawdown) &&
    drawdown < 0.15;


  /* ----------------------------------------------------------
     YEAR CONSISTENCY
     ---------------------------------------------------------- */

  const yearEntries =
    Object.values(years || {});

  const validYears =
    yearEntries.filter(
      (year) =>
        Number.isFinite(
          Number(year?.totalR)
        )
    );

  const positiveYears =
    validYears.filter(
      (year) =>
        Number(year.totalR) > 0
    );

  const yearConsistency =
    validYears.length > 0
      ? positiveYears.length /
        validYears.length
      : null;

  const yearPass =
    yearConsistency != null &&
    yearConsistency >= 0.60;


  /* ----------------------------------------------------------
     MONTH CONSISTENCY
     ---------------------------------------------------------- */

  const monthEntries =
    Object.values(months || {});

  const validMonths =
    monthEntries.filter(
      (month) =>
        Number.isFinite(
          Number(month?.totalR)
        )
    );

  const positiveMonths =
    validMonths.filter(
      (month) =>
        Number(month.totalR) > 0
    );

  const monthConsistency =
    validMonths.length > 0
      ? positiveMonths.length /
        validMonths.length
      : null;


  /* ----------------------------------------------------------
     DIRECTION DIVERSIFICATION
     ---------------------------------------------------------- */

  const directionEntries =
    Object.values(directions || {});

  const profitableDirections =
    directionEntries.filter(
      (direction) =>
        Number(
          direction?.expectancy_R
        ) > 0
    );

  const directionPass =
    directionEntries.length <= 1 ||
    profitableDirections.length >=
      Math.ceil(
        directionEntries.length / 2
      );


  /* ----------------------------------------------------------
     SESSION COVERAGE
     ---------------------------------------------------------- */

  const sessionEntries =
    Object.values(sessions || {});

  const sessionDataAvailable =
    sessionEntries.length > 0;

  const profitableSessions =
    sessionEntries.filter(
      (session) =>
        Number(
          session?.expectancy_R
        ) > 0
    );

  const sessionPass =
    !sessionDataAvailable ||
    profitableSessions.length > 0;


  /* ----------------------------------------------------------
     VOLATILITY COVERAGE
     ---------------------------------------------------------- */

  const volatilityEntries =
    Object.values(volatility || {});

  const volatilityDataAvailable =
    volatilityEntries.length > 0;

  const profitableVolatility =
    volatilityEntries.filter(
      (regime) =>
        Number(
          regime?.expectancy_R
        ) > 0
    );

  const volatilityPass =
    !volatilityDataAvailable ||
    profitableVolatility.length > 0;


  /* ----------------------------------------------------------
     BUILD CHECKS
     ---------------------------------------------------------- */

  const checks = [

    {
      id: "sample",
      label: "Sample Size",
      passed: samplePass,
      detail:
        `${sampleTrades.toLocaleString()} trades`
    },

    {
      id: "profit-factor",
      label: "Profitability Quality",
      passed: pfPass,
      detail:
        Number.isFinite(pf)
          ? `PF ${pf.toFixed(2)}`
          : "Unavailable"
    },

    {
      id: "expectancy",
      label: "Positive Expectancy",
      passed: expectancyPass,
      detail:
        Number.isFinite(expectancy)
          ? `${expectancy.toFixed(3)} R`
          : "Unavailable"
    },

    {
      id: "drawdown",
      label: "Drawdown Control",
      passed: ddPass,
      detail:
        Number.isFinite(drawdown)
          ? `${(
              drawdown * 100
            ).toFixed(2)}%`
          : "Unavailable"
    },

    {
      id: "year-consistency",
      label: "Year Consistency",
      passed: yearPass,
      neutral: validYears.length === 0,
      detail:
        yearConsistency != null
          ? `${(
              yearConsistency * 100
            ).toFixed(1)}% profitable years`
          : "Needs yearly data"
    },

    {
      id: "direction",
      label: "Direction Stability",
      passed: directionPass,
      neutral: directionEntries.length === 0,
      detail:
        directionEntries.length
          ? `${profitableDirections.length}/${directionEntries.length} profitable`
          : "Needs direction data"
    },

    {
      id: "sessions",
      label: "Session Stability",
      passed: sessionPass,
      neutral: !sessionDataAvailable,
      detail:
        sessionDataAvailable
          ? `${profitableSessions.length}/${sessionEntries.length} positive`
          : "Needs session data"
    },

    {
      id: "volatility",
      label: "Volatility Stability",
      passed: volatilityPass,
      neutral: !volatilityDataAvailable,
      detail:
        volatilityDataAvailable
          ? `${profitableVolatility.length}/${volatilityEntries.length} positive`
          : "Needs volatility data"
    }

  ];


  /* ----------------------------------------------------------
     SCORE
     ---------------------------------------------------------- */

  let score = 0;
  let availableChecks = 0;

  if (samplePass) {
    score += 15;
  }
  availableChecks += 15;

  if (pfPass) {
    score += 15;
  }
  availableChecks += 15;

  if (expectancyPass) {
    score += 15;
  }
  availableChecks += 15;

  if (totalRPass) {
    score += 10;
  }
  availableChecks += 10;

  if (ddPass) {
    score += 15;
  }
  availableChecks += 15;

  if (validYears.length > 0) {
    availableChecks += 10;

    if (yearPass) {
      score += 10;
    }
  }

  if (monthConsistency != null) {
    availableChecks += 5;

    if (monthConsistency >= 0.50) {
      score += 5;
    }
  }

  if (strongSample) {
    score += 5;
  }

  if (strongPF) {
    score += 5;
  }

  if (strongExpectancy) {
    score += 5;
  }

  if (strongDD) {
    score += 5;
  }

  /*
   * Normalize because some optional checks
   * may not exist yet.
   */

  const normalizedScore =
    availableChecks > 0
      ? Math.min(
          100,
          Math.round(
            (score / availableChecks) * 100
          )
        )
      : 0;


  /* ----------------------------------------------------------
     RESEARCH STATUS
     ---------------------------------------------------------- */

  let label;
  let color;
  let border;
  let message;
  let nextStage;
  let nextAction;
  let nextActionMessage;

  if (
    !samplePass ||
    !pfPass ||
    !expectancyPass ||
    !totalRPass
  ) {

    label = "EDGE NOT ESTABLISHED";
    color = "#ff9b9b";
    border = "#6b3038";

    message =
      "The historical test has not yet established a sufficiently strong positive edge.";

    nextStage = false;

    nextAction =
      "Improve or reject the strategy";

    nextActionMessage =
      "Do not advance to robustness testing until the core historical metrics are positive.";
  }

  else if (
    normalizedScore >= 75 &&
    strongSample &&
    strongPF &&
    strongExpectancy &&
    strongDD &&
    yearPass
  ) {

    label = "ROBUSTNESS CANDIDATE";
    color = "#a8e6bb";
    border = "#315f42";

    message =
      "The historical evidence is strong enough to justify deeper robustness testing.";

    nextStage = true;

    nextAction =
      "Run robustness testing";

    nextActionMessage =
      "Stress the strategy against unseen periods, parameter changes and statistical uncertainty.";
  }

  else if (
    normalizedScore >= 55
  ) {

    label = "PROMISING — NEEDS VALIDATION";
    color = "#d3d9e5";
    border = "#394052";

    message =
      "The strategy shows evidence of an edge, but the evidence is not yet strong enough to consider it robust.";

    nextStage = true;

    nextAction =
      "Run robustness testing";

    nextActionMessage =
      "The next objective is to determine whether the observed edge survives conditions outside this backtest.";
  }

  else {

    label = "WEAK EDGE";
    color = "#ffcf8a";
    border = "#66502d";

    message =
      "The backtest is positive in some respects, but the evidence remains too fragile for advancement.";

    nextStage = false;

    nextAction =
      "Investigate the edge";

    nextActionMessage =
      "Identify whether performance depends excessively on a particular period, direction, session or market regime.";
  }


  return {
    score: normalizedScore,
    label,
    color,
    border,
    message,
    nextStage,
    nextAction,
    nextActionMessage,
    checks
  };
}


/* ============================================================
   VERDICT STYLE
   ============================================================ */

function getVerdictStyle(verdict) {
  if (verdict === "POSITIVE EDGE") {
    return {
      border: "#315f42",
      color: "#a8e6bb"
    };
  }

  if (verdict === "NO EDGE") {
    return {
      border: "#6b3038",
      color: "#ff9b9b"
    };
  }

  return {
    border: "#394052",
    color: "#d3d9e5"
  };
}


/* ============================================================
   STAGE
   ============================================================ */

function Stage({
  number,
  title,
  status,
  active = false
}) {
  return (
    <div
      style={{
        ...styles.stage,
        opacity:
          status === "LOCKED"
            ? 0.45
            : 1
      }}
    >

      <div
        style={{
          ...styles.stageNumber,
          borderColor:
            active
              ? "#697589"
              : "#293243"
        }}
      >
        {number}
      </div>

      <div style={styles.stageName}>
        {title}
      </div>

      <div
        style={{
          ...styles.stageStatus,
          color:
            active
              ? "#d3d9e5"
              : "#687386"
        }}
      >
        {status}
      </div>

    </div>
  );
}


/* ============================================================
   DIAGNOSTIC CARD
   ============================================================ */

function Diagnostic({
  label,
  passed,
  detail,
  neutral = false
}) {
  const statusColor =
    neutral
      ? "#7f899b"
      : passed
      ? "#a8e6bb"
      : "#ff9b9b";

  const statusText =
    neutral
      ? "N/A"
      : passed
      ? "PASS"
      : "FAIL";

  return (
    <div style={styles.diagnosticCard}>

      <div style={styles.diagnosticTop}>

        <span style={styles.cardLabel}>
          {label}
        </span>

        <span
          style={{
            ...styles.status,
            color: statusColor
          }}
        >
          {statusText}
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

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },

  panelTitle: {
    fontSize: "28px",
    margin: "8px 0"
  },

  description: {
    color: "#8d96a8",
    lineHeight: 1.6,
    maxWidth: "720px",
    marginBottom: "0"
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

  robustnessGate: {
    marginTop: "16px",
    padding: "20px",
    background: "#080b12",
    border: "1px solid",
    borderRadius: "14px"
  },

  gateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },

  gateEyebrow: {
    color: "#687386",
    fontSize: "10px",
    letterSpacing: "1.5px",
    marginBottom: "6px"
  },

  gateTitle: {
    fontSize: "20px",
    fontWeight: "700"
  },

  gateScore: {
    fontSize: "26px",
    fontWeight: "700"
  },

  gateScoreSmall: {
    color: "#687386",
    fontSize: "13px",
    fontWeight: "400"
  },

  gateMessage: {
    marginTop: "10px",
    color: "#8d96a8",
    fontSize: "13px",
    lineHeight: 1.5
  },

  progressTrack: {
    height: "6px",
    background: "#111722",
    borderRadius: "20px",
    overflow: "hidden",
    marginTop: "16px"
  },

  progressBar: {
    height: "100%",
    borderRadius: "20px",
    transition: "width 0.3s ease"
  },

  stageBox: {
    marginTop: "18px",
    padding: "18px",
    background: "#0b1019",
    border: "1px solid #1e2738",
    borderRadius: "14px"
  },

  stageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap"
  },

  stageLabel: {
    color: "#9da8bb",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: "700"
  },

  stageCurrent: {
    color: "#596477",
    fontSize: "10px"
  },

  stageList: {
    display: "grid",
    gap: "7px"
  },

  stage: {
    display: "grid",
    gridTemplateColumns: "38px 1fr auto",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0"
  },

  stageNumber: {
    width: "28px",
    height: "28px",
    border: "1px solid",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9da8bb",
    fontSize: "10px"
  },

  stageName: {
    color: "#aeb7c7",
    fontSize: "12px"
  },

  stageStatus: {
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: "700"
  },

  toggleButton: {
    width: "100%",
    marginTop: "16px",
    padding: "14px 16px",
    background: "#0b1019",
    color: "#aeb7c7",
    border: "1px solid #1e2738",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    cursor: "pointer"
  },

  toggleIcon: {
    fontSize: "20px",
    fontWeight: "400",
    lineHeight: 1
  },

  details: {
    marginTop: "4px"
  },

  subsectionTitle: {
    marginTop: "22px",
    marginBottom: "12px",
    color: "#9da8bb",
    fontSize: "13px",
    fontWeight: "700"
  },

  diagnosticGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px"
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
    fontSize: "14px"
  },

  status: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px"
  },

  diagnosticDetail: {
    color: "#a0a9ba",
    fontSize: "13px",
    lineHeight: 1.5,
    marginTop: "10px"
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
  },

  nextAction: {
    marginTop: "14px",
    padding: "18px",
    borderRadius: "12px",
    background: "#080b12",
    border: "1px solid #1e2738"
  },

  nextActionLabel: {
    color: "#687386",
    fontSize: "10px",
    letterSpacing: "1.5px",
    marginBottom: "7px"
  },

  nextActionTitle: {
    color: "#d3d9e5",
    fontSize: "15px",
    fontWeight: "700"
  },

  nextActionText: {
    marginTop: "6px",
    color: "#7f899b",
    fontSize: "12px",
    lineHeight: 1.5
  }

};