"use client";

export default function DashboardHeader({
  onLogout
}) {
  return (
    <header style={styles.header}>
      <div>
        <div style={styles.logo}>
          ATLAS
        </div>

        <div style={styles.subtitle}>
          Trading Intelligence
        </div>
      </div>

      <button
        onClick={onLogout}
        style={styles.logout}
      >
        LOG OUT
      </button>
    </header>
  );
}


const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "48px"
  },

  logo: {
    fontSize: "30px",
    fontWeight: "700",
    letterSpacing: "3px"
  },

  subtitle: {
    color: "#8d96a8",
    marginTop: "5px"
  },

  logout: {
    background: "transparent",
    color: "#9da8bb",
    border: "1px solid #263044",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer"
  }
};