"use client";

export default function BacktestLab({
  running,
  progress,
  progressText,
  onRun,
  error
}) {
  return (
    <section style={styles.panel}>

      <div style={styles.eyebrow}>
        BACKTEST LAB
      </div>

      <h2 style={styles.panelTitle}>
        Trend Continuation
      </h2>

      <p style={styles.description}>
        Run ATLAS Trend Continuation against
        the complete five-year XAUUSD M5
        historical dataset.
      </p>

      <div style={styles.parameters}>

        <Parameter
          label="Risk / Trade"
          value="1%"
        />

        <Parameter
          label="Risk / Reward"
          value="1 : 2"
        />

        <Parameter
          label="Timeframe"
          value="M5"
        />

      </div>

      {running && (
        <Progress
          progress={progress}
          text={progressText}
        />
      )}

      <button
        onClick={onRun}
        disabled={running}
        style={{
          ...styles.runButton,
          opacity: running ? 0.55 : 1
        }}
      >
        {running
          ? "BACKTEST RUNNING..."
          : "RUN BACKTEST"}
      </button>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

    </section>
  );
}


/* ============================================================
   PARAMETER
   ============================================================ */

function Parameter({
  label,
  value
}) {
  return (
    <div>
      <span style={styles.parameterLabel}>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}


/* ============================================================
   PROGRESS
   ============================================================ */

function Progress({
  progress,
  text
}) {
  return (
    <div style={styles.progressBox}>

      <div style={styles.progressHeader}>

        <span>
          BACKTESTING
        </span>

        <strong>
          {Number(progress).toFixed(1)}%
        </strong>

      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            width: `${Math.min(
              100,
              Math.max(0, Number(progress) || 0)
            )}%`
          }}
        />
      </div>

      <div style={styles.progressText}>
        {text}
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

  progressBox: {
    marginBottom: "18px"
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#8d96a8",
    fontSize: "12px",
    marginBottom: "8px"
  },

  progressTrack: {
    height: "8px",
    background: "#080b12",
    borderRadius: "20px",
    overflow: "hidden"
  },

  progressBar: {
    height: "100%",
    background: "#ffffff",
    borderRadius: "20px",
    transition: "width 0.2s ease"
  },

  progressText: {
    marginTop: "8px",
    color: "#7f899b",
    fontSize: "12px"
  },

  runButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#080b12",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },

  error: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "10px",
    background: "#251318",
    color: "#ff9b9b",
    lineHeight: 1.5
  }

};