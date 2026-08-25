export default function Dashboard() {
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
          marginBottom: "40px"
        }}>
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