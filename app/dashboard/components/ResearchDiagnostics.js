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

  const diagnosticsResult = useMemo(() => {
    if (!results) {
      return null;
    }

    return calculateDiagnostics(results);
  }, [results]);

  const robustness = useMemo(() => {
    if (!results || !diagnosticsResult) {
      return null;
    }

    return buildRobustnessAssessment(
      results,
      diagnosticsResult
    );
  }, [results, diagnosticsResult]);

  if (!results || !diagnosticsResult || !robustness) {
    return null;
  }

  const {
    pf,
    expectancy,
    totalR,
    drawdown,
    trades,
    checks
  } = diagnosticsResult;

  const {
    verdict,
    message: verdictMessage
  } = getResearchVerdict(results);

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
        onClick={() => setExpanded(
          current => !current
        )}
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
             CORE DIAGNOSTICS
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
             ROBUSTNESS ASSESSMENT
             -------------------------------------------------- */}

          <div style={styles.subsectionTitle}>
            Robustness Assessment
          </div>

          <div style={styles.diagnosticGrid}>

            {robustness.checks.map(
              check => (
                <Diagnostic
                  key={check.id}
                  label={check.label}
                  passed={check.passed}
                  detail={check.detail}
                  neutral={check.neutral}
                  status={check.status}
                />
              )
            )}

          </div>


          {/* --------------------------------------------------
             SCORE METHODOLOGY
             -------------------------------------------------- */}

          <div style={styles.scoreMethod}>

            <div style={styles.scoreMethodTitle}>
              Research Score Methodology
            </div>

            <div style={styles.scoreMethodText}>
              ATLAS uses a fixed 100-point research-readiness
              scale. Missing evidence does not disappear from
              the denominator. A strategy must earn its score
              through profitability, expectancy, sample size,
              risk control and stability across historical
              conditions.
            </div>

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


  /* ==========================================================
     RAW DATA
     ========================================================== */

  const sampleTrades =
    Number(trades || 0);

  const finiteNumber = value =>
    Number.isFinite(Number(value))
      ? Number(value)
      : null;


  /* ==========================================================
     SAMPLE QUALITY
     ========================================================== */

  const samplePass =
    sampleTrades >= 100;

  const sampleStrong =
    sampleTrades >= 300;


  /* ==========================================================
     PROFIT FACTOR
     ========================================================== */

  const pfPass =
    Number.isFinite(pf) &&
    pf > 1;

  const pfStrong =
    Number.isFinite(pf) &&
    pf >= 1.30;


  /* ==========================================================
     EXPECTANCY
     ========================================================== */

  const expectancyPass =
    Number.isFinite(expectancy) &&
    expectancy > 0;

  const expectancyStrong =
    Number.isFinite(expectancy) &&
    expectancy >= 0.10;


  /* ==========================================================
     NET RESULT
     ========================================================== */

  const totalRPass =
    Number.isFinite(totalR) &&
    totalR > 0;


  /* ==========================================================
     DRAWDOWN
     ========================================================== */

  const ddPass =
    Number.isFinite(drawdown) &&
    drawdown < 0.25;

  const ddStrong =
    Number.isFinite(drawdown) &&
    drawdown < 0.15;


  /* ==========================================================
     YEAR CONSISTENCY
     ========================================================== */

  const yearEntries =
    Object.values(years || {});

  const validYears =
    yearEntries.filter(
      year =>
        Number.isFinite(
          Number(year?.totalR)
        )
    );

  const positiveYears =
    validYears.filter(
      year =>
        Number(year.totalR) > 0
    );

  const yearConsistency =
    validYears.length
      ? positiveYears.length /
        validYears.length
      : null;

  const yearStatus =
    getStabilityStatus(
      yearConsistency,
      {
        pass: 0.60,
        weak: 0.40
      }
    );


  /* ==========================================================
     MONTH CONSISTENCY
     ========================================================== */

  const monthEntries =
    Object.values(months || {});

  const validMonths =
    monthEntries.filter(
      month =>
        Number.isFinite(
          Number(month?.totalR)
        )
    );

  const positiveMonths =
    validMonths.filter(
      month =>
        Number(month.totalR) > 0
    );

  const monthConsistency =
    validMonths.length
      ? positiveMonths.length /
        validMonths.length
      : null;

  const monthStatus =
    getStabilityStatus(
      monthConsistency,
      {
        pass: 0.60,
        weak: 0.50
      }
    );


  /* ==========================================================
     DIRECTION STABILITY
     ========================================================== */

  const directionEntries =
    Object.values(directions || {});

  const profitableDirections =
    directionEntries.filter(
      direction =>
        Number(
          direction?.expectancy_R
        ) > 0
    );

  const directionRatio =
    directionEntries.length
      ? profitableDirections.length /
        directionEntries.length
      : null;

  const directionStatus =
    getStabilityStatus(
      directionRatio,
      {
        pass: 1.00,
        weak: 0.50
      }
    );


  /* ==========================================================
     SESSION STABILITY
     ========================================================== */

  const sessionEntries =
    Object.values(sessions || {});

  const profitableSessions =
    sessionEntries.filter(
      session =>
        Number(
          session?.expectancy_R
        ) > 0
    );

  const sessionRatio =
    sessionEntries.length
      ? profitableSessions.length /
        sessionEntries.length
      : null;

  const sessionStatus =
    getStabilityStatus(
      sessionRatio,
      {
        pass: 0.75,
        weak: 0.50
      }
    );


  /* ==========================================================
     VOLATILITY STABILITY
     ========================================================== */

  const volatilityEntries =
    Object.values(volatility || {});

  const profitableVolatility =
    volatilityEntries.filter(
      regime =>
        Number(
          regime?.expectancy_R
        ) > 0
    );

  const volatilityRatio =
    volatilityEntries.length
      ? profitableVolatility.length /
        volatilityEntries.length
      : null;

  const volatilityStatus =
    getStabilityStatus(
      volatilityRatio,
      {
        pass: 0.75,
        weak: 0.50
      }
    );


  /* ==========================================================
     TRADE BEHAVIOUR QUALITY
     ========================================================== */

  const averageMFE =
    finiteNumber(
      diagnostics.average_MFE_R
    );

  const averageMAE =
    finiteNumber(
      diagnostics.average_MAE_R
    );

  const maxConsecutiveLosses =
    finiteNumber(
      diagnostics.max_consecutive_losses
    );

  const mfeMaeAvailable =
    averageMFE != null &&
    averageMAE != null;

  const mfeMaePass =
    mfeMaeAvailable &&
    averageMFE > Math.abs(averageMAE);

  const lossStreakAvailable =
    maxConsecutiveLosses != null;

  const lossStreakPass =
    lossStreakAvailable &&
    maxConsecutiveLosses <= 8;


  /* ==========================================================
     FIXED 100-POINT SCORE
     ==========================================================

     IMPORTANT:

     Missing evidence earns ZERO.

     We do not divide by only the available checks.

     This prevents incomplete research from appearing
     stronger than it actually is.
  */

  let score = 0;


  /* 15 — SAMPLE SIZE */

  if (sampleStrong) {
    score += 15;
  } else if (samplePass) {
    score += 7.5;
  }


  /* 15 — PROFIT FACTOR */

  if (pfStrong) {
    score += 15;
  } else if (pfPass) {
    score += 7.5;
  }


  /* 15 — EXPECTANCY */

  if (expectancyStrong) {
    score += 15;
  } else if (expectancyPass) {
    score += 7.5;
  }


  /* 10 — NET RESULT */

  if (totalRPass) {
    score += 10;
  }


  /* 10 — DRAWDOWN */

  if (ddStrong) {
    score += 10;
  } else if (ddPass) {
    score += 7.5;
  }


  /* 10 — YEAR CONSISTENCY */

  if (yearStatus === "PASS") {
    score += 10;
  } else if (yearStatus === "WEAK") {
    score += 5;
  }


  /* 5 — MONTH CONSISTENCY */

  if (monthStatus === "PASS") {
    score += 5;
  } else if (monthStatus === "WEAK") {
    score += 2.5;
  }


  /* 5 — DIRECTION STABILITY */

  if (directionStatus === "PASS") {
    score += 5;
  } else if (directionStatus === "WEAK") {
    score += 2.5;
  }


  /* 5 — SESSION STABILITY */

  if (sessionStatus === "PASS") {
    score += 5;
  } else if (sessionStatus === "WEAK") {
    score += 2.5;
  }


  /* 5 — VOLATILITY STABILITY */

  if (volatilityStatus === "PASS") {
    score += 5;
  } else if (volatilityStatus === "WEAK") {
    score += 2.5;
  }


  /* ==========================================================
     TRADE QUALITY OVERLAY
     ==========================================================

     These metrics are displayed as diagnostic evidence,
     but are not added to the core 100-point scale yet.
     This keeps the score mathematically stable.
  */

  const tradeQuality = {
    mfeMaeAvailable,
    mfeMaePass,
    lossStreakAvailable,
    lossStreakPass
  };


  const normalizedScore =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );


  /* ==========================================================
     ROBUSTNESS CHECKS
     ========================================================== */

  const checks = [

    {
      id: "sample",
      label: "Sample Size",
      passed: samplePass,
      status: samplePass
        ? "PASS"
        : "FAIL",
      detail:
        `${sampleTrades.toLocaleString()} trades`
    },

    {
      id: "profit-factor",
      label: "Profitability Quality",
      passed: pfPass,
      status: pfPass
        ? "PASS"
        : "FAIL",
      detail:
        Number.isFinite(pf)
          ? `PF ${pf.toFixed(2)}`
          : "Unavailable"
    },

    {
      id: "expectancy",
      label: "Positive Expectancy",
      passed: expectancyPass,
      status: expectancyPass
        ? "PASS"
        : "FAIL",
      detail:
        Number.isFinite(expectancy)
          ? `${expectancy.toFixed(3)} R`
          : "Unavailable"
    },

    {
      id: "net-result",
      label: "Positive Net Result",
      passed: totalRPass,
      status: totalRPass
        ? "PASS"
        : "FAIL",
      detail:
        Number.isFinite(totalR)
          ? `${totalR.toFixed(2)} R`
          : "Unavailable"
    },

    {
      id: "drawdown",
      label: "Drawdown Control",
      passed: ddPass,
      status: ddPass
        ? "PASS"
        : "FAIL",
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
      passed: yearStatus === "PASS",
      neutral: yearStatus === "N/A",
      status: yearStatus,
      detail:
        yearConsistency != null
          ? `${(
              yearConsistency * 100
            ).toFixed(1)}% profitable years`
          : "Needs yearly data"
    },

    {
      id: "month-consistency",
      label: "Month Consistency",
      passed: monthStatus === "PASS",
      neutral: monthStatus === "N/A",
      status: monthStatus,
      detail:
        monthConsistency != null
          ? `${(
              monthConsistency * 100
            ).toFixed(1)}% profitable months`
          : "Needs monthly data"
    },

    {
      id: "direction",
      label: "Direction Stability",
      passed: directionStatus === "PASS",
      neutral: directionStatus === "N/A",
      status: directionStatus,
      detail:
        directionEntries.length
          ? `${profitableDirections.length}/${directionEntries.length} profitable`
          : "Needs direction data"
    },

    {
      id: "sessions",
      label: "Session Stability",
      passed: sessionStatus === "PASS",
      neutral: sessionStatus === "N/A",
      status: sessionStatus,
      detail:
        sessionEntries.length
          ? `${profitableSessions.length}/${sessionEntries.length} positive`
          : "Needs session data"
    },

    {
      id: "volatility",
      label: "Volatility Stability",
      passed: volatilityStatus === "PASS",
      neutral: volatilityStatus === "N/A",
      status: volatilityStatus,
      detail:
        volatilityEntries.length
          ? `${profitableVolatility.length}/${volatilityEntries.length} positive`
          : "Needs volatility data"
    },

    {
      id: "mfe-mae",
      label: "MFE / MAE Quality",
      passed: mfeMaePass,
      neutral: !mfeMaeAvailable,
      status:
        !mfeMaeAvailable
          ? "N/A"
          : mfeMaePass
          ? "PASS"
          : "FAIL",
      detail:
        mfeMaeAvailable
          ? `MFE ${averageMFE.toFixed(3)} R · MAE ${averageMAE.toFixed(3)} R`
          : "Needs MFE/MAE data"
    },

    {
      id: "loss-streak",
      label: "Loss Streak Control",
      passed: lossStreakPass,
      neutral: !lossStreakAvailable,
      status:
        !lossStreakAvailable
          ? "N/A"
          : lossStreakPass
          ? "PASS"
          : "FAIL",
      detail:
        lossStreakAvailable
          ? `Maximum ${maxConsecutiveLosses.toFixed(0)} consecutive losses`
          : "Needs loss-streak data"
    }

  ];


  /* ==========================================================
     RESEARCH GATE
     ========================================================== */

  const coreEstablished =
    samplePass &&
    pfPass &&
    expectancyPass &&
    totalRPass;

  const strongCore =
    sampleStrong &&
    pfStrong &&
    expectancyStrong &&
    totalRPass &&
    ddStrong;

  const stabilityEstablished =
    yearStatus !== "FAIL" &&
    directionStatus !== "FAIL" &&
    sessionStatus !== "FAIL" &&
    volatilityStatus !== "FAIL";

  const robustnessCandidate =
    normalizedScore >= 75 &&
    strongCore &&
    yearStatus === "PASS" &&
    stabilityEstablished;


  let label;
  let color;
  let border;
  let message;
  let nextStage;
  let nextAction;
  let nextActionMessage;


  /* ----------------------------------------------------------
     EDGE NOT ESTABLISHED
     ---------------------------------------------------------- */

  if (!coreEstablished) {

    label = "EDGE NOT ESTABLISHED";
    color = "#ff9b9b";
    border = "#6b3038";

    message =
      "The historical test does not yet establish a sufficiently strong positive edge.";

    nextStage = false;

    nextAction =
      "Improve or reject the strategy";

    nextActionMessage =
      "Do not advance to robustness testing until sample size, profitability, expectancy and net result provide credible positive evidence.";
  }


  /* ----------------------------------------------------------
     CORE EDGE EXISTS BUT STABILITY IS WEAK
     ---------------------------------------------------------- */

  else if (
    normalizedScore >= 55 &&
    !robustnessCandidate
  ) {

    label = "PROMISING — NEEDS VALIDATION";
    color = "#d3d9e5";
    border = "#394052";

    message =
      "The strategy shows evidence of an edge, but the historical evidence is not yet sufficiently stable for robustness approval.";

    nextStage = false;

    nextAction =
      "Strengthen historical evidence";

    nextActionMessage =
      "Increase the sample and investigate consistency across years, months, sessions, directions and volatility regimes before advancing.";
  }


  /* ----------------------------------------------------------
     ROBUSTNESS CANDIDATE
     ---------------------------------------------------------- */

  else if (robustnessCandidate) {

    label = "ROBUSTNESS CANDIDATE";
    color = "#a8e6bb";
    border = "#315f42";

    message =
      "The historical evidence is strong enough to justify formal robustness testing.";

    nextStage = true;

    nextAction =
      "Run robustness testing";

    nextActionMessage =
      "Stress the strategy against parameter changes, market regimes and statistical uncertainty.";
  }


  /* ----------------------------------------------------------
     WEAK EDGE
     ---------------------------------------------------------- */

  else {

    label = "WEAK EDGE";
    color = "#ffcf8a";
    border = "#66502d";

    message =
      "The backtest contains some positive evidence, but the edge remains too fragile for advancement.";

    nextStage = false;

    nextAction =
      "Investigate the edge";

    nextActionMessage =
      "Determine whether performance depends excessively on a particular year, session, direction or volatility regime.";
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
    checks,
    tradeQuality
  };
}


