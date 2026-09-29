"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";

export default function BacktestHistory({
  refreshKey = 0,
  selectedId = null,
  onSelect
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setLoading(true);

      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw userError || new Error("Authentication session is missing.");
        }

        const { data, error } = await supabase
          .from("backtest_jobs")
          .select(
            "id,status,created_at,updated_at,cursor,total_candles,market_id,strategy_id,timeframe,results"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }

        if (!mounted) return;

        const nextJobs = Array.isArray(data) ? data : [];
        setJobs(nextJobs);

        if (nextJobs.length > 0) {
          const preferred =
            selectedId && nextJobs.find((job) => job.id === selectedId)
              ? selectedId
              : nextJobs[0].id;

          const selected = nextJobs.find((job) => job.id === preferred);

          onSelect?.(selected?.results || null, selected || null);
        }
      } catch (error) {
        console.error("Unable to load backtest history:", error);

        if (mounted) {
          setJobs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  function handleChange(event) {
    const job = jobs.find((item) => item.id === event.target.value);

    if (!job) return;

    onSelect?.(job.results || null, job);
  }

  if (loading && jobs.length === 0) {
    return null;
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section style={styles.panel}>
      <div style={styles.label}>BACKTEST REPORT</div>

      <select
        value={selectedId || jobs[0].id}
        onChange={handleChange}
        style={styles.select}
      >
        {jobs.map((job) => {
          const date = new Date(job.created_at);
          const label = Number.isNaN(date.getTime())
            ? job.created_at
            : date.toLocaleString();

          return (
            <option key={job.id} value={job.id}>
              {job.id.slice(0, 8)}…{job.id.slice(-4)} — {label} — {job.status}
            </option>
          );
        })}
      </select>
    </section>
  );
}

const styles = {
  panel: {
    marginTop: "24px",
    marginBottom: "24px",
    padding: "18px",
    border: "1px solid #252c3a",
    borderRadius: "14px",
    background: "#0d111a"
  },
  label: {
    marginBottom: "10px",
    color: "#9aa4b6",
    fontSize: "12px",
    letterSpacing: "3px",
    fontWeight: 700
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #303849",
    background: "#080b12",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none"
  }
};
