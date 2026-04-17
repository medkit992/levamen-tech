import { Link } from "react-router-dom";

export default function Failure() {
  return (
    <main style={pageWrap}>
      <section style={card}>
        <div style={badgeWarning}>Payment Cancelled</div>

        <h1 style={title}>Your checkout was not completed.</h1>

        <p style={text}>
          No worries — this usually just means the payment window was closed or
          cancelled before finishing. You can go back and request a fresh payment
          link whenever you are ready.
        </p>

        <div style={buttonRow}>
          <Link to="/" style={primaryButton}>
            Back to Home
          </Link>
          <Link to="/contact" style={secondaryButton}>
            Contact Levamen Tech
          </Link>
        </div>
      </section>
    </main>
  );
}

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background:
    "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "720px",
  background: "rgba(255,255,255,0.96)",
  borderRadius: "24px",
  padding: "40px 32px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
  color: "#0f172a",
};

const badgeWarning: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "16px",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "#fef3c7",
  color: "#92400e",
  fontWeight: 700,
  fontSize: "14px",
};

const title: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "clamp(2rem, 4vw, 3rem)",
  lineHeight: 1.1,
};

const text: React.CSSProperties = {
  margin: 0,
  fontSize: "1.05rem",
  lineHeight: 1.7,
  color: "#334155",
};

const buttonRow: React.CSSProperties = {
  marginTop: "28px",
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const baseButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: 700,
};

const primaryButton: React.CSSProperties = {
  ...baseButton,
  background: "#0f172a",
  color: "#fff",
};

const secondaryButton: React.CSSProperties = {
  ...baseButton,
  background: "#fff",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
};