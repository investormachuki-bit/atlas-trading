"use client";

import { TOTAL_CANDLES } from "../lib/constants";

export default function MarketStats({
  candles = TOTAL_CANDLES,
  market = "XAUUSD",
  timeframe = "M5",
  engine = "READY"
}) {
  return (
    <section style={styles.grid}>

      <StatCard
        label="Candles"
        value={Number(candles).toLocaleString()}
      />

      <StatCard
        label="Market"
        value={market}
      />

      <StatCard
        label="Timeframe"
        value={timeframe}
      />

      <StatCard
        label="Engine"
        value={engine}
      />

    </section>
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


/* ============================================================
   STYLES
   ============================================================ */

const styles = {
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