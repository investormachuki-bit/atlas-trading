"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/";
    }

    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#080b12",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px"
      }}>

        <div style={{
          marginBottom: "30px"
        }}>
          <div style={{
            fontSize: "32px",
            fontWeight: "700",
            letterSpacing: "3px"
          }}>
            ATLAS
          </div>

          <div style={{
            color: "#8d96a8",
            marginTop: "6px"
          }}>
            Trading Intelligence
          </div>
        </div>

        <div style={{
          background: "#101520",
          border: "1px solid #1e2738",
          borderRadius: "16px",
          padding: "24px"
        }}>

          <h1 style={{
            marginTop: 0,
            fontSize: "26px"
          }}>
            Sign in
          </h1>

          <p style={{
            color: "#8d96a8",
            lineHeight: 1.5
          }}>
            Access your ATLAS research workspace.
          </p>

          <form onSubmit={handleLogin}>

            <label style={{
              display: "block",
              marginTop: "22px",
              marginBottom: "8px",
              color: "#9da8bb",
              fontSize: "14px"
            }}>
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "9px",
                border: "1px solid #263044",
                background: "#080b12",
                color: "#fff",
                fontSize: "16px"
              }}
            />

            <label style={{
              display: "block",
              marginTop: "18px",
              marginBottom: "8px",
              color: "#9da8bb",
              fontSize: "14px"
            }}>
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "9px",
                border: "1px solid #263044",
                background: "#080b12",
                color: "#fff",
                fontSize: "16px"
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "15px",
                border: "none",
                borderRadius: "10px",
                background: "#fff",
                color: "#080b12",
                fontWeight: "700",
                fontSize: "15px"
              }}
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>

          </form>

          {message && (
            <div style={{
              marginTop: "18px",
              color: "#ff8f8f",
              fontSize: "14px"
            }}>
              {message}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}