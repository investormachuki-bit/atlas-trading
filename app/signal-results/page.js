"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const styles = {
  page: { minHeight: "100vh", background: "#f5f7fb", color: "#101828", padding: "28px 18px 56px" },
  shell: { maxWidth: 1180, margin: "0 auto" },
  eyebrow: { color: "#64748b", fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" },
  title: { fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.1, margin: "10px 0", fontWeight: 800 },
  subtitle: { color: "#667085", maxWidth: 760, lineHeight: 1.6, margin: "0 0 22px" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
  button: { border: "1px solid #d0d5dd", borderRadius: 10, padding: "10px 14px", background: "#fff", color: "#101828", fontWeight: 700, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 },
  card: { background: "#fff", border: "1px solid #e4e7ec", borderRadius: 16, padding: 18, boxShadow: "0 1px 2px rgba(16,24,40,.03)" },
  label: { color: "#667085", fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" },
  value: { fontSize: 30, fontWeight: 800, marginTop: 8, letterSpacing: "-.03em" },
  note: { color: "#667085", fontSize: 13, marginTop: 6, lineHeight: 1.45 },
  tableWrap: { overflowX: "auto", background: "#fff", border: "1px solid #e4e7ec", borderRadius: 16 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 850 },
  th: { padding: "13px 14px", background: "#f9fafb", color: "#667085", textAlign: "left", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid #e4e7ec" },
  td: { padding: "14px", borderBottom: "1px solid #f0f2f5", fontSize: 13, whiteSpace: "nowrap" },
  badge: { display: "inline-block", padding: "4px 8px", borderRadius: 999, background: "#eef2f6", color: "#344054", fontSize: 11, fontWeight: 800 },
  error: { background: "#fff1f0", border: "1px solid #fecdca", color: "#b42318", padding: 12, borderRadius: 10, marginBottom: 16 },
  empty: { padding: "42px 20px", textAlign: "center", color: "#667085" }
};

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}
function pct(n, d) { return d ? `${Math.round((n / d) * 100)}%` : "—"; }

export default function SignalResultsPage() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        window.location.href = "/login";
        return;
      }
      setUser(auth.user);
      const { data, error: queryError } = await supabase
        .from("signal_evaluations")
        .select("id,signal_id,market_id,timeframe,direction,signal_candle_time,entry_price,stop_price,tp1_price,tp2_price,tp3_price,status,tp1_reached,tp2_reached,tp3_reached,stop_reached,terminal_outcome,realized_r,evaluated_through,closed_at,created_at")
        .order("signal_candle_time", { ascending: false })
        .limit(500);
      if (queryError) throw queryError;
      setRows(data || []);
    } catch (e) {
      console.error("ATLAS signal results load failed", e);
      setError(e?.message || "Could not load signal evaluation records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => rows.filter(r => filter === "all" || r.status === filter), [rows, filter]);
  const stats = useMemo(() => {
    const n = visible.length;
    const t1 = visible.filter(r => r.tp1_reached).length;
    const t2 = visible.filter(r => r.tp2_reached).length;
    const t3 = visible.filter(r => r.tp3_reached).length;
    const sl = visible.filter(r => r.stop_reached).length;
    const closed = visible.filter(r => r.status === "closed" || r.status === "expired").length;
    return { n, t1, t2, t3, sl, closed };
  }, [visible]);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.eyebrow}>ATLAS · SIGNAL INTELLIGENCE</div>
        <h1 style={styles.title}>Signal Results</h1>
        <p style={styles.subtitle}>
          A record of evaluated signals and target milestones. Counts are calculated from persisted Supabase records;
          target milestones can overlap. Realized R is intentionally not reported until the exit-allocation policy is configured.
        </p>
        <div style={styles.actions}>
          <button style={styles.button} onClick={() => window.location.href = "/discovery"}>Strategy Discovery</button>
          <button style={styles.button} onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Refresh results"}</button>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#475467", fontSize: 13 }}>
            Status
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...styles.button, padding: "9px 10px" }}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="evaluating">Evaluating</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
              <option value="data_gap">Data gap</option>
              <option value="invalidated">Invalidated</option>
            </select>
          </label>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.grid}>
          <Metric label="Recorded signals" value={stats.n} note="Rows available under your current access." />
          <Metric label="Reached TP1" value={stats.t1} note={pct(stats.t1, stats.n) + " of displayed signals; milestones overlap."} />
          <Metric label="Reached TP2" value={stats.t2} note={pct(stats.t2, stats.n) + " of displayed signals; milestones overlap."} />
          <Metric label="Reached TP3" value={stats.t3} note={pct(stats.t3, stats.n) + " of displayed signals."} />
          <Metric label="Stop touched" value={stats.sl} note="Conservative same-candle rule: stop takes precedence." />
          <Metric label="Closed / expired" value={stats.closed} note="Realized P&L is not inferred from target touches." />
        </div>

        <section style={styles.tableWrap}>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Signal time</th><th style={styles.th}>Market ID</th><th style={styles.th}>TF</th>
              <th style={styles.th}>Side</th><th style={styles.th}>Entry</th><th style={styles.th}>Stop</th>
              <th style={styles.th}>Targets</th><th style={styles.th}>Milestones</th><th style={styles.th}>Outcome</th><th style={styles.th}>Evaluated through</th>
            </tr></thead>
            <tbody>
              {visible.map(r => <tr key={r.id}>
                <td style={styles.td}>{fmtDate(r.signal_candle_time)}</td>
                <td style={styles.td} title={r.market_id}>{String(r.market_id).slice(0, 8)}…</td>
                <td style={styles.td}>{r.timeframe}</td>
                <td style={styles.td}><span style={styles.badge}>{String(r.direction).toUpperCase()}</span></td>
                <td style={styles.td}>{Number(r.entry_price).toLocaleString()}</td>
                <td style={styles.td}>{Number(r.stop_price).toLocaleString()}</td>
                <td style={styles.td}>{[r.tp1_price,r.tp2_price,r.tp3_price].map(v => v == null ? "—" : Number(v).toLocaleString()).join(" / ")}</td>
                <td style={styles.td}>{[r.tp1_reached && "TP1",r.tp2_reached && "TP2",r.tp3_reached && "TP3",r.stop_reached && "SL"].filter(Boolean).join(" · ") || "None yet"}</td>
                <td style={styles.td}><span style={styles.badge}>{r.terminal_outcome || r.status}</span></td>
                <td style={styles.td}>{fmtDate(r.evaluated_through)}</td>
              </tr>)}
              {!loading && visible.length === 0 ? <tr><td colSpan={10} style={styles.empty}>
                {rows.length === 0 ? "No signal evaluations recorded yet. Once the scanner publishes signals and the evaluator runs, records will appear here. No demo rows are being shown." : "No records match this status filter."}
              </td></tr> : null}
              {loading && visible.length === 0 ? <tr><td colSpan={10} style={styles.empty}>Loading signal records…</td></tr> : null}
            </tbody>
          </table>
        </section>
        <p style={{ ...styles.note, marginTop: 14 }}>
          Signed in as {user?.email || "authenticated user"}. This page does not create mock signals. Market prices and outcome evaluation depend on real stored signals and market candles.
        </p>
      </div>
    </main>
  );
}

function Metric({ label, value, note }) {
  return <div style={styles.card}><div style={styles.label}>{label}</div><div style={styles.value}>{value}</div><div style={styles.note}>{note}</div></div>;
}
