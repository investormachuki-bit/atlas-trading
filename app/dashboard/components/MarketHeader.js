"use client";

export default function MarketHeader({
  market = "XAUUSD",
  timeframe = "M5",
  datasetLabel = "Historical Dataset"
}) {
  return (
    <section style={styles.section}>
      <div style={styles.eyebrow}>
        RESEARCH MARKET
      </div>

      <h1 style={styles.title}>
        {market}
      </h1>

      <div style={styles.subtitle}>
        {timeframe} · {datasetLabel}
      </div>
    </section>
  );
}


/* ============================================================
   STYLES
   ============================================================ */

const styles = {
  section: {
    marginBottom: "0"
  },

  eyebrow: {
    color: "#7f899b",
    fontSize: "12px",
    letterSpacing: "1.5px",
    marginBottom: "8px"
  },

  title: {
    fontSize: "42px",
    margin: "0 0 8px"
  },

  subtitle: {
    color: "#8d96a8",
    fontSize: "18px"
  }
};