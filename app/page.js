export default function Home() {
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

          <div style={{
            padding: "8px 12px",
            border: "1px solid #263044",
            borderRadius: "20px",
            fontSize: "13px",
            color: "#9da8bb"
          }}>
            V0.1
          </div>
        </div>

        <section style={{
          marginBottom: "30px"
        }}>
          <div style={{
            color: "#8d96a8",
            fontSize: "13px",
            marginBottom: "8px"
          }}>
            RESEARCH MARKET
          </div>

          <h1 style={{
            fontSize: "32px",
            margin: 0
          }}>
            XAUUSD
          </h1>

          <div style={{
            color: "#9da8bb",
            marginTop: "6px"
          }}>
            5-Minute · 5-Year Historical Dataset
          </div>
        </section>

        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "14px",
          marginBottom: "30px"
        }}>

          {[
            ["Candles", "329,103"],
            ["Start", "25 Aug 2021"],
            ["End", "24 Aug 2026"],
            ["Status", "READY"]
          ].map(([label, value]) => (
            <div key={label} style={{
              background: "#101520",
              border: "1px solid #1e2738",
              borderRadius: "12px",
              padding: "18px"
            }}>
              <div style={{
                color: "#7f899b",
                fontSize: "12px",
                marginBottom: "8px"
              }}>
                {label}
              </div>

              <div style={{
                fontSize: "18px",
                fontWeight: "600"
              }}>
                {value}
              </div>
            </div>
          ))}

        </section>

        <section style={{
          background: "#101520",
          border: "1px solid #1e2738",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "30px"
        }}>
          <h2 style={{
            marginTop: 0
          }}>
            Backtest Lab
          </h2>

          <p style={{
            color: "#8d96a8",
            lineHeight: 1.6
          }}>
            Run ATLAS against five years of XAUUSD historical data
            and measure whether the strategy has a genuine statistical edge.
          </p>

          <button style={{
            marginTop: "15px",
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#080b12",
            fontWeight: "700",
            fontSize: "15px"
          }}>
            RUN BACKTEST
          </button>
        </section>

        <section>
          <h2>Performance</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "14px"
          }}>

            {[
              ["Win Rate", "—"],
              ["Profit Factor", "—"],
              ["Expectancy", "—"],
              ["Total R", "—"],
              ["Max Drawdown", "—"],
              ["Equity", "—"]
            ].map(([label, value]) => (
              <div key={label} style={{
                background: "#101520",
                border: "1px solid #1e2738",
                borderRadius: "12px",
                padding: "18px"
              }}>
                <div style={{
                  color: "#7f899b",
                  fontSize: "12px",
                  marginBottom: "8px"
                }}>
                  {label}
                </div>

                <div style={{
                  fontSize: "22px",
                  fontWeight: "700"
                }}>
                  {value}
                </div>
              </div>
            ))}

          </div>
        </section>

      </div>
    </main>
  );
}