/* ============================================================
   STABILITY STATUS
   ============================================================ */

function getStabilityStatus(
  ratio,
  thresholds
) {
  if (ratio == null) {
    return "N/A";
  }

  if (ratio >= thresholds.pass) {
    return "PASS";
  }

  if (ratio >= thresholds.weak) {
    return "WEAK";
  }

  return "FAIL";
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

  if (verdict === "INSUFFICIENT SAMPLE") {
    return {
      border: "#394052",
      color: "#d3d9e5"
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
  neutral = false,
  status
}) {

  let statusText;
  let statusColor;

  if (neutral || status === "N/A") {

    statusText = "N/A";
    statusColor = "#7f899b";

  } else if (status === "WEAK") {

    statusText = "WEAK";
    statusColor = "#ffcf8a";

  } else if (status === "FAIL") {

    statusText = "FAIL";
    statusColor = "#ff9b9b";

  } else {

    statusText =
      passed
        ? "PASS"
        : "FAIL";

    statusColor =
      passed
        ? "#a8e6bb"
        : "#ff9b9b";
  }

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
    alignItems: "center",
    gap: "10px"
  },

  cardLabel: {
    color: "#7f899b",
    fontSize: "14px"
  },

  status: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    whiteSpace: "nowrap"
  },

  diagnosticDetail: {
    color: "#a0a9ba",
    fontSize: "13px",
    lineHeight: 1.5,
    marginTop: "10px"
  },

  scoreMethod: {
    marginTop: "22px",
    padding: "18px",
    borderRadius: "12px",
    background: "#0b1019",
    border: "1px solid #1e2738"
  },

  scoreMethodTitle: {
    color: "#d3d9e5",
    fontSize: "13px",
    fontWeight: "700"
  },

  scoreMethodText: {
    marginTop: "7px",
    color: "#7f899b",
    fontSize: "12px",
    lineHeight: 1.5
  },

  researchNote: {
    marginTop: "14px",
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