"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";


/* ============================================================
   ATLAS — STRATEGY DISCOVERY
   ============================================================ */

export default function StrategyDiscovery() {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [running, setRunning] =
    useState(false);

  const [error, setError] =
    useState("");

  const [data, setData] =
    useState(null);


  /* ============================================================
     AUTHENTICATION
     ============================================================ */

  useEffect(() => {

    let mounted = true;

    async function loadUser() {

      try {

        const {
          data: { user },
          error
        } =
          await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          window.location.href = "/login";
          return;
        }

        if (mounted) {
          setUser(user);
          setLoading(false);
        }

      } catch (err) {

        console.error(
          "ATLAS discovery authentication error:",
          err
        );

        if (mounted) {
          setLoading(false);
          window.location.href = "/login";
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };

  }, []);


  /* ============================================================
     RUN STRATEGY DISCOVERY
     ============================================================ */

  async function runDiscovery() {

    if (running) {
      return;
    }

    setRunning(true);
    setError("");
    setData(null);

    try {

      const {
        data: { session },
        error: sessionError
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        window.location.href = "/login";
        return;
      }


      /* --------------------------------------------------------
         CALL ATLAS STRATEGY DISCOVERY ENGINE
         -------------------------------------------------------- */

      const response =
        await supabase.functions.invoke(
          "strategy-discovery",
          {
            body: {
              market_id:
                "ee6cf0c3-1a03-48a9-9d76-7aa36ad62657",

              timeframe:
                "M5"
            }
          }
        );


      if (response.error) {
        throw response.error;
      }


      if (!response.data) {
        throw new Error(
          "Strategy Discovery Engine returned no data."
        );
      }


      if (response.data.error) {
        throw new Error(
          response.data.error
        );
      }


      setData(
        response.data
      );

    } catch (err) {

      console.error(
        "ATLAS strategy discovery error:",
        err
      );

      setError(
        err?.message ||
        "Unable to run strategy discovery."
      );

    } finally {

      setRunning(false);
    }
  }


  /* ============================================================
     LOGOUT
     ============================================================ */

  async function handleLogout() {

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(
        "ATLAS logout error:",
        err
      );
    } finally {
      window.location.href = "/login";
    }
  }


  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {

    return (
      <main style={styles.loading}>
        Loading ATLAS...
      </main>
    );
  }


  /* ============================================================
     DISCOVERY RESULT
     ============================================================ */

  const result =
    data?.result || null;

  const candidates =
    result?.ranked_candidates || [];


  const recommended =
    result?.recommended_next_step ||
    null;


  /* ============================================================
     PAGE
     ============================================================ */

  return (

    <main style={styles.page}>

      <div style={styles.container}>

        {/* ======================================================
           HEADER
           ====================================================== */}

        <header style={styles.header}>

          <div>

            <div style={styles.eyebrow}>
              ATLAS RESEARCH
            </div>

            <h1 style={styles.title}>
              Strategy Discovery
            </h1>

            <p style={styles.subtitle}>
              Discover which trading hypotheses deserve
              deeper validation.
            </p>

          </div>


          <div style={styles.headerActions}>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
              style={styles.secondaryButton}
            >
              DASHBOARD
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={styles.secondaryButton}
            >
              LOGOUT
            </button>

          </div>

        </header>


        {/* ======================================================
           METHODOLOGY
           ====================================================== */}

        <section style={styles.methodCard}>

          <div style={styles.sectionEyebrow}>
            DISCOVERY METHODOLOGY
          </div>

          <h2 style={styles.sectionTitle}>
            Search before selection.
          </h2>

          <p style={styles.bodyText}>
            ATLAS screens multiple strategy hypotheses
            against the complete historical dataset.
            Candidates are ranked using training evidence
            and then evaluated against a chronological
            validation holdout.
          </p>


          <div style={styles.methodGrid}>

            <Method
              number="01"
              title="Full History"
              text="Uses the available XAUUSD M5 historical dataset."
            />

            <Method
              number="02"
              title="Chronological Split"
              text="70% training data and 30% unseen validation data."
            />

            <Method
              number="03"
              title="Fixed Risk"
              text="Every candidate is compared using 1% risk and a 2R target."
            />

            <Method
              number="04"
              title="No Random Shuffle"
              text="Time order is preserved to prevent look-ahead contamination."
            />

          </div>

        </section>


        {/* ======================================================
           RUN ENGINE
           ====================================================== */}

        <section style={styles.runCard}>

          <div>

            <div style={styles.sectionEyebrow}>
              ATLAS DISCOVERY ENGINE
            </div>

            <h2 style={styles.runTitle}>
              Find the strongest hypothesis
            </h2>

            <p style={styles.bodyText}>
              Five independent strategy hypotheses will
              be screened and ranked.
            </p>

          </div>


          <button
            type="button"
            disabled={running}
            onClick={runDiscovery}
            style={{
              ...styles.runButton,
              ...(running
                ? styles.runButtonDisabled
                : {})
            }}
          >

            {running
              ? "DISCOVERING..."
              : "RUN STRATEGY DISCOVERY"}

          </button>


          {running && (

            <div style={styles.progressBox}>

              <div style={styles.progressText}>
                ATLAS is screening strategy hypotheses...
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={styles.progressBar}
                />
              </div>

            </div>

          )}


          {error && (

            <div style={styles.errorBox}>

              <div style={styles.errorTitle}>
                DISCOVERY FAILED
              </div>

              <div style={styles.errorText}>
                {error}
              </div>

            </div>

          )}

        </section>


        {/* ======================================================
           DATASET
           ====================================================== */}

        {result && (

          <section style={styles.datasetCard}>

            <div style={styles.sectionEyebrow}>
              DATASET
            </div>

            <div style={styles.datasetGrid}>

              <Metric
                label="MARKET"
                value="XAUUSD"
              />

              <Metric
                label="TIMEFRAME"
                value={
                  result.timeframe ||
                  "M5"
                }
              />

              <Metric
                label="CANDLES"
                value={
                  Number(
                    result.total_candles || 0
                  ).toLocaleString()
                }
              />

              <Metric
                label="ENGINE"
                value="1.0.0"
              />

            </div>


            <div style={styles.dateRow}>

              <span>
                DATA START
              </span>

              <strong>
                {formatDate(
                  result.data_start
                )}
              </strong>

              <span>
                DATA END
              </span>

              <strong>
                {formatDate(
                  result.data_end
                )}
              </strong>

            </div>

          </section>

        )}


        {/* ======================================================
           RECOMMENDED NEXT STEP
           ====================================================== */}

        {result && (

          <section
            style={
              recommended
                ? styles.recommendedCard
                : styles.noRecommendationCard
            }
          >

            <div style={styles.sectionEyebrow}>
              DISCOVERY DECISION
            </div>

            {recommended ? (

              <>

                <div style={styles.recommendedLabel}>
                  CANDIDATE FOR DEEPER VALIDATION
                </div>

                <h2 style={styles.recommendedTitle}>
                  {recommended}
                </h2>

                <p style={styles.bodyText}>
                  This candidate currently has sufficient
                  discovery evidence to justify the next
                  research stage. It is not yet authorized
                  for live trading.
                </p>

              </>

            ) : (

              <>

                <div style={styles.noRecommendationTitle}>
                  NO CANDIDATE READY
                </div>

                <p style={styles.bodyText}>
                  None of the screened hypotheses currently
                  satisfies the minimum discovery conditions.
                  ATLAS should continue research rather than
                  force a strategy selection.
                </p>

              </>

            )}

          </section>

        )}


        {/* ======================================================
           RANKED CANDIDATES
           ====================================================== */}

        {result && (

          <section>

            <div style={styles.sectionHeadingRow}>

              <div>

                <div style={styles.sectionEyebrow}>
                  RESEARCH RESULTS
                </div>

                <h2 style={styles.sectionTitle}>
                  Ranked Strategy Candidates
                </h2>

              </div>

              <div style={styles.resultCount}>
                {candidates.length} CANDIDATES
              </div>

            </div>


            <div style={styles.candidateList}>

              {candidates.map(
                (candidate, index) => (

                  <CandidateCard
                    key={
                      candidate.name ||
                      index
                    }
                    candidate={candidate}
                    rank={index + 1}
                  />

                )
              )}

            </div>

          </section>

        )}


        {/* ======================================================
           EMPTY STATE
           ====================================================== */}

        {!result &&
          !running &&
          !error && (

            <section style={styles.emptyCard}>

              <div style={styles.emptyNumber}>
                01
              </div>

              <div>

                <div style={styles.sectionEyebrow}>
                  READY
                </div>

                <h2 style={styles.emptyTitle}>
                  Strategy Discovery has not run yet.
                </h2>

                <p style={styles.bodyText}>
                  Run the engine to compare the five
                  strategy hypotheses against the historical
                  dataset.
                </p>

              </div>

            </section>

          )}


        {/* ======================================================
           RESEARCH WARNING
           ====================================================== */}

        <section style={styles.warningCard}>

          <div style={styles.sectionEyebrow}>
            RESEARCH CONTROL
          </div>

          <h2 style={styles.warningTitle}>
            Discovery is not deployment.
          </h2>

          <p style={styles.bodyText}>
            A strong discovery result only identifies a
            candidate for deeper research. ATLAS must still
            pass robustness testing, out-of-sample testing,
            Monte Carlo analysis, paper trading and controlled
            live validation before any progression toward
            live trading.
          </p>

        </section>


        {/* ======================================================
           ACCOUNT
           ====================================================== */}

        <div style={styles.account}>

          SIGNED IN AS {user?.email}

        </div>

      </div>

    </main>
  );
}


