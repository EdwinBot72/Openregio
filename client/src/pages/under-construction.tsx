import { Link } from "wouter";
import { Mail, Wrench } from "lucide-react";

export default function UnderConstructionPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: "inherit",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <span
          style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px" }}
        >
          <span style={{ color: "#0b2240" }}>Open</span>
          <span style={{ color: "#1f5fae" }}>Regio</span>
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          padding: "2.5rem 2rem",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
        }}
        data-testid="card-under-construction"
      >
        {/* Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#E6F1FB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <Wrench size={26} style={{ color: "#1f5fae" }} />
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0b2240",
            margin: "0 0 0.75rem",
          }}
          data-testid="heading-under-construction"
        >
          Binnenkort online
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "#64748b",
            lineHeight: 1.6,
            margin: "0 0 1.75rem",
          }}
        >
          OpenRegio wordt op dit moment verder ontwikkeld. We zijn bijna klaar —
          kom snel terug!
        </p>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            margin: "0 0 1.5rem",
          }}
        />

        {/* Contact */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          <Mail size={14} />
          <a
            href="mailto:info@openregio.nl"
            style={{ color: "#1f5fae", fontWeight: 600, textDecoration: "none" }}
            data-testid="link-contact-email"
          >
            info@openregio.nl
          </a>
        </div>
      </div>

      {/* Subtle login link */}
      <p style={{ marginTop: "1.5rem", fontSize: 13, color: "#94a3b8" }}>
        Al een account?{" "}
        <Link href="/login">
          <span
            style={{ color: "#1f5fae", fontWeight: 600, cursor: "pointer" }}
            data-testid="link-login"
          >
            Inloggen
          </span>
        </Link>
      </p>
    </div>
  );
}
