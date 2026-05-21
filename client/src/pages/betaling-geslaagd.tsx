import { CheckCircle, Mail, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const PLAN_LABELS: Record<string, string> = {
  basic: "Basis-lid",
  pro: "Pro-bijdrager",
};

/** Toon succes voor ingelogde gebruikers die een plan-upgrade deden */
function UpgradeSuccessPage({ plan }: { plan: "basic" | "pro" }) {
  const planLabel = PLAN_LABELS[plan] ?? plan;
  return (
    <div className="openregio-page openregio-auth-page" data-testid="card-upgrade-success">
      <div className="openregio-auth-center" style={{ maxWidth: 480 }}>
        <div className="openregio-auth-logo">
          <Link href="/">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        <div className="openregio-card openregio-auth-card" style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={28} style={{ color: "#059669" }} data-testid="icon-success" />
          </div>

          <span style={{ display: "inline-block", background: "rgba(31,95,174,.1)", color: "#1f5fae", border: "1px solid rgba(31,95,174,.2)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            {planLabel} actief
          </span>

          <h1 className="openregio-auth-title">Betaling geslaagd!</h1>
          <p className="openregio-auth-sub" style={{ marginBottom: 20 }}>
            Je plan is bijgewerkt naar <strong>{planLabel}</strong>. Je hebt nu direct toegang tot alle bijbehorende functies.
          </p>

          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>
            Het kan een moment duren voordat de wijziging zichtbaar is. Vernieuw de pagina als je plan nog niet is bijgewerkt.
          </p>

          <Link href="/vandaag" data-testid="button-go-dashboard">
            <button className="openregio-button openregio-button-primary" style={{ width: "100%", marginBottom: 10 }}>
              Naar mijn dashboard
            </button>
          </Link>
          <Link href="/lidmaatschap" data-testid="link-back-membership">
            <button className="openregio-button openregio-button-outline" style={{ width: "100%" }}>
              Terug naar lidmaatschap
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Toon een formulier voor nieuwe gebruikers die na betaling een account aanmaken */
function EmailCheckPage({ email }: { email: string }) {
  return (
    <div className="openregio-page openregio-auth-page" data-testid="card-payment-success">
      <div className="openregio-auth-center">
        <div className="openregio-auth-logo">
          <Link href="/">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        <div className="openregio-card openregio-auth-card" style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={28} style={{ color: "#059669" }} data-testid="icon-success" />
          </div>
          <h1 className="openregio-auth-title">Betaling geslaagd!</h1>
          <p className="openregio-auth-sub" style={{ marginBottom: 20 }}>
            Welkom bij OpenRegio! Je ontvangt een e-mail met je persoonlijke onboarding-link.
          </p>

          {email && (
            <div style={{ background: "#f4f6fb", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left" }}>
              <Mail size={16} style={{ color: "#1f5fae", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", margin: "0 0 2px" }}>Check je inbox</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  Verstuurd naar <strong style={{ color: "#0b2240" }} data-testid="text-email">{email}</strong>
                </p>
              </div>
            </div>
          )}

          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2240", marginBottom: 10 }}>Volgende stappen:</p>
            {[
              "Check je e-mail voor je persoonlijke onboarding-link",
              "Klik op de link om je account te activeren",
              "Maak je bedrijfsprofiel compleet",
              "Start met RegioBot en de basischeck!",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "#475569", marginBottom: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6F1FB", color: "#1f5fae", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left" }}>
            <AlertCircle size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
              Geen e-mail ontvangen? Check je spam of neem contact op via info@openregio.nl
            </p>
          </div>

          <Link href="/" data-testid="button-back-home">
            <button className="openregio-button openregio-button-primary" style={{ width: "100%", marginBottom: 10 }}>
              Terug naar homepage
            </button>
          </Link>
          <Link href="/login" data-testid="link-login">
            <button className="openregio-button openregio-button-outline" style={{ width: "100%" }}>
              Al toegang? Log direct in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BetalingGeslaagd() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  const email = params.get("email") || "";

  const { user } = useAuth();

  // Ingelogde gebruiker die plan heeft geüpgraded
  if ((plan === "basic" || plan === "pro") && user) {
    return <UpgradeSuccessPage plan={plan} />;
  }

  // Nieuwe gebruiker: e-mail met onboarding-link ontvangen
  return <EmailCheckPage email={email} />;
}
