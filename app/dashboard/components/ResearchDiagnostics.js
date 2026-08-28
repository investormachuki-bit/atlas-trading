"use client";

import { useMemo, useState } from "react";

import {
  calculateDiagnostics,
  getResearchVerdict
} from "../lib/diagnostics";


/* ============================================================
   RESEARCH DIAGNOSTICS
   ============================================================ */

export default function ResearchDiagnostics({
  results
}) {
  const [expanded, setExpanded] =
    useState(false);


  const diagnosticsResult =
    useMemo(() => {
      if (!results) {
        return null;
      }

      return calculateDiagnostics(results);
    }, [results]);


  const robustness =
    useMemo(() => {
      if (!results || !diagnosticsResult) {
        return null;
      }

      return buildRobustnessAssessment(
        results,
        diagnosticsResult
      );
    }, [
      results,
      diagnosticsResult
    ]);


  const research =
    useMemo(() => {
      return buildResearchAssessment(
        results
      );
    }, [results]);


  if (
    !results ||
    !diagnosticsResult ||
    !robustness
  ) {
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
            ATLAS separates historical backtest
            evidence from research validation.
            Profitability alone does not authorize
            progression toward live trading.
          </p>

        </div>
      </div>


      {/* ======================================================
         HISTORICAL VERDICT
         ====================================================== */}

      <div
        style={{
          ...styles.verdict,
          borderColor:
            verdictStyle.border
        }}
      >

        <div style={styles.verdictLabel}>
          HISTORICAL BACKTEST VERDICT
        </div>

        <div
          style={{
            ...styles.verdictTitle,
            color:
              verdictStyle.color
          }}
        >
          {verdict}
        </div>

        <div style={styles.verdictMessage}>
          {verdictMessage}
        </div>

      </div>


      {/* ======================================================
         RESEARCH ENGINE
         ====================================================== */}

      <ResearchEnginePanel
        research={research}
      />


      {/* ======================================================
         HISTORICAL RESEARCH GATE
         ====================================================== */}

      <div
        style={{
          ...styles.robustnessGate,
          borderColor:
            robustness.border
        }}
      >

        <div style={styles.gateHeader}>

          <div>

            <div style={styles.gateEyebrow}>
              HISTORICAL RESEARCH GATE
            </div>

            <div
              style={{
                ...styles.gateTitle,
                color:
                  robustness.color
              }}
            >
              {robustness.label}
            </div>

          </div>

          <div
            style={{
              ...styles.gateScore,
              color:
                robustness.color
            }}
          >
            {robustness.score}

            <span
              style={
                styles.gateScoreSmall
              }
            >
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
              width:
                `${robustness.score}%`,
              background:
                robustness.color
            }}
          />

        </div>

      </div>


      {/* ======================================================
         VALIDATION PIPELINE
         ====================================================== */}

      <ValidationPipeline
        robustness={robustness}
        research={research}
      />


      {/* ======================================================
         DETAILS TOGGLE
         ====================================================== */}

      <button
        type="button"
        onClick={() =>
          setExpanded(
            current => !current
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
          {expanded
            ? "−"
            : "+"}
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
              passed={
                checks.profitability
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
                checks.expectancy
              }
              detail={
                Number.isFinite(
                  expectancy
                )
                  ? `${expectancy.toFixed(3)} R · target > 0`
                  : "Unavailable"
              }
            />

            <Diagnostic
              label="Net Result"
              passed={
                checks.equity
              }
              detail={
                Number.isFinite(
                  totalR
                )
                  ? `${totalR.toFixed(2)} R · target > 0`
                  : "Unavailable"
              }
            />

            <Diagnostic
              label="Sample Size"
              passed={
                checks.sample
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
                checks.drawdown
              }
              detail={
                Number.isFinite(
                  drawdown
                )
                  ? `${(
                      drawdown * 100
                    ).toFixed(2)}% · research limit < 25%`
                  : "Unavailable"
              }
            />

          </div>


          {/* --------------------------------------------------
             HISTORICAL CONSISTENCY
             -------------------------------------------------- */}

          <div style={styles.subsectionTitle}>
            Historical Consistency
          </div>

          <div style={styles.diagnosticGrid}>

            <HistoricalDiagnostic
              label="Year Consistency"
              value={
                robustness.yearConsistency
              }
              status={
                robustness.yearStatus
              }
              emptyText="Needs yearly data"
              suffix="profitable years"
            />

            <HistoricalDiagnostic
              label="Month Consistency"
              value={
                robustness.monthConsistency
              }
              status={
                robustness.monthStatus
              }
              emptyText="Needs monthly data"
              suffix="profitable months"
            />

            <HistoricalDiagnostic
              label="Direction Stability"
              value={
                robustness.directionRatio
              }
              status={
                robustness.directionStatus
              }
              emptyText="Needs direction data"
              suffix="positive directions"
            />

            <HistoricalDiagnostic
              label="Session Stability"
              value={
                robustness.sessionRatio
              }
              status={
                robustness.sessionStatus
              }
              emptyText="Needs session data"
              suffix="positive sessions"
            />

            <HistoricalDiagnostic
              label="Volatility Stability"
              value={
                robustness.volatilityRatio
              }
              status={
                robustness.volatilityStatus
              }
              emptyText="Needs volatility data"
              suffix="positive regimes"
            />

          </div>


          {/* --------------------------------------------------
             ROBUSTNESS
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
             RESEARCH ENGINE DETAILS
             -------------------------------------------------- */}

          <div style={styles.subsectionTitle}>
            Research Engine
          </div>

          <ResearchDetails
            research={research}
          />


          {/* --------------------------------------------------
             SCORE METHODOLOGY
             -------------------------------------------------- */}

          <div style={styles.scoreMethod}>

            <div style={styles.scoreMethodTitle}>
              Research Score Methodology
            </div>

            <div style={styles.scoreMethodText}>
              ATLAS uses a fixed 100-point
              historical research-readiness
              scale. Missing evidence earns
              zero rather than being removed
              from the denominator. The score
              evaluates sample quality,
              profitability, expectancy,
              net result, drawdown and
              historical stability.
            </div>

          </div>


          {/* --------------------------------------------------
             RESEARCH RULE
             -------------------------------------------------- */}

          <div style={styles.researchNote}>

            <strong>
              ATLAS research rule
            </strong>

            <p style={styles.researchNoteText}>
              A profitable historical backtest
              is evidence of a possible edge,
              not proof of a tradable strategy.
              ATLAS must determine whether the
              edge survives unseen data,
              parameter changes, market regimes
              and statistical uncertainty before
              progression toward live trading.
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
              {research.nextAction ||
                robustness.nextAction}
            </div>

            <div style={styles.nextActionText}>
              {research.nextActionMessage ||
                robustness.nextActionMessage}
            </div>

          </div>

        </div>
      )}

    </section>
  );
}


