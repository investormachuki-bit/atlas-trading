"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main style={{
        minHeight: "100vh",
        background: "#080b12",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
      }}>
        Loading ATLAS...
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#080b12",
      color: "#ffffff",
      padding: "24px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto"
      }}>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px"
        }}>
          <div>
            <div style={{
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "2px"
            }}>
              ATLAS
            </div>

            <div style={{
              color: "#8d96a8",
              marginTop: "4px"
            }}>
              Trading Intelligence
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              color: "#9da8bb",
              border: "1px solid #263044",
              borderRadius: "8px",
              padding: "9px 12px"
            }}
          >
            LOG OUT
          </button>
        </div>

        <h1>Dashboard</h1>

        <p style={{
          color: "#8d96a8"
        }}>
          Welcome to your ATLAS research workspace.
        </p>

        <div style={{
          marginTop: "30px",
          background: "#101520",
          border: "1px solid #1e2738",
          borderRadius: "16px",
          padding: "24px"
        }}>
          <div style={{
            color: "#7f899b",
            fontSize: "12px",
            marginBottom: "8px"
          }}>
            SIGNED IN AS
          </div>

          <div style={{
            fontSize: "16px",
            marginBottom: "24px"
          }}>
            {user.email}
          </div>

          <h2>XAUUSD</h2>

          <p style={{
            color: "#8d96a8"
          }}>
            5-Minute · 5-Year Historical Dataset
          </p>

          <p style={{
            fontSize: "18px",
            fontWeight: "600"
          }}>
            329,103 candles
          </p>
        </div>

      </div>
    </main>
  );
}