/* ============================================================
   METHOD COMPONENT
   ============================================================ */

function Method({
  number,
  title,
  text
}) {

  return (

    <div style={styles.methodItem}>

      <div style={styles.methodNumber}>
        {number}
      </div>

      <div>

        <div style={styles.methodTitle}>
          {title}
        </div>

        <div style={styles.methodText}>
          {text}
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   METRIC COMPONENT
   ============================================================ */

function Metric({
  label,
  value
}) {

  return (

    <div style={styles.metric}>

      <div style={styles.metricLabel}>
        {label}
      </div>

      <div style={styles.metricValue}>
        {value}
      </div>

    </div>
  );
}


/* ============================================================
   CANDIDATE CARD
   ============================================================ */

function CandidateCard({
  candidate,
  rank
}) {

  const train =
    candidate.train || {};

  const test =
    candidate.test || {};

  const all =
    candidate.all || {};


  const validationPass =
    candidate.validation_pass === true;


  const sampleStatus =
    candidate.sample_status ||
    "UNKNOWN";


  return (

    <article
      style={{
        ...styles.candidateCard,

        ...(rank === 1
          ? styles.topCandidate
          : {})
      }}
    >

      <div style={styles.rankBox}>
        {String(rank).padStart(2, "0")}
      </div>


      <div style={styles.candidateMain}>

        <div style={styles.candidateHeader}>

          <div>

            <div style={styles.candidateEyebrow}>
              STRATEGY CANDIDATE
            </div>

            <h3 style={styles.candidateTitle}>
              {candidate.name}
            </h3>

          </div>


          <div
            style={{
              ...styles.statusBadge,

              ...(validationPass
                ? styles.statusPass
                : styles.statusReview)
            }}
          >

            {validationPass
              ? "VALIDATION PASS"
              : "REVIEW"}

          </div>

        </div>


        {/* SCORE */}

        <div style={styles.scoreRow}>

          <div>

            <div style={styles.scoreLabel}>
              DISCOVERY SCORE
            </div>

            <div style={styles.scoreValue}>
              {Number(
                candidate.discovery_score || 0
              )}
              <span style={styles.scoreMax}>
                /100
              </span>
            </div>

          </div>


          <div style={styles.sampleBox}>

            <div style={styles.scoreLabel}>
              SAMPLE
            </div>

            <div style={styles.sampleValue}>
              {sampleStatus}
            </div>

          </div>

        </div>


        {/* METRICS */}

        <div style={styles.metricsGrid}>

          <Stat
            label="TRAIN TRADES"
            value={
              formatNumber(
                train.trades
              )
            }
          />

          <Stat
            label="TRAIN EXPECTANCY"
            value={
              formatR(
                train.expectancy_R
              )
            }
          />

          <Stat
            label="TRAIN PF"
            value={
              formatNumber(
                train.profit_factor,
                2
              )
            }
          />

          <Stat
            label="TRAIN DD"
            value={
              formatPercent(
                train.max_drawdown
              )
            }
          />

          <Stat
            label="VALIDATION TRADES"
            value={
              formatNumber(
                test.trades
              )
            }
          />

          <Stat
            label="VALIDATION EXPECTANCY"
            value={
              formatR(
                test.expectancy_R
              )
            }
          />

          <Stat
            label="VALIDATION PF"
            value={
              formatNumber(
                test.profit_factor,
                2
              )
            }
          />

          <Stat
            label="VALIDATION DD"
            value={
              formatPercent(
                test.max_drawdown
              )
            }
          />

        </div>


        {/* TOTAL */}

        <div style={styles.candidateFooter}>

          <div>

            <span style={styles.footerLabel}>
              FULL SAMPLE
            </span>

            <strong>
              {formatR(
                all.total_R
              )} R
            </strong>

          </div>


          <div>

            <span style={styles.footerLabel}>
              SIGNALS
            </span>

            <strong>
              {formatNumber(
                candidate.signal_count
              )}
            </strong>

          </div>


          <div>

            <span style={styles.footerLabel}>
              VALIDATION
            </span>

            <strong
              style={{
                color:
                  validationPass
                    ? "#9fe3bd"
                    : "#aab3c5"
              }}
            >
              {validationPass
                ? "PASS"
                : "NOT PASSED"}
            </strong>

          </div>

        </div>

      </div>

    </article>
  );
}


/* ============================================================
   STAT COMPONENT
   ============================================================ */

function Stat({
  label,
  value
}) {

  return (

    <div style={styles.stat}>

      <div style={styles.statLabel}>
        {label}
      </div>

      <div style={styles.statValue}>
        {value}
      </div>

    </div>
  );
}


/* ============================================================
   FORMATTERS
   ============================================================ */

function formatNumber(
  value,
  decimals = 0
) {

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return "N/A";
  }

  return Number(value).toFixed(
    decimals
  );
}


function formatR(value) {

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return "N/A";
  }

  const n =
    Number(value);

  return `${
    n >= 0 ? "+" : ""
  }${n.toFixed(3)} R`;
}


function formatPercent(value) {

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return "N/A";
  }

  return `${
    (Number(value) * 100).toFixed(1)
  }%`;
}


function formatDate(value) {

  if (!value) {
    return "N/A";
  }

  try {

    return new Date(value)
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", " UTC");

  } catch {

    return "N/A";
  }
}


/* ============================================================
   STYLES
   ============================================================ */

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
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "32px"
  },


  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },


  eyebrow: {
    color: "#737f94",
    fontSize: "12px",
    letterSpacing: "2px",
    fontWeight: "600",
    marginBottom: "10px"
  },


  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: "1.05",
    letterSpacing: "-1px"
  },


  subtitle: {
    marginTop: "14px",
    marginBottom: 0,
    color: "#8993a7",
    fontSize: "17px",
    lineHeight: "1.6",
    maxWidth: "650px"
  },


  secondaryButton: {
    background: "#101622",
    color: "#b8c1d2",
    border: "1px solid #273044",
    borderRadius: "8px",
    padding: "11px 14px",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: "700",
    cursor: "pointer"
  },


  methodCard: {
    background: "#10151f",
    border: "1px solid #202838",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "20px"
  },


  sectionEyebrow: {
    color: "#69758a",
    fontSize: "11px",
    letterSpacing: "2px",
    fontWeight: "700",
    marginBottom: "10px"
  },


  sectionTitle: {
    margin: 0,
    fontSize: "27px",
    letterSpacing: "-0.5px"
  },


  bodyText: {
    color: "#929caf",
    fontSize: "15px",
    lineHeight: "1.65",
    marginTop: "12px",
    marginBottom: 0
  },


  methodGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "12px",
    marginTop: "25px"
  },


  methodItem: {
    display: "flex",
    gap: "13px",
    padding: "16px",
    background: "#0b1018",
    border: "1px solid #1e2736",
    borderRadius: "12px"
  },


  methodNumber: {
    color: "#8893a7",
    fontSize: "12px",
    fontWeight: "700",
    minWidth: "24px"
  },


  methodTitle: {
    color: "#d5dbea",
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "6px"
  },


  methodText: {
    color: "#727e92",
    fontSize: "12px",
    lineHeight: "1.5"
  },


  runCard: {
    background: "#0b1017",
    border: "1px solid #293244",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "20px"
  },


  runTitle: {
    margin: 0,
    fontSize: "25px"
  },


  runButton: {
    marginTop: "25px",
    width: "100%",
    background: "#ffffff",
    color: "#080b12",
    border: "none",
    borderRadius: "9px",
    padding: "16px",
    fontSize: "12px",
    letterSpacing: "1.5px",
    fontWeight: "800",
    cursor: "pointer"
  },


  runButtonDisabled: {
    opacity: 0.55,
    cursor: "wait"
  },


  progressBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#101622",
    borderRadius: "10px"
  },


  progressText: {
    color: "#9ba5b8",
    fontSize: "12px",
    marginBottom: "10px"
  },


  progressTrack: {
    height: "4px",
    background: "#1b2432",
    borderRadius: "5px",
    overflow: "hidden"
  },


  progressBar: {
    width: "55%",
    height: "100%",
    background: "#9ba5b8",
    borderRadius: "5px"
  },


  errorBox: {
    marginTop: "20px",
    padding: "17px",
    background: "#170e12",
    border: "1px solid #542530",
    borderRadius: "10px"
  },


  errorTitle: {
    color: "#f09aa4",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "7px"
  },


  errorText: {
    color: "#a8a0aa",
    fontSize: "13px",
    lineHeight: "1.5"
  },


  datasetCard: {
    background: "#10151f",
    border: "1px solid #202838",
    borderRadius: "18px",
    padding: "25px",
    marginBottom: "20px"
  },


  datasetGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(150px,1fr))",
    gap: "10px"
  },


  metric: {
    background: "#0b1018",
    border: "1px solid #1e2736",
    borderRadius: "10px",
    padding: "15px"
  },


  metricLabel: {
    color: "#657186",
    fontSize: "10px",
    letterSpacing: "1.5px",
    marginBottom: "7px"
  },


  metricValue: {
    color: "#d9deea",
    fontSize: "18px",
    fontWeight: "700"
  },


  dateRow: {
    marginTop: "15px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px 18px",
    color: "#69758a",
    fontSize: "11px",
    letterSpacing: "1px"
  },


  recommendedCard: {
    background: "#0d1815",
    border: "1px solid #294c3d",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "30px"
  },


  noRecommendationCard: {
    background: "#11141b",
    border: "1px solid #303746",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "30px"
  },


  recommendedLabel: {
    color: "#91d4b0",
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontWeight: "800",
    marginBottom: "8px"
  },


  recommendedTitle: {
    margin: 0,
    fontSize: "31px",
    color: "#dcefe5"
  },


  noRecommendationTitle: {
    color: "#c2c8d5",
    fontSize: "25px",
    fontWeight: "800"
  },


  sectionHeadingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "15px",
    marginBottom: "15px"
  },


  resultCount: {
    color: "#687489",
    fontSize: "10px",
    letterSpacing: "1.5px",
    fontWeight: "700"
  },


  candidateList: {
    display: "flex",
    flexDirection: "column",
    gap: "13px"
  },


  candidateCard: {
    display: "flex",
    gap: "20px",
    background: "#0d121a",
    border: "1px solid #202838",
    borderRadius: "16px",
    padding: "22px"
  },


  topCandidate: {
    border: "1px solid #39465c"
  },


  rankBox: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "50%",
    border: "1px solid #465267",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#b4bdce",
    fontSize: "11px",
    fontWeight: "700"
  },


  candidateMain: {
    flex: 1,
    minWidth: 0
  },


  candidateHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    alignItems: "flex-start"
  },


  candidateEyebrow: {
    color: "#626e82",
    fontSize: "9px",
    letterSpacing: "1.5px",
    marginBottom: "5px"
  },


  candidateTitle: {
    margin: 0,
    color: "#e1e5ee",
    fontSize: "21px"
  },


  statusBadge: {
    padding: "7px 9px",
    borderRadius: "6px",
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: "800",
    whiteSpace: "nowrap"
  },


  statusPass: {
    color: "#9fe3bd",
    background: "#10251c",
    border: "1px solid #29523e"
  },


  statusReview: {
    color: "#8994a8",
    background: "#121822",
    border: "1px solid #293244"
  },


  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginTop: "22px",
    paddingBottom: "18px",
    borderBottom: "1px solid #1b2432"
  },


  scoreLabel: {
    color: "#616d81",
    fontSize: "9px",
    letterSpacing: "1.5px",
    marginBottom: "6px"
  },


  scoreValue: {
    color: "#e4e8f0",
    fontSize: "30px",
    fontWeight: "800"
  },


  scoreMax: {
    color: "#687489",
    fontSize: "13px",
    fontWeight: "500"
  },


  sampleBox: {
    textAlign: "right"
  },


  sampleValue: {
    color: "#b5bdcc",
    fontSize: "12px",
    fontWeight: "700"
  },


  metricsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(125px,1fr))",
    gap: "8px",
    marginTop: "15px"
  },


  stat: {
    background: "#101621",
    borderRadius: "8px",
    padding: "11px"
  },


  statLabel: {
    color: "#5f6b80",
    fontSize: "8px",
    letterSpacing: "1px",
    marginBottom: "5px"
  },


  statValue: {
    color: "#c5ccda",
    fontSize: "13px",
    fontWeight: "700"
  },


  candidateFooter: {
    display: "flex",
    flexWrap: "wrap",
    gap: "25px",
    marginTop: "17px",
    paddingTop: "15px",
    borderTop: "1px solid #1b2432"
  },


  footerLabel: {
    color: "#5e697c",
    fontSize: "8px",
    letterSpacing: "1px",
    marginRight: "7px"
  },


  warningCard: {
    marginTop: "30px",
    background: "#10151f",
    border: "1px solid #252e3e",
    borderRadius: "18px",
    padding: "25px"
  },


  warningTitle: {
    margin: 0,
    fontSize: "23px",
    color: "#d4d9e4"
  },


  emptyCard: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    background: "#0d121a",
    border: "1px solid #202838",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "20px"
  },


  emptyNumber: {
    color: "#6d788b",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid #303a4c",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    minWidth: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },


  emptyTitle: {
    margin: 0,
    color: "#d7dce7",
    fontSize: "22px"
  },


  account: {
    marginTop: "28px",
    marginBottom: "20px",
    color: "#596477",
    fontSize: "12px"
  }

};