/* ============================================================
   RESEARCH ENGINE PANEL
   ============================================================ */

function ResearchEnginePanel({
  research
}) {
  const style =
    getResearchEngineStyle(
      research.status
    );

  return (
    <div
      style={{
        ...styles.researchEngine,
        borderColor:
          style.border
      }}
    >

      <div style={styles.researchEngineHeader}>

        <div>

          <div
            style={
              styles.researchEngineEyebrow
            }
          >
            ATLAS RESEARCH ENGINE
          </div>

          <div
            style={{
              ...styles.researchEngineTitle,
              color:
                style.color
            }}
          >
            {research.label}
          </div>

        </div>

        <div
          style={{
            ...styles.researchEngineStatus,
            color:
              style.color
          }}
        >
          {research.status}
        </div>

      </div>

      <div style={styles.researchEngineMessage}>
        {research.message}
      </div>

      {research.hasResearch && (
        <div style={styles.researchSummaryGrid}>

          <ResearchMetric
            label="Research Verdict"
            value={
              research.verdict ||
              "N/A"
            }
          />

          <ResearchMetric
            label="Research Score"
            value={
              research.score != null
                ? `${research.score}/100`
                : "N/A"
            }
          />

          <ResearchMetric
            label="OOS"
            value={
              research.oosAvailable
                ? "AVAILABLE"
                : "N/A"
            }
          />

          <ResearchMetric
            label="Walk-Forward"
            value={
              research.walkForwardAvailable
                ? "AVAILABLE"
                : "LOCKED"
            }
          />

        </div>
      )}

    </div>
  );
}


/* ============================================================
   RESEARCH DETAILS
   ============================================================ */

function ResearchDetails({
  research
}) {
  if (!research.hasResearch) {
    return (
      <div style={styles.emptyResearch}>
        {research.message}
      </div>
    );
  }

  return (
    <div>

      <div style={styles.researchDetailGrid}>

        <ResearchMetric
          label="Status"
          value={
            research.status
          }
        />

        <ResearchMetric
          label="Verdict"
          value={
            research.verdict ||
            "N/A"
          }
        />

        <ResearchMetric
          label="Score"
          value={
            research.score != null
              ? `${research.score}/100`
              : "N/A"
          }
        />

        <ResearchMetric
          label="In-Sample"
          value={
            research.isAvailable
              ? "AVAILABLE"
              : "N/A"
          }
        />

        <ResearchMetric
          label="Out-of-Sample"
          value={
            research.oosAvailable
              ? "AVAILABLE"
              : "N/A"
          }
        />

        <ResearchMetric
          label="Walk-Forward"
          value={
            research.walkForwardAvailable
              ? "AVAILABLE"
              : "LOCKED"
          }
        />

      </div>


      {research.experiments.length > 0 && (
        <div style={styles.experimentBox}>

          <div style={styles.experimentTitle}>
            Research Experiments
          </div>

          <div style={styles.experimentList}>

            {research.experiments.map(
              experiment => (
                <div
                  key={experiment.id}
                  style={
                    styles.experimentRow
                  }
                >

                  <div>

                    <div
                      style={
                        styles.experimentName
                      }
                    >
                      {experiment.name}
                    </div>

                    {experiment.detail && (
                      <div
                        style={
                          styles.experimentDetail
                        }
                      >
                        {experiment.detail}
                      </div>
                    )}

                  </div>

                  <div
                    style={{
                      ...styles.experimentStatus,
                      color:
                        experiment.passed
                          ? "#a8e6bb"
                          : "#ffcf8a"
                    }}
                  >
                    {experiment.passed
                      ? "PASS"
                      : "REVIEW"}
                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}


/* ============================================================
   RESEARCH METRIC
   ============================================================ */

function ResearchMetric({
  label,
  value
}) {
  return (
    <div style={styles.researchMetric}>

      <div style={styles.researchMetricLabel}>
        {label}
      </div>

      <div style={styles.researchMetricValue}>
        {value}
      </div>

    </div>
  );
}


/* ============================================================
   VALIDATION PIPELINE
   ============================================================ */

function ValidationPipeline({
  robustness,
  research
}) {
  const researchReady =
    research.hasResearch;

  const oosReady =
    research.oosAvailable;

  /*
   * IMPORTANT:
   *
   * Walk-forward is NOT considered complete merely
   * because a walk_forward object/property exists.
   *
   * It requires concrete completed fold evidence.
   */
  const walkForwardReady =
    research.walkForwardAvailable;

  return (
    <div style={styles.stageBox}>

      <div style={styles.stageHeader}>

        <span style={styles.stageLabel}>
          VALIDATION PIPELINE
        </span>

        <span style={styles.stageCurrent}>
          HISTORICAL BACKTEST COMPLETE
        </span>

      </div>

      <div style={styles.stageList}>

        <Stage
          number="01"
          title="Historical Backtest"
          status="COMPLETE"
          active
        />

        <Stage
          number="02"
          title="Research Engine"
          status={
            researchReady
              ? "COMPLETE"
              : "PENDING"
          }
          active={
            researchReady
          }
        />

        <Stage
          number="03"
          title="Robustness Testing"
          status={
            researchReady
              ? robustness.nextStage
                ? "NEXT"
                : "REVIEW"
              : "LOCKED"
          }
          active={
            researchReady &&
            robustness.nextStage
          }
        />

        <Stage
          number="04"
          title="Out-of-Sample Testing"
          status={
            oosReady
              ? "AVAILABLE"
              : "LOCKED"
          }
          active={
            oosReady
          }
        />

        <Stage
          number="05"
          title="Walk-Forward Validation"
          status={
            walkForwardReady
              ? "AVAILABLE"
              : "LOCKED"
          }
          active={
            walkForwardReady
          }
        />

        <Stage
          number="06"
          title="Monte Carlo Analysis"
          status="LOCKED"
        />

        <Stage
          number="07"
          title="Paper Trading"
          status="LOCKED"
        />

        <Stage
          number="08"
          title="Controlled Live Test"
          status="LOCKED"
        />

      </div>

    </div>
  );
}


/* ============================================================
   RESEARCH ASSESSMENT
   ============================================================ */

function buildResearchAssessment(
  results
) {
  const research =
    results?.research ||
    null;

  const explicitStatus =
    results?.research_status ||
    null;

  const researchError =
    results?.research_error ||
    null;


  if (!research) {

    if (
      explicitStatus ===
      "FAILED"
    ) {
      return {
        status: "FAILED",

        label:
          "RESEARCH ENGINE FAILED",

        color:
          "#ff9b9b",

        border:
          "#6b3038",

        message:
          researchError ||
          "The historical backtest completed, but the Research Engine did not complete.",

        hasResearch:
          false,

        isAvailable:
          false,

        oosAvailable:
          false,

        walkForwardAvailable:
          false,

        experiments:
          [],

        nextAction:
          "Review Research Engine failure",

        nextActionMessage:
          "The historical backtest remains preserved. Resolve the Research Engine failure before treating the strategy as research validated."
      };
    }


    return {
      status:
        explicitStatus ||
        "NOT RUN",

      label:
        "RESEARCH VALIDATION PENDING",

      color:
        "#ffcf8a",

      border:
        "#66502d",

      message:
        "The historical backtest is available, but no completed Research Engine result is attached yet.",

      hasResearch:
        false,

      isAvailable:
        false,

      oosAvailable:
        false,

      walkForwardAvailable:
        false,

      experiments:
        [],

      nextAction:
        "Run Research Engine",

      nextActionMessage:
        "Pass the completed backtest job to the Research Engine before advancing toward robustness or live validation."
    };
  }


  const verdict =
    firstValue(
      research,
      [
        "verdict",
        "research_verdict",
        "final_verdict"
      ]
    );


  const score =
    firstNumber(
      research,
      [
        "score",
        "research_score",
        "readiness_score"
      ]
    );


  const isAvailable =
    hasAny(
      research,
      [
        "in_sample",
        "is",
        "inSample",
        "in_sample_results"
      ]
    );


  const oosAvailable =
    hasCompletedValidationEvidence(
      research,
      [
        "out_of_sample",
        "oos",
        "outOfSample",
        "out_of_sample_results"
      ]
    );


  /*
   * DO NOT use hasAny() here.
   *
   * A property such as:
   *
   * walk_forward: {}
   *
   * does not mean walk-forward validation has
   * actually happened.
   *
   * The current Supabase database has zero
   * walk_forward_folds, therefore this must
   * evaluate to false.
   */
  const walkForwardAvailable =
    hasCompletedWalkForwardEvidence(
      research
    );


  const experiments =
    extractExperiments(
      research
    );


  const validated =
    isValidatedVerdict(
      verdict
    );


  return {
    status:
      "COMPLETE",

    label:
      validated
        ? "RESEARCH VALIDATED"
        : "RESEARCH COMPLETE",

    color:
      validated
        ? "#a8e6bb"
        : "#d3d9e5",

    border:
      validated
        ? "#315f42"
        : "#394052",

    message:
      buildResearchMessage(
        verdict,
        validated
      ),

    hasResearch:
      true,

    verdict,

    score,

    isAvailable,

    oosAvailable,

    walkForwardAvailable,

    experiments,

    nextAction:
      validated
        ? "Proceed to next validation gate"
        : "Review research evidence",

    nextActionMessage:
      validated
        ? "The Research Engine has produced evidence supporting progression. Continue with the remaining statistical validation gates before paper trading."
        : "Review the Research Engine experiments and validation results before granting progression."
  };
}


/* ============================================================
   COMPLETED VALIDATION EVIDENCE
   ============================================================ */

function hasCompletedValidationEvidence(
  research,
  keys
) {
  if (!research) {
    return false;
  }


  for (
    const key of keys
  ) {
    const value =
      research[key];

    if (
      value == null
    ) {
      continue;
    }


    /*
     * Arrays require at least one
     * concrete validation result.
     */
    if (
      Array.isArray(value)
    ) {
      if (
        value.length > 0
      ) {
        return true;
      }

      continue;
    }


    /*
     * Numeric counts are accepted
     * only when greater than zero.
     */
    if (
      typeof value ===
      "number"
    ) {
      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        return true;
      }

      continue;
    }


    /*
     * Objects need actual evidence.
     */
    if (
      typeof value ===
      "object"
    ) {

      const count =
        firstNumber(
          value,
          [
            "completed_folds",
            "completed",
            "fold_count",
            "folds_count",
            "count",
            "total"
          ]
        );

      if (
        count != null &&
        count > 0
      ) {
        return true;
      }


      const folds =
        value.folds ||
        value.results ||
        value.fold_results;


      if (
        Array.isArray(folds) &&
        folds.length > 0
      ) {
        return true;
      }


      if (
        folds &&
        typeof folds ===
          "object" &&
        Object.keys(folds).length > 0
      ) {
        return true;
      }


      if (
        value.completed ===
          true
      ) {
        return true;
      }


      if (
        String(
          value.status ||
          ""
        ).toLowerCase() ===
          "completed"
      ) {
        return true;
      }
    }
  }


  return false;
}


/* ============================================================
   WALK-FORWARD EVIDENCE
   ============================================================ */

function hasCompletedWalkForwardEvidence(
  research
) {
  if (!research) {
    return false;
  }


  const candidates = [
    research.walk_forward,
    research.walkForward,
    research.walk_forward_results,
    research.walkForwardResults,
    research.walk_forward_validation,
    research.walkForwardValidation
  ];


  for (
    const value of candidates
  ) {

    if (
      value == null
    ) {
      continue;
    }


    /*
     * A list of folds is direct evidence.
     */
    if (
      Array.isArray(value)
    ) {
      if (
        value.length > 0
      ) {
        return true;
      }

      continue;
    }


    /*
     * Numeric fold count.
     */
    if (
      typeof value ===
      "number"
    ) {
      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        return true;
      }

      continue;
    }


    if (
      typeof value !==
      "object"
    ) {
      continue;
    }


    /*
     * Explicit fold counts.
     */
    const foldCount =
      firstNumber(
        value,
        [
          "completed_folds",
          "completedFoldCount",
          "fold_count",
          "foldCount",
          "folds_count",
          "total_folds",
          "totalFolds"
        ]
      );


    if (
      foldCount != null &&
      foldCount > 0
    ) {
      return true;
    }


    /*
     * Actual fold arrays/results.
     */
    const folds =
      value.folds ||
      value.fold_results ||
      value.foldResults ||
      value.results;


    if (
      Array.isArray(folds) &&
      folds.length > 0
    ) {
      return true;
    }


    if (
      folds &&
      typeof folds ===
        "object" &&
      Object.keys(folds).length > 0
    ) {
      return true;
    }


    /*
     * Explicit completion flag.
     */
    if (
      value.completed ===
        true
    ) {
      return true;
    }


    /*
     * Explicit completed status.
     */
    if (
      String(
        value.status ||
        ""
      ).toLowerCase() ===
        "completed"
    ) {
      return true;
    }
  }


  /*
   * No concrete fold evidence.
   *
   * This is intentionally false.
   */
  return false;
}


/* ============================================================
   RESEARCH MESSAGE
   ============================================================ */

function buildResearchMessage(
  verdict,
  validated
) {
  if (validated) {
    return (
      "The Research Engine completed its validation workflow and the recorded research verdict supports progression beyond the initial historical backtest."
    );
  }


  if (
    verdict ===
    "POSITIVE_EDGE_REQUIRES_VALIDATION"
  ) {
    return (
      "The Research Engine found positive evidence, but the strategy still requires additional validation before advancement."
    );
  }


  if (
    verdict ===
    "NO_POSITIVE_EDGE"
  ) {
    return (
      "The Research Engine did not establish a sufficiently reliable positive edge."
    );
  }


  if (
    verdict ===
    "INSUFFICIENT_SAMPLE"
  ) {
    return (
      "The Research Engine considers the available evidence insufficient for a reliable conclusion."
    );
  }


  return (
    "The Research Engine completed. Review its detailed evidence before progression."
  );
}


/* ============================================================
   RESEARCH VERDICT DETECTION
   ============================================================ */

function isValidatedVerdict(
  verdict
) {
  if (!verdict) {
    return false;
  }


  const normalized =
    String(verdict)
      .toUpperCase();


  /*
   * A generic WALK_FORWARD string should NOT
   * automatically validate the strategy.
   *
   * The actual fold evidence is checked separately.
   */
  return normalized.includes(
    "VALIDATED"
  );
}


/* ============================================================
   EXPERIMENT EXTRACTION
   ============================================================ */

function extractExperiments(
  research
) {
  const source =
    research?.experiments ||
    research?.experiment_results ||
    research?.experiments_results ||
    null;


  if (
    Array.isArray(source)
  ) {
    return source.map(
      (
        experiment,
        index
      ) => ({
        id:
          String(
            experiment?.id ||
            experiment?.name ||
            index
          ),

        name:
          experiment?.name ||
          experiment?.label ||
          `Experiment ${index + 1}`,

        passed:
          Boolean(
            experiment?.passed ??
            experiment?.positive ??
            experiment?.profitable ??
            Number(
              experiment?.expectancy_R
            ) > 0
          ),

        detail:
          buildExperimentDetail(
            experiment
          )
      })
    );
  }


  if (
    source &&
    typeof source ===
      "object"
  ) {
    return Object.entries(
      source
    ).map(
      (
        [
          key,
          experiment
        ]
      ) => ({
        id:
          key,

        name:
          experiment?.name ||
          key,

        passed:
          Boolean(
            experiment?.passed ??
            experiment?.positive ??
            experiment?.profitable ??
            Number(
              experiment?.expectancy_R
            ) > 0
          ),

        detail:
          buildExperimentDetail(
            experiment
          )
      })
    );
  }


  return [];
}


/* ============================================================
   EXPERIMENT DETAIL
   ============================================================ */

function buildExperimentDetail(
  experiment
) {
  if (!experiment) {
    return "";
  }


  const parts = [];


  const pf =
    firstNumber(
      experiment,
      [
        "pf",
        "profit_factor",
        "profitFactor"
      ]
    );


  const expectancy =
    firstNumber(
      experiment,
      [
        "expectancy_R",
        "expectancy",
        "expectancy_r"
      ]
    );


  const totalR =
    firstNumber(
      experiment,
      [
        "totalR",
        "total_r",
        "net_R",
        "net_result_R"
      ]
    );


  if (
    pf != null
  ) {
    parts.push(
      `PF ${pf.toFixed(2)}`
    );
  }


  if (
    expectancy != null
  ) {
    parts.push(
      `Expectancy ${expectancy.toFixed(3)} R`
    );
  }


  if (
    totalR != null
  ) {
    parts.push(
      `Net ${totalR.toFixed(2)} R`
    );
  }


  return parts.join(
    " · "
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
    results?.diagnostics ||
    {};


  const years =
    diagnostics.years ||
    {};

  const months =
    diagnostics.months ||
    {};

  const directions =
    diagnostics.directions ||
    {};

  const sessions =
    diagnostics.sessions ||
    {};

  const volatility =
    diagnostics.volatility ||
    {};


  const sampleTrades =
    Number(
      trades || 0
    );


  const finiteNumber =
    value =>
      Number.isFinite(
        Number(value)
      )
        ? Number(value)
        : null;


  /* ----------------------------------------------------------
     SAMPLE
     ---------------------------------------------------------- */

  const samplePass =
    sampleTrades >= 100;

  const sampleStrong =
    sampleTrades >= 300;


  /* ----------------------------------------------------------
     PROFIT FACTOR
     ---------------------------------------------------------- */

  const pfPass =
    Number.isFinite(pf) &&
    pf > 1;

  const pfStrong =
    Number.isFinite(pf) &&
    pf >= 1.30;


  /* ----------------------------------------------------------
     EXPECTANCY
     ---------------------------------------------------------- */

  const expectancyPass =
    Number.isFinite(
      expectancy
    ) &&
    expectancy > 0;

  const expectancyStrong =
    Number.isFinite(
      expectancy
    ) &&
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

  const ddStrong =
    Number.isFinite(drawdown) &&
    drawdown < 0.15;


  /* ----------------------------------------------------------
     YEAR CONSISTENCY
     ---------------------------------------------------------- */

  const yearEntries =
    Object.values(
      years || {}
    );


  const validYears =
    yearEntries.filter(
      year =>
        Number.isFinite(
          Number(
            year?.totalR
          )
        )
    );


  const positiveYears =
    validYears.filter(
      year =>
        Number(
          year.totalR
        ) > 0
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


  /* ----------------------------------------------------------
     MONTH CONSISTENCY
     ---------------------------------------------------------- */

  const monthEntries =
    Object.values(
      months || {}
    );


  const validMonths =
    monthEntries.filter(
      month =>
        Number.isFinite(
          Number(
            month?.totalR
          )
        )
    );


  const positiveMonths =
    validMonths.filter(
      month =>
        Number(
          month.totalR
        ) > 0
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


  /* ----------------------------------------------------------
     DIRECTION
     ---------------------------------------------------------- */

  const directionEntries =
    Object.values(
      directions || {}
    );


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


  /* ----------------------------------------------------------
     SESSION
     ---------------------------------------------------------- */

  const sessionEntries =
    Object.values(
      sessions || {}
    );


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


  /* ----------------------------------------------------------
     VOLATILITY
     ---------------------------------------------------------- */

  const volatilityEntries =
    Object.values(
      volatility || {}
    );


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


  /* ----------------------------------------------------------
     TRADE QUALITY
     ---------------------------------------------------------- */

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
    averageMFE >
      Math.abs(
        averageMAE
      );


  const lossStreakAvailable =
    maxConsecutiveLosses != null;


  const lossStreakPass =
    lossStreakAvailable &&
    maxConsecutiveLosses <= 8;


  /* ----------------------------------------------------------
     SCORE
     ---------------------------------------------------------- */

  let score = 0;


  if (
    sampleStrong
  ) {
    score += 15;
  } else if (
    samplePass
  ) {
    score += 7.5;
  }


  if (
    pfStrong
  ) {
    score += 15;
  } else if (
    pfPass
  ) {
    score += 7.5;
  }


  if (
    expectancyStrong
  ) {
    score += 15;
  } else if (
    expectancyPass
  ) {
    score += 7.5;
  }


  if (
    totalRPass
  ) {
    score += 10;
  }


  if (
    ddStrong
  ) {
    score += 10;
  } else if (
    ddPass
  ) {
    score += 7.5;
  }


  if (
    yearStatus ===
    "PASS"
  ) {
    score += 10;
  } else if (
    yearStatus ===
    "WEAK"
  ) {
    score += 5;
  }


  if (
    monthStatus ===
    "PASS"
  ) {
    score += 5;
  } else if (
    monthStatus ===
    "WEAK"
  ) {
    score += 2.5;
  }


  if (
    directionStatus ===
    "PASS"
  ) {
    score += 5;
  } else if (
    directionStatus ===
    "WEAK"
  ) {
    score += 2.5;
  }


  if (
    sessionStatus ===
    "PASS"
  ) {
    score += 5;
  } else if (
    sessionStatus ===
    "WEAK"
  ) {
    score += 2.5;
  }


  if (
    volatilityStatus ===
    "PASS"
  ) {
    score += 5;
  } else if (
    volatilityStatus ===
    "WEAK"
  ) {
    score += 2.5;
  }


  const normalizedScore =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          score
        )
      )
    );


  /* ----------------------------------------------------------
     CHECKS
     ---------------------------------------------------------- */

  const checks = [

    {
      id: "sample",
      label: "Sample Size",
      passed:
        samplePass,
      status:
        samplePass
          ? "PASS"
          : "FAIL",
      detail:
        `${sampleTrades.toLocaleString()} trades`
    },

    {
      id: "profit-factor",
      label: "Profitability Quality",
      passed:
        pfPass,
      status:
        pfPass
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
      passed:
        expectancyPass,
      status:
        expectancyPass
          ? "PASS"
          : "FAIL",
      detail:
        Number.isFinite(
          expectancy
        )
          ? `${expectancy.toFixed(3)} R`
          : "Unavailable"
    },

    {
      id: "net-result",
      label: "Positive Net Result",
      passed:
        totalRPass,
      status:
        totalRPass
          ? "PASS"
          : "FAIL",
      detail:
        Number.isFinite(
          totalR
        )
          ? `${totalR.toFixed(2)} R`
          : "Unavailable"
    },

    {
      id: "drawdown",
      label: "Drawdown Control",
      passed:
        ddPass,
      status:
        ddPass
          ? "PASS"
          : "FAIL",
      detail:
        Number.isFinite(
          drawdown
        )
          ? `${(
              drawdown * 100
            ).toFixed(2)}%`
          : "Unavailable"
    },

    {
      id: "year-consistency",
      label: "Year Consistency",
      passed:
        yearStatus ===
        "PASS",
      neutral:
        yearStatus ===
        "N/A",
      status:
        yearStatus,
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
      passed:
        monthStatus ===
        "PASS",
      neutral:
        monthStatus ===
        "N/A",
      status:
        monthStatus,
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
      passed:
        directionStatus ===
        "PASS",
      neutral:
        directionStatus ===
        "N/A",
      status:
        directionStatus,
      detail:
        directionEntries.length
          ? `${profitableDirections.length}/${directionEntries.length} profitable`
          : "Needs direction data"
    },

    {
      id: "sessions",
      label: "Session Stability",
      passed:
        sessionStatus ===
        "PASS",
      neutral:
        sessionStatus ===
        "N/A",
      status:
        sessionStatus,
      detail:
        sessionEntries.length
          ? `${profitableSessions.length}/${sessionEntries.length} positive`
          : "Needs session data"
    },

    {
      id: "volatility",
      label: "Volatility Stability",
      passed:
        volatilityStatus ===
        "PASS",
      neutral:
        volatilityStatus ===
        "N/A",
      status:
        volatilityStatus,
      detail:
        volatilityEntries.length
          ? `${profitableVolatility.length}/${volatilityEntries.length} positive`
          : "Needs volatility data"
    },

    {
      id: "mfe-mae",
      label: "MFE / MAE Quality",
      passed:
        mfeMaePass,
      neutral:
        !mfeMaeAvailable,
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
      passed:
        lossStreakPass,
      neutral:
        !lossStreakAvailable,
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


  /* ----------------------------------------------------------
     RESEARCH GATE
     ---------------------------------------------------------- */

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


  if (
    !coreEstablished
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
      "Do not advance until sample size, profitability, expectancy and net result provide credible positive evidence.";

  } else if (
    normalizedScore >= 55 &&
    !robustnessCandidate
  ) {

    label =
      "PROMISING — NEEDS VALIDATION";

    color =
      "#d3d9e5";

    border =
      "#394052";

    message =
      "The strategy shows evidence of an edge, but the historical evidence is not yet sufficiently stable for robustness approval.";

    nextStage =
      false;

    nextAction =
      "Strengthen historical evidence";

    nextActionMessage =
      "Investigate consistency across years, months, sessions, directions and volatility regimes before advancing.";

  } else if (
    robustnessCandidate
  ) {

    label =
      "ROBUSTNESS CANDIDATE";

    color =
      "#a8e6bb";

    border =
      "#315f42";

    message =
      "The historical evidence is strong enough to justify formal robustness testing.";

    nextStage =
      true;

    nextAction =
      "Run robustness testing";

    nextActionMessage =
      "Stress the strategy against parameter changes, market regimes and statistical uncertainty.";

  } else {

    label =
      "WEAK EDGE";

    color =
      "#ffcf8a";

    border =
      "#66502d";

    message =
      "The backtest contains some positive evidence, but the edge remains too fragile for advancement.";

    nextStage =
      false;

    nextAction =
      "Investigate the edge";

    nextActionMessage =
      "Determine whether performance depends excessively on a particular year, session, direction or volatility regime.";
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

    checks,

    yearConsistency,
    yearStatus,

    monthConsistency,
    monthStatus,

    directionRatio,
    directionStatus,

    sessionRatio,
    sessionStatus,

    volatilityRatio,
    volatilityStatus,

    tradeQuality: {
      mfeMaeAvailable,
      mfeMaePass,
      lossStreakAvailable,
      lossStreakPass
    }
  };
}


/* ============================================================
   HISTORICAL DIAGNOSTIC
   ============================================================ */

function HistoricalDiagnostic({
  label,
  value,
  status,
  emptyText,
  suffix
}) {
  let detail;


  if (
    value == null
  ) {
    detail =
      emptyText;
  } else {
    detail =
      `${(
        value * 100
      ).toFixed(1)}% ${suffix}`;
  }


  return (
    <Diagnostic
      label={label}
      passed={
        status ===
        "PASS"
      }
      neutral={
        status ===
        "N/A"
      }
      status={status}
      detail={detail}
    />
  );
}


/* ============================================================
   STABILITY STATUS
   ============================================================ */

function getStabilityStatus(
  ratio,
  thresholds
) {
  if (
    ratio == null
  ) {
    return "N/A";
  }


  if (
    ratio >=
    thresholds.pass
  ) {
    return "PASS";
  }


  if (
    ratio >=
    thresholds.weak
  ) {
    return "WEAK";
  }


  return "FAIL";
}


/* ============================================================
   GENERIC VALUE HELPERS
   ============================================================ */

function firstValue(
  object,
  keys
) {
  if (!object) {
    return null;
  }


  for (
    const key of keys
  ) {
    if (
      object[key] != null
    ) {
      return object[key];
    }
  }


  return null;
}


function firstNumber(
  object,
  keys
) {
  const value =
    firstValue(
      object,
      keys
    );


  if (
    value == null
  ) {
    return null;
  }


  const number =
    Number(value);


  return Number.isFinite(
    number
  )
    ? number
    : null;
}


function hasAny(
  object,
  keys
) {
  if (!object) {
    return false;
  }


  return keys.some(
    key =>
      object[key] != null
  );
}


/* ============================================================
   RESEARCH ENGINE STYLE
   ============================================================ */

function getResearchEngineStyle(
  status
) {
  if (
    status ===
    "COMPLETE"
  ) {
    return {
      color:
        "#a8e6bb",

      border:
        "#315f42"
    };
  }


  if (
    status ===
    "FAILED"
  ) {
    return {
      color:
        "#ff9b9b",

      border:
        "#6b3038"
    };
  }


  return {
    color:
      "#ffcf8a",

    border:
      "#66502d"
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
      border:
        "#315f42",

      color:
        "#a8e6bb"
    };
  }


  if (
    verdict ===
    "NO EDGE"
  ) {
    return {
      border:
        "#6b3038",

      color:
        "#ff9b9b"
    };
  }


  if (
    verdict ===
    "INSUFFICIENT SAMPLE"
  ) {
    return {
      border:
        "#394052",

      color:
        "#d3d9e5"
    };
  }


  return {
    border:
      "#394052",

    color:
      "#d3d9e5"
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
          status ===
          "LOCKED"
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


  if (
    neutral ||
    status ===
      "N/A"
  ) {

    statusText =
      "N/A";

    statusColor =
      "#7f899b";

  } else if (
    status ===
    "WEAK"
  ) {

    statusText =
      "WEAK";

    statusColor =
      "#ffcf8a";

  } else if (
    status ===
    "FAIL"
  ) {

    statusText =
      "FAIL";

    statusColor =
      "#ff9b9b";

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
    <div
      style={
        styles.diagnosticCard
      }
    >

      <div
        style={
          styles.diagnosticTop
        }
      >

        <span
          style={
            styles.cardLabel
          }
        >
          {label}
        </span>

        <span
          style={{
            ...styles.status,
            color:
              statusColor
          }}
        >
          {statusText}
        </span>

      </div>

      <div
        style={
          styles.diagnosticDetail
        }
      >
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
    background:
      "#101520",

    border:
      "1px solid #1e2738",

    borderRadius:
      "18px",

    padding:
      "26px",

    marginTop:
      "28px"
  },


  eyebrow: {
    color:
      "#7f899b",

    fontSize:
      "12px",

    letterSpacing:
      "1.5px",

    marginBottom:
      "8px"
  },


  headerRow: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start"
  },


  panelTitle: {
    fontSize:
      "28px",

    margin:
      "8px 0"
  },


  description: {
    color:
      "#8d96a8",

    lineHeight:
      1.6,

    maxWidth:
      "720px",

    marginBottom:
      "0"
  },


  verdict: {
    marginTop:
      "24px",

    padding:
      "22px",

    background:
      "#080b12",

    border:
      "1px solid",

    borderRadius:
      "14px"
  },


  verdictLabel: {
    color:
      "#7f899b",

    fontSize:
      "11px",

    letterSpacing:
      "1.5px"
  },


  verdictTitle: {
    fontSize:
      "28px",

    fontWeight:
      "700",

    marginTop:
      "8px"
  },


  verdictMessage: {
    color:
      "#8d96a8",

    marginTop:
      "8px",

    lineHeight:
      1.5
  },


  researchEngine: {
    marginTop:
      "16px",

    padding:
      "20px",

    background:
      "#080b12",

    border:
      "1px solid",

    borderRadius:
      "14px"
  },


  researchEngineHeader: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "20px"
  },


  researchEngineEyebrow: {
    color:
      "#687386",

    fontSize:
      "10px",

    letterSpacing:
      "1.5px",

    marginBottom:
      "6px"
  },


  researchEngineTitle: {
    fontSize:
      "20px",

    fontWeight:
      "700"
  },


  researchEngineStatus: {
    fontSize:
      "11px",

    letterSpacing:
      "1px",

    fontWeight:
      "700"
  },


  researchEngineMessage: {
    marginTop:
      "10px",

    color:
      "#8d96a8",

    fontSize:
      "13px",

    lineHeight:
      1.5
  },


  researchSummaryGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",

    gap:
      "10px",

    marginTop:
      "16px"
  },


  researchMetric: {
    background:
      "#0b1019",

    border:
      "1px solid #1e2738",

    borderRadius:
      "10px",

    padding:
      "12px"
  },


  researchMetricLabel: {
    color:
      "#687386",

    fontSize:
      "9px",

    letterSpacing:
      "1px",

    textTransform:
      "uppercase"
  },


  researchMetricValue: {
    color:
      "#d3d9e5",

    fontSize:
      "13px",

    fontWeight:
      "700",

    marginTop:
      "6px",

    wordBreak:
      "break-word"
  },


  robustnessGate: {
    marginTop:
      "16px",

    padding:
      "20px",

    background:
      "#080b12",

    border:
      "1px solid",

    borderRadius:
      "14px"
  },


  gateHeader: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "20px"
  },


  gateEyebrow: {
    color:
      "#687386",

    fontSize:
      "10px",

    letterSpacing:
      "1.5px",

    marginBottom:
      "6px"
  },


  gateTitle: {
    fontSize:
      "20px",

    fontWeight:
      "700"
  },


  gateScore: {
    fontSize:
      "26px",

    fontWeight:
      "700"
  },


  gateScoreSmall: {
    color:
      "#687386",

    fontSize:
      "13px",

    fontWeight:
      "400"
  },


  gateMessage: {
    marginTop:
      "10px",

    color:
      "#8d96a8",

    fontSize:
      "13px",

    lineHeight:
      1.5
  },


  progressTrack: {
    height:
      "6px",

    background:
      "#111722",

    borderRadius:
      "20px",

    overflow:
      "hidden",

    marginTop:
      "16px"
  },


  progressBar: {
    height:
      "100%",

    borderRadius:
      "20px",

    transition:
      "width 0.3s ease"
  },


  stageBox: {
    marginTop:
      "18px",

    padding:
      "18px",

    background:
      "#0b1019",

    border:
      "1px solid #1e2738",

    borderRadius:
      "14px"
  },


  stageHeader: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "12px",

    marginBottom:
      "12px",

    flexWrap:
      "wrap"
  },


  stageLabel: {
    color:
      "#9da8bb",

    fontSize:
      "11px",

    letterSpacing:
      "1px",

    fontWeight:
      "700"
  },


  stageCurrent: {
    color:
      "#596477",

    fontSize:
      "10px"
  },


  stageList: {
    display:
      "grid",

    gap:
      "7px"
  },


  stage: {
    display:
      "grid",

    gridTemplateColumns:
      "38px 1fr auto",

    alignItems:
      "center",

    gap:
      "12px",

    padding:
      "8px 0"
  },


  stageNumber: {
    width:
      "28px",

    height:
      "28px",

    border:
      "1px solid",

    borderRadius:
      "50%",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    color:
      "#9da8bb",

    fontSize:
      "10px"
  },


  stageName: {
    color:
      "#aeb7c7",

    fontSize:
      "12px"
  },


  stageStatus: {
    fontSize:
      "9px",

    letterSpacing:
      "1px",

    fontWeight:
      "700"
  },


  toggleButton: {
    width:
      "100%",

    marginTop:
      "16px",

    padding:
      "14px 16px",

    background:
      "#0b1019",

    color:
      "#aeb7c7",

    border:
      "1px solid #1e2738",

    borderRadius:
      "10px",

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    fontSize:
      "12px",

    fontWeight:
      "700",

    letterSpacing:
      "1px",

    cursor:
      "pointer"
  },


  toggleIcon: {
    fontSize:
      "20px",

    fontWeight:
      "400",

    lineHeight:
      1
  },


  details: {
    marginTop:
      "4px"
  },


  subsectionTitle: {
    marginTop:
      "22px",

    marginBottom:
      "12px",

    color:
      "#9da8bb",

    fontSize:
      "13px",

    fontWeight:
      "700"
  },


  diagnosticGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",

    gap:
      "14px"
  },


  diagnosticCard: {
    background:
      "#080b12",

    border:
      "1px solid #1e2738",

    borderRadius:
      "12px",

    padding:
      "18px"
  },


  diagnosticTop: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "10px"
  },


  cardLabel: {
    color:
      "#7f899b",

    fontSize:
      "14px"
  },


  status: {
    fontSize:
      "11px",

    fontWeight:
      "700",

    letterSpacing:
      "1px",

    whiteSpace:
      "nowrap"
  },


  diagnosticDetail: {
    color:
      "#a0a9ba",

    fontSize:
      "13px",

    lineHeight:
      1.5,

    marginTop:
      "10px"
  },


  researchDetailGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",

    gap:
      "12px"
  },


  emptyResearch: {
    padding:
      "18px",

    background:
      "#080b12",

    border:
      "1px solid #1e2738",

    borderRadius:
      "12px",

    color:
      "#7f899b",

    fontSize:
      "13px",

    lineHeight:
      1.5
  },


  experimentBox: {
    marginTop:
      "14px",

    padding:
      "18px",

    background:
      "#0b1019",

    border:
      "1px solid #1e2738",

    borderRadius:
      "12px"
  },


  experimentTitle: {
    color:
      "#d3d9e5",

    fontSize:
      "13px",

    fontWeight:
      "700",

    marginBottom:
      "10px"
  },


  experimentList: {
    display:
      "grid",

    gap:
      "8px"
  },


  experimentRow: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      "12px",

    padding:
      "10px 0",

    borderBottom:
      "1px solid #1e2738"
  },


  experimentName: {
    color:
      "#aeb7c7",

    fontSize:
      "12px"
  },


  experimentDetail: {
    color:
      "#687386",

    fontSize:
      "11px",

    marginTop:
      "4px"
  },


  experimentStatus: {
    fontSize:
      "9px",

    letterSpacing:
      "1px",

    fontWeight:
      "700"
  },


  scoreMethod: {
    marginTop:
      "22px",

    padding:
      "18px",

    borderRadius:
      "12px",

    background:
      "#0b1019",

    border:
      "1px solid #1e2738"
  },


  scoreMethodTitle: {
    color:
      "#d3d9e5",

    fontSize:
      "13px",

    fontWeight:
      "700"
  },


  scoreMethodText: {
    marginTop:
      "7px",

    color:
      "#7f899b",

    fontSize:
      "12px",

    lineHeight:
      1.5
  },


  researchNote: {
    marginTop:
      "14px",

    padding:
      "18px",

    borderRadius:
      "12px",

    background:
      "#0b1019",

    color:
      "#9da8bb",

    fontSize:
      "13px",

    lineHeight:
      1.5
  },


  researchNoteText: {
    margin:
      "8px 0 0"
  },


  nextAction: {
    marginTop:
      "14px",

    padding:
      "18px",

    borderRadius:
      "12px",

    background:
      "#080b12",

    border:
      "1px solid #1e2738"
  },


  nextActionLabel: {
    color:
      "#687386",

    fontSize:
      "10px",

    letterSpacing:
      "1.5px",

    marginBottom:
      "7px"
  },


  nextActionTitle: {
    color:
      "#d3d9e5",

    fontSize:
      "15px",

    fontWeight:
      "700"
  },


  nextActionText: {
    marginTop:
      "6px",

    color:
      "#7f899b",

    fontSize:
      "12px",

    lineHeight:
      1.5
  }

};
    
    
  