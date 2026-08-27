"use client";

import {
  TIMEFRAME,
  RISK_PER_TRADE,
  RISK_REWARD,
  TOTAL_CANDLES
} from "../lib/constants";

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
        Research Configuration
      </h2>

      <p style={styles.description}>
        Test the ATLAS Trend Continuation
        strategy against the complete
        historical XAUUSD dataset.
      </p>


      {/* ======================================================
          CONFIGURATION
         ====================================================== */}

      <div style={styles.configGrid}>

        <ConfigItem
          label="Strategy"
          value="Trend Continuation"
        />

        <ConfigItem
          label="Market"
          value="XAUUSD"
        />

        <ConfigItem
          label="Timeframe"
          value={TIMEFRAME}
        />

        <ConfigItem
          label="Risk / Trade"
          value={`${RISK_PER_TRADE * 100}%`}
        />

        <ConfigItem
          label="Risk / Reward"
          value={`1 : ${RISK_REWARD}`}
        />

        <ConfigItem
          label="Dataset"
          value={`${TOTAL_CANDLES.toLocaleString()} candles`}
        />

      </div>


      {/* ======================================================
          PROGRESS
         ====================================================== */}

      {running && (
        <Progress
          progress={progress}
          text={progressText}
        />
      )}


      {/* ======================================================
          RUN
         ====================================================== */}

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


      {/* ======================================================
          ERROR
         ====================================================== */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

    </section>
  );
}


/* ============================================================
   CONFIG ITEM
   ============================================================ */

function ConfigItem({
  label,
  value
}) {
  return (
    <div style={styles.configItem}>

      <div style={styles.parameterLabel}>
        {label}
      </div>

      <div style={styles.configValue}>
        {value}
      </div>

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
  const safeProgress = Math.min(
    100,
    Math.max(
      0,
      Number(progress) || 0
    )
  );

  return (
    <div style={styles.progressBox}>

      <div style={styles.progressHeader}>

        <span>
          BACKTESTING
        </span>

        <strong>
          {safeProgress.toFixed(1)}%
        </strong>

      </div>


      <div style={styles.progressTrack}>

        <div
          style={{
            ...styles.progressBar,
            width: `${safeProgress}%`
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

  configGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    marginTop: "24px",
    marginBottom: "24px"
  },

  configItem: {
    background: "#080b12",
    border: "1px solid #1e2738",
    borderRadius: "12px",
    padding: "16px"
  },

  parameterLabel: {
    color: "#7f899b",
    fontSize: "12px",
    marginBottom: "7px"
  },

  configValue: {
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    lineHeight: 1.4
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