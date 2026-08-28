"use client";

import { useState } from "react";

import {
  calculateDiagnostics,
  getResearchVerdict
} from "../lib/diagnostics";


export default function ResearchDiagnostics({
  results
}) {
  const [expanded, setExpanded] = useState(false);

  /*
   * IMPORTANT:
   * Do not place hooks after the early return.
   * This component only needs useState, so all calculations
   * can safely happen after checking results.
   */

  if (!results) {
    return null;
  }

  const diagnostics =
    calculateDiagnostics(results) || {};

  const {
    pf,
    expectancy,
    totalR,
    drawdown,
    trades,
    checks = {}
  } = diagnostics;

  const researchVerdict =
    getResearchVerdict(results) || {};

  const verdict =
    researchVerdict.verdict ||
    "INSUFFICIENT DATA";

  const verdictMessage =
    researchVerdict.message ||
    "The available historical data is not sufficient to establish a reliable research conclusion.";

  const robustness =
    buildRobustnessAssessment(
      results,
      {
        pf,
        expectancy,
        totalR,
        drawdown,
        trades,
        checks
      }
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
         VALIDATION PIPELINE
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
            active={
              robustness.nextStage
            }
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
        onClick={() =>
          setExpanded(
            (value) => !value
          )
        }
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

          {/* ==================================================
             CORE DIAGNOSTICS
             ================================================== */}

          <div style={styles.subsectionTitle}>
            Core Diagnostic Checks
          </div>


          <div style={styles.diagnosticGrid}>

            <Diagnostic
              label="Profit Factor"
              passed={
                checks.profitability === true
              }
              neutral={
                checks.profitability == null
              }
              detail={
                Number.isFinite(pf)
                  ? `${pf.toFixed(2)} · target > 1.00`
                  : "Unavailable"
              }
            />


            <Diagnostic
              label="Expectancy"
              passed={
                checks.expectancy === true
              }
              neutral={
                checks.expectancy == null
              }
              detail={
                Number.isFinite(expectancy)
                  ? `${expectancy.toFixed(3)} R · target > 0`
                  : "Unavailable"
              }
            />


            <Diagnostic
              label="Net Result"
              passed={
                checks.equity === true
              }
              neutral={
                checks.equity == null
              }
              detail={
                Number.isFinite(totalR)
                  ? `${totalR.toFixed(2)} R · target > 0`
                  : "Unavailable"
              }
            />


            <Diagnostic
              label="Sample Size"
              passed={
                checks.sample === true
              }
              neutral={
                checks.sample == null
              }
              detail={
                `${Number(
                  trades || 0
                ).toLocaleString()} trades · minimum 100`
              }
            />


            <Diagnostic
              label="Drawdown"
              passed={
                checks.drawdown === true
              }
              neutral={
                checks.drawdown == null
              }
              detail={
                Number.isFinite(drawdown)
                  ? `${(
                      drawdown * 100
                    ).toFixed(2)}% · research limit < 25%`
                  : "Unavailable"
              }
            />

          </div>


          {/* ==================================================
             ROBUSTNESS
             ================================================== */}

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


          {/* ==================================================
             RESEARCH INTERPRETATION
             ================================================== */}

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


          {/* ==================================================
             NEXT ACTION
             ================================================== */}

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


  /* ==========================================================
     SAMPLE QUALITY
     ========================================================== */

  const sampleTrades =
    Number(trades || 0);

  const sampleAvailable =
    Number.isFinite(sampleTrades);

  const samplePass =
    sampleAvailable &&
    sampleTrades >= 100;

  const strongSample =
    sampleAvailable &&
    sampleTrades >= 300;


  /* ==========================================================
     PROFIT FACTOR
     ========================================================== */

  const pfAvailable =
    Number.isFinite(pf);

  const pfPass =
    pfAvailable &&
    pf > 1;

  const strongPF =
    pfAvailable &&
    pf >= 1.30;


  /* ==========================================================
     EXPECTANCY
     ========================================================== */

  const expectancyAvailable =
    Number.isFinite(expectancy);

  const expectancyPass =
    expectancyAvailable &&
    expectancy > 0;

  const strongExpectancy =
    expectancyAvailable &&
    expectancy >= 0.10;


  /* ==========================================================
     NET RESULT
     ========================================================== */

  const totalRAvailable =
    Number.isFinite(totalR);

  const totalRPass =
    totalRAvailable &&
    totalR > 0;


  /* ==========================================================
     DRAWDOWN
     ========================================================== */

  const drawdownAvailable =
    Number.isFinite(drawdown);

  const ddPass =
    drawdownAvailable &&
    drawdown < 0.25;

  const strongDD =
    drawdownAvailable &&
    drawdown < 0.15;


  /* ==========================================================
     YEAR CONSISTENCY
     ========================================================== */

  const yearEntries =
    Object.values(years);


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


  /* ==========================================================
     MONTH CONSISTENCY
     ========================================================== */

  const monthEntries =
    Object.values(months);


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


  /* ==========================================================
     DIRECTION STABILITY
     ========================================================== */

  const directionEntries =
    Object.values(directions);


  const profitableDirections =
    directionEntries.filter(
      (direction) =>
        Number(
          direction?.expectancy_R
        ) > 0
    );


  const directionAvailable =
    directionEntries.length > 0;


  const directionPass =
    directionAvailable &&
    (
      directionEntries.length <= 1 ||
      profitableDirections.length >=
        Math.ceil(
          directionEntries.length / 2
        )
    );


  /* ==========================================================
     SESSION STABILITY
     ========================================================== */

  const sessionEntries =
    Object.values(sessions);


  const sessionAvailable =
    sessionEntries.length > 0;


  const profitableSessions =
    sessionEntries.filter(
      (session) =>
        Number(
          session?.expectancy_R
        ) > 0
    );


  const sessionPass =
    sessionAvailable &&
    profitableSessions.length > 0;


  /* ==========================================================
     VOLATILITY STABILITY
     ========================================================== */

  const volatilityEntries =
    Object.values(volatility);


  const volatilityAvailable =
    volatilityEntries.length > 0;


  const profitableVolatility =
    volatilityEntries.filter(
      (regime) =>
        Number(
          regime?.expectancy_R
        ) > 0
    );


  const volatilityPass =
    volatilityAvailable &&
    profitableVolatility.length > 0;


  /* ==========================================================
     CHECKS
     ========================================================== */

  const checks = [

    {
      id: "sample",
      label: "Sample Size",
      passed: samplePass,
      neutral: !sampleAvailable,
      detail:
        sampleAvailable
          ? `${sampleTrades.toLocaleString()} trades`
          : "Unavailable"
    },


    {
      id: "profit-factor",
      label: "Profitability Quality",
      passed: pfPass,
      neutral: !pfAvailable,
      detail:
        pfAvailable
          ? `PF ${pf.toFixed(2)}`
          : "Unavailable"
    },


    {
      id: "expectancy",
      label: "Positive Expectancy",
      passed: expectancyPass,
      neutral: !expectancyAvailable,
      detail:
        expectancyAvailable
          ? `${expectancy.toFixed(3)} R`
          : "Unavailable"
    },


    {
      id: "net-result",
      label: "Positive Net Result",
      passed: totalRPass,
      neutral: !totalRAvailable,
      detail:
        totalRAvailable
          ? `${totalR.toFixed(2)} R`
          : "Unavailable"
    },


    {
      id: "drawdown",
      label: "Drawdown Control",
      passed: ddPass,
      neutral: !drawdownAvailable,
      detail:
        drawdownAvailable
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
      neutral: !directionAvailable,
      detail:
        directionAvailable
          ? `${profitableDirections.length}/${directionEntries.length} profitable`
          : "Needs direction data"
    },


    {
      id: "sessions",
      label: "Session Stability",
      passed: sessionPass,
      neutral: !sessionAvailable,
      detail:
        sessionAvailable
          ? `${profitableSessions.length}/${sessionEntries.length} positive`
          : "Needs session data"
    },


    {
      id: "volatility",
      label: "Volatility Stability",
      passed: volatilityPass,
      neutral: !volatilityAvailable,
      detail:
        volatilityAvailable
          ? `${profitableVolatility.length}/${volatilityEntries.length} positive`
          : "Needs volatility data"
    }

  ];


  /* ==========================================================
     SCORE
     ========================================================== */

  /*
   * Core checks carry most of the score.
   *
   * Optional diagnostics only contribute when the backend
   * actually provides them.
   */

  const weightedChecks = [

    {
      available: sampleAvailable,
      passed: samplePass,
      weight: 15
    },

    {
      available: pfAvailable,
      passed: pfPass,
      weight: 15
    },

    {
      available: expectancyAvailable,
      passed: expectancyPass,
      weight: 15
    },

    {
      available: totalRAvailable,
      passed: totalRPass,
      weight: 10
    },

    {
      available: drawdownAvailable,
      passed: ddPass,
      weight: 15
    },

    {
      available: validYears.length > 0,
      passed: yearPass,
      weight: 10
    },

    {
      available: monthConsistency != null,
      passed:
        monthConsistency != null &&
        monthConsistency >= 0.50,
      weight: 5
    }

  ];


  let availableWeight = 0;
  let earnedWeight = 0;


  weightedChecks.forEach(
    (check) => {

      if (!check.available) {
        return;
      }

      availableWeight +=
        check.weight;

      if (check.passed) {
        earnedWeight +=
          check.weight;
      }

    }
  );


  /*
   * Quality bonuses.
   */

  let bonus = 0;


  if (strongSample) {
    bonus += 5;
  }

  if (strongPF) {
    bonus += 5;
  }

  if (strongExpectancy) {
    bonus += 5;
  }

  if (strongDD) {
    bonus += 5;
  }


  const baseScore =
    availableWeight > 0
      ? (
          earnedWeight /
          availableWeight
        ) * 100
      : 0;


  /*
   * Bonuses are deliberately capped so they cannot
   * compensate for missing core evidence.
   */

  const normalizedScore =
    Math.min(
      100,
      Math.round(
        baseScore +
        bonus
      )
    );


  /* ==========================================================
     RESEARCH STATUS
     ========================================================== */

  let label;
  let color;
  let border;
  let message;
  let nextStage;
  let nextAction;
  let nextActionMessage;


  /*
   * Core evidence must exist before the strategy can
   * become a robustness candidate.
   */

  const coreDataAvailable =
    pfAvailable &&
    expectancyAvailable &&
    totalRAvailable &&
    sampleAvailable &&
    drawdownAvailable;


  const corePositive =
    pfPass &&
    expectancyPass &&
    totalRPass;


  if (
    !coreDataAvailable ||
    !corePositive
  ) {

    label =
      "EDGE NOT ESTABLISHED";

    color =
      "#ff9b9b";

    border =
      "#6b3038";

    message =
      "The historical test does not yet establish a sufficiently strong positive edge.";

    nextStage =
      false;

    nextAction =
      "Improve or reject the strategy";

    nextActionMessage =
      "Do not advance to robustness testing until the core historical metrics provide credible positive evidence.";

  }

  else if (
    normalizedScore >= 75 &&
    strongSample &&
    strongPF &&
    strongExpectancy &&
    strongDD &&
    yearPass
  ) {

    label =
      "ROBUSTNESS CANDIDATE";

    color =
      "#a8e6bb";

    border =
      "#315f42";

    message =
      "The historical evidence is strong enough to justify deeper robustness testing.";

    nextStage =
      true;

    nextAction =
      "Run robustness testing";

    nextActionMessage =
      "Stress the strategy against unseen periods, parameter changes and statistical uncertainty.";

  }

  else if (
    normalizedScore >= 55
  ) {

    label =
      "PROMISING — NEEDS VALIDATION";

    color =
      "#d3d9e5";

    border =
      "#394052";

    message =
      "The strategy shows evidence of an edge, but the evidence is not yet strong enough to consider it robust.";

    nextStage =
      true;

    nextAction =
      "Run robustness testing";

    nextActionMessage =
      "Determine whether the observed edge survives conditions outside this historical backtest.";

  }

  else {

    label =
      "WEAK EDGE";

    color =
      "#ffcf8a";

    border =
      "#66502d";

    message =
      "The backtest contains positive evidence, but the overall evidence remains too fragile for advancement.";

    nextStage =
      false;

    nextAction =
      "Investigate the edge";

    nextActionMessage =
      "Determine whether performance depends excessively on a particular period, direction, session or market regime.";

  }


  return {
    score:
      normalizedScore,

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

function getVerdictStyle(
  verdict
) {

  if (
    verdict ===
    "POSITIVE EDGE"
  ) {

    return {
      border: "#315f42",
      color: "#a8e6bb"
    };

  }


  if (
    verdict ===
    "NO EDGE"
  ) {

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
   VALIDATION STAGE
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
    gridTemplateColumns:
      "38px 1fr auto",
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