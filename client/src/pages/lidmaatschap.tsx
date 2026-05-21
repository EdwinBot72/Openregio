import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle } from "lucide-react";

type PlanId = "basic" | "pro";

const PLANS = {
  basic: {
    id: "basic" as PlanId,
    name: "Basis-lid",
    price: "€19",
    period: "excl. BTW per maand",
    tagline: "Volwaardig lid van de coöperatie",
    benefitsTitle: "Wat krijg je",
    benefits: [
      "Bedrijfsprofiel in lokaal netwerk",
      "Ontdek en ontmoet ondernemers",
      "Volledig stemrecht in de coöperatie",
      "Basischeck & weerbaarheidsbadges",
    ],
    badge: "Basis",
  },
  pro: {
    id: "pro" as PlanId,
    name: "Pro-bijdrager",
    price: "€49",
    period: "excl. BTW per maand",
    tagline: "Draag extra bij en krijg krachtige tools",
    benefitsTitle: "Alles van Basis, plus",
    benefits: [
      "RegioBot: WOO & regelgeving AI",
      "Persoonlijke WOO-bibliotheek",
      "Printbare overzichten",
      "Prioriteit ondersteuning",
      "Bouw mee aan nieuwe features",
    ],
    badge: "Pro",
  },
};

export default function LidmaatschapPage() {
  usePageTitle("Lidmaatschap");
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const urlPlan = params.get("plan");

  const { user } = useAuth();
  const [selected, setSelected] = useState<PlanId>(urlPlan === "pro" ? "pro" : "basic");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlPlan === "pro" || urlPlan === "basic") setSelected(urlPlan);
  }, [urlPlan]);

  const active = PLANS[selected];
  const isLoggedIn = !!user;

  async function handleBetaling() {
    setError(null);
    setIsLoading(true);

    try {
      if (isLoggedIn) {
        // Scenario A: ingelogde gebruiker upgradet plan
        const returnUrl = `${window.location.origin}/betaling-geslaagd?plan=${selected}`;
        const res = await fetch("/api/billing/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ plan: selected, returnUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Kon betaling niet starten. Probeer het opnieuw.");
          return;
        }
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          setError("Kon checkout-URL niet ophalen. Probeer het opnieuw.");
        }
      } else {
        // Scenario B: nieuwe gebruiker zonder account
        if (!email || !email.includes("@")) {
          setError("Vul een geldig e-mailadres in.");
          return;
        }
        const res = await fetch("/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), plan: selected }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Kon betaling niet starten. Probeer het opnieuw.");
          return;
        }
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          setError("Kon checkout-URL niet ophalen. Probeer het opnieuw.");
        }
      }
    } catch {
      setError("Verbindingsfout. Controleer je internetverbinding en probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-[#f4f6fb]">
      <div className="openregio-upgrade" data-testid="page-lidmaatschap">
        <h1 data-testid="text-page-title">Word lid van OpenRegio</h1>
        <p className="openregio-subtitle">
          Kies een plan dat bij jouw onderneming past en start vandaag nog met lokale samenwerking.
        </p>

        {/* Plan-toggle */}
        <div
          className="openregio-form-actions"
          style={{ justifyContent: "center", marginBottom: 18 }}
          role="tablist"
          aria-label="Kies plan"
        >
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const isActive = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setSelected(id); setError(null); }}
                role="tab"
                aria-selected={isActive}
                data-testid={`button-select-${id}`}
                className={`openregio-button openregio-button-small ${
                  isActive
                    ? id === "pro"
                      ? "openregio-button-pro"
                      : "openregio-button-basic"
                    : "openregio-button-outline"
                }`}
              >
                {PLANS[id].name}
              </button>
            );
          })}
        </div>

        {/* Upgrade-kaart */}
        <div className="openregio-upgrade-card" data-testid={`card-upgrade-${active.id}`}>
          <span className="openregio-upgrade-badge" data-testid="badge-plan">
            {active.badge}
          </span>

          <h2 data-testid="text-plan-name">{active.name}</h2>
          <p className="openregio-upgrade-tagline" data-testid="text-plan-tagline">
            {active.tagline}
          </p>

          <div className="openregio-upgrade-benefits">
            <h3>{active.benefitsTitle}</h3>
            <ul>
              {active.benefits.map((b, i) => (
                <li key={i} data-testid={`text-benefit-${active.id}-${i}`}>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="openregio-upgrade-price">
            <p className="openregio-price-amount" data-testid="text-plan-price">
              {active.price}
            </p>
            <span className="openregio-price-period">{active.period}</span>
          </div>

          {/* E-mailinvoer voor niet-ingelogde gebruikers */}
          {!isLoggedIn && (
            <div className="openregio-form-group" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6, display: "block" }}>
                E-mailadres
              </label>
              <input
                type="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                data-testid="input-email"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && handleBetaling()}
              />
            </div>
          )}

          {/* Foutmelding */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 12,
                fontSize: 13,
                color: "#dc2626",
              }}
              data-testid="text-payment-error"
            >
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              {error}
            </div>
          )}

          {/* Betaalknop */}
          <button
            type="button"
            onClick={handleBetaling}
            disabled={isLoading}
            data-testid="button-payment-link"
            className={`openregio-button ${
              active.id === "pro" ? "openregio-button-pro" : "openregio-button-basic"
            }`}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading
              ? "Betaling starten…"
              : isLoggedIn
                ? `Upgrade naar ${active.name} (${active.price}/mnd)`
                : `Ga naar betaling (${active.price}/mnd)`}
          </button>

          <p className="openregio-upgrade-note">
            Veilige betaling via Mollie · opzegbaar per maand
          </p>

          {!isLoggedIn && (
            <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 8 }}>
              Na betaling ontvang je een e-mail om je account te activeren.
            </p>
          )}
        </div>

        <div className="openregio-back-link">
          <Link href="/" data-testid="link-back-home">
            ← Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
