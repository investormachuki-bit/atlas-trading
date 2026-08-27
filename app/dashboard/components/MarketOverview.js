"use client";

import {
  TOTAL_CANDLES,
  TIMEFRAME
} from "../lib/constants";

export default function MarketOverview({
  running
}) {
  return (
    <>
      <section>
        <div style={styles.eyebrow}>
          RESEARCH MARKET
        </div>

        <h1 style={styles.title}>
          XAUUSD
        </h1>

        <div style={styles.marketSubtitle}>
          5-Minute · Historical Dataset
        </div>
      </section>

      <section style={styles.grid}>
        <StatCard
          label="Candles"
          value={TOTAL_CANDLES.toLocaleString()}
        />

        <StatCard
          label="Market"
          value="XAUUSD"
        />

        <StatCard
          label="Timeframe"
          value={TIMEFRAME}
        />

        <StatCard
          label="Engine"
          value={running ? "RUNNING" : "READY"}
        />
      </section>
    </>
  );
}

function StatCard({
  label,
  value
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>
        {label}
      </div>

      <div style={styles.cardValue}>
        {value}
      </div>
    </div>
  );
}

const styles = {
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

  marketSubtitle: {
    color: "#8d96a8",
    fontSize: "18px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginTop: "28px"
  },

  card: {
    background: "#101520",
    border: "1px solid #1e2738",
    borderRadius: "16px",
    padding: "22px"
  },

  cardLabel: {
    color: "#7f899b",
    fontSize: "14px",
    marginBottom: "10px"
  },

  cardValue: {
    fontSize: "22px",
    fontWeight: "700"
  }
};