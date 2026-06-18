import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useSearch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle, Check, Eye, MessageSquare, Zap, Euro, Lock, Mail } from "lucide-react";
import { BADGE_LABELS, BADGE_COLORS, FEATURE_ACCESS, type FeatureKey, type AccessLevel } from "@/config/featureAccess";

type PlanId = "basic" | "pro";

const PLANS = {
  basic: {
    id: "basic" as PlanId,
    name: "Basis",
    price: "€14,95",
    period: "excl. btw per maand",
    tagline: "Meekijken, profiel aanmaken en lokaal meedoen.",
    affiliate: "€4,95 affiliate per aangebrachte klant",
    benefits: [
      "Bedrijfsprofiel aanmaken en beheren",
      "Sectorregels bekijken",
      "Brief analyseren (documenten opvragen)",
      "Website-scan (basis)",
      "Lokale acties zelf plaatsen",
      "Netwerk bekijken",
      "Marktplaats: reageren op aanbod",
      "Blog lezen",
    ],
    badge: "Basis",
    color: "#1E6DB5",
    highlight: false,
  },
  pro: {
    id: "pro" as PlanId,
    name: "Pro",
    price: "€59",
    period: "excl. btw per maand",
    tagline: "Alle tools, onbeperkt gebruik en maximale zichtbaarheid.",
    affiliate: "€9 affiliate per aangebrachte klant",
    benefits: [
      "Alles van Basis",
      "Wat komt eraan? — volledig overzicht",
      "Vindbaarheid & SEO-tools",
      "RegioBot: WOO & regelgeving AI (onbeperkt)",
      "Persoonlijke WOO-bibliotheek",
      "Netwerk: volledig deelnemen",
      "Marktplaats: zelf aanbod plaatsen",
      "Prioriteit ondersteuning",
    ],
    badge: "Pro",
    color: "#7C3AED",
    highlight: true,
  },
};

const COACHING_PLAN = {
  name: "Coaching",
  tagline: "Persoonlijke 1-op-1 begeleiding, op maat samengesteld.",
  badge: "Coaching",
  color: "#0e7490",
  benefits: [
    "Alles van Pro",
    "1-op-1 persoonlijke begeleiding",
    "Maatwerk ondersteuning voor jouw situatie",
    "Directe toegang tot een vaste coach",
    "Prijs op maat — samen besproken",
  ],
};

type FeatureRow = {
  label: string;
  basic: AccessLevel;
  pro: AccessLevel;
};

const FEATURE_ROWS: FeatureRow[] = [
  { label: "Sectorregels",             basic: FEATURE_ACCESS.sectorregels.basic,        pro: FEATURE_ACCESS.sectorregels.pro },
  { label: "Wat komt eraan?",          basic: FEATURE_ACCESS.wat_komt_eraan.basic,       pro: FEATURE_ACCESS.wat_komt_eraan.pro },
  { label: "Documenten opvragen",      basic: FEATURE_ACCESS.documenten_opvragen.basic,  pro: FEATURE_ACCESS.documenten_opvragen.pro },
  { label: "Website-scan",             basic: FEATURE_ACCESS.website_scan.basic,         pro: FEATURE_ACCESS.website_scan.pro },
  { label: "Vindbaarheid",             basic: FEATURE_ACCESS.vindbaarheid.basic,         pro: FEATURE_ACCESS.vindbaarheid.pro },
  { label: "Bedrijfsprofiel",          basic: FEATURE_ACCESS.bedrijfsprofiel.basic,      pro: FEATURE_ACCESS.bedrijfsprofiel.pro },
  { label: "Netwerk",                  basic: FEATURE_ACCESS.netwerk.basic,              pro: FEATURE_ACCESS.netwerk.pro },
  { label: "Lokale acties",            basic: FEATURE_ACCESS.lokale_acties.basic,        pro: FEATURE_ACCESS.lokale_acties.pro },
  { label: "Marktplaats",              basic: FEATURE_ACCESS.marktplaats.basic,          pro: FEATURE_ACCESS.marktplaats.pro },
  { label: "Blog",                     basic: FEATURE_ACCESS.blog_lezen.basic,           pro: FEATURE_ACCESS.blog_lezen.pro },
];

function AccessBadge({ level }: { level: AccessLevel }) {
  const label = BADGE_LABELS[level];
  const color = BADGE_COLORS[level];
  if (level === "geen") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#9333ea" }}>
        <Zap size={11} /> Pro nodig
      </span>
    );
  }
  if (level === "volledig" || level === "plaatsen") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color }}>
        <Check size={12} /> {label}
      </span>
    );
  }
  if (level === "alleen_bekijken") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#2563eb" }}>
        <Eye size={11} /> Alleen bekijken
      </span>
    );
  }
  if (level === "reageren") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#d97706" }}>
        <MessageSquare size={11} /> Reageren
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
  );
}

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
    if (urlPlan === "pro" || urlPlan === "basic") setSelected(urlPlan as PlanId);
  }, [urlPlan]);

  const active = PLANS[selected];
  const isLoggedIn = !!user;

  // Plan-status van de ingelogde gebruiker
  const currentPlan = user?.plan as "basic" | "pro" | "coaching" | undefined;
  const isCoaching = currentPlan === "coaching";
  const isAlreadyPro = currentPlan === "pro" || currentPlan === "coaching";
  // Downgrade-bescherming: geselecteerde plan is hetzelfde of lager dan huidig
  const isAlreadyOnSelected = currentPlan === selected;
  const isDowngrade = (currentPlan === "pro" || currentPlan === "coaching") && selected === "basic";

  async function handleBetaling() {
    setError(null);
    setIsLoading(true);

    try {
      if (isLoggedIn) {
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
        } else if (data.redirectUrl) {
          // Direct upgrade via bestaand mandaat — geen nieuwe betaling nodig
          window.location.href = data.redirectUrl;
        } else {
          setError("Kon checkout-URL niet ophalen. Probeer het opnieuw.");
        }
      } else {
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
    <div className="bg-[#f4f6fb] min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-4">
        <h1 className="text-3xl font-bold text-center text-[#0f2942] mb-2" data-testid="text-page-title">
          Word lid van OpenRegio
        </h1>
        <p className="text-center text-[#475569] text-base mb-10">
          Kies het plan dat bij jouw onderneming past en start vandaag nog.
        </p>

        {/* ── Plankaarten ─────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 40 }}>
          {(Object.values(PLANS) as typeof PLANS[PlanId][]).map((plan) => {
            const isActive = selected === plan.id;
            return (
              <div
                key={plan.id}
                data-testid={`card-plan-${plan.id}`}
                onClick={() => { setSelected(plan.id); setError(null); }}
                style={{
                  background: "white",
                  borderRadius: 14,
                  border: isActive ? `2px solid ${plan.color}` : "2px solid #e2e8f0",
                  boxShadow: isActive ? `0 0 0 4px ${plan.color}22` : "0 1px 4px rgba(0,0,0,.06)",
                  padding: "24px 22px",
                  cursor: "pointer",
                  transition: "border .15s, box-shadow .15s",
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: plan.color, color: "white", fontSize: 11, fontWeight: 800,
                    padding: "3px 14px", borderRadius: 20, letterSpacing: "0.07em",
                  }}>
                    MEEST GEKOZEN
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    background: plan.color + "18", color: plan.color,
                    fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 20,
                    letterSpacing: "0.06em",
                  }}>
                    {plan.badge}
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#0f2942", marginBottom: 2 }}>
                  {plan.price}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>{plan.period}</div>
                <div style={{ fontSize: 13, color: "#334155", marginBottom: 12 }}>{plan.tagline}</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 600,
                  padding: "3px 10px", borderRadius: 20, marginBottom: 14,
                }}>
                  <Euro size={11} /> {plan.affiliate}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {plan.benefits.map((b, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 13, color: "#334155", marginBottom: 6 }}>
                      <Check size={13} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* ── Coaching-kaart (apart — geen Mollie) ─── */}
          <div
            data-testid="card-plan-coaching"
            style={{
              background: "white",
              borderRadius: 14,
              border: "2px solid #cffafe",
              boxShadow: "0 1px 4px rgba(0,0,0,.06)",
              padding: "24px 22px",
              position: "relative",
            }}
          >
            <div style={{
              position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
              background: COACHING_PLAN.color, color: "white", fontSize: 11, fontWeight: 800,
              padding: "3px 14px", borderRadius: 20, letterSpacing: "0.07em", whiteSpace: "nowrap",
            }}>
              PERSOONLIJK
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                background: COACHING_PLAN.color + "18", color: COACHING_PLAN.color,
                fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 20,
                letterSpacing: "0.06em",
              }}>
                {COACHING_PLAN.badge}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#0f2942", marginBottom: 2 }}>
              Op maat
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>prijs in overleg</div>
            <div style={{ fontSize: 13, color: "#334155", marginBottom: 14 }}>{COACHING_PLAN.tagline}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", marginBottom: 16 }}>
              {COACHING_PLAN.benefits.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 13, color: "#334155", marginBottom: 6 }}>
                  <Check size={13} style={{ color: COACHING_PLAN.color, flexShrink: 0, marginTop: 2 }} />
                  {b}
                </li>
              ))}
            </ul>
            <a
              href="mailto:info@openregio.nl?subject=Interesse%20in%20Coaching-plan"
              data-testid="button-coaching-contact"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                background: COACHING_PLAN.color, color: "white",
                borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700,
                textDecoration: "none", width: "100%", boxSizing: "border-box",
              }}
            >
              <Mail size={14} /> Neem contact op
            </a>
          </div>
        </div>

        {/* ── Vergelijkingstabel ───────────────────────────────────── */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 36 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f2942", margin: 0 }}>
              Wat krijg je per account?
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12, width: "46%" }}>Functie</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", color: "#1E6DB5", fontWeight: 700, fontSize: 12 }}>Basis</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", color: "#7C3AED", fontWeight: 700, fontSize: 12 }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                    <td style={{ padding: "10px 16px", color: "#334155", fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <AccessBadge level={row.basic} />
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <AccessBadge level={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Checkout / Plan-status ────────────────────────────────── */}

        {/* Coaching-gebruiker: hoogste plan — geen betaalknop */}
        {isLoggedIn && isCoaching ? (
          <div className="openregio-upgrade-card" data-testid="card-coaching-active" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
            <span className="openregio-upgrade-badge" style={{ background: "#0e7490", color: "white" }}>
              1-op-1 coaching
            </span>
            <h2 style={{ marginTop: 12 }}>Je hebt het beste plan</h2>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
              Je maakt al gebruik van 1-op-1 coaching. Heb je vragen of wil je iets aanpassen? Neem direct contact op.
            </p>
            <a
              href="mailto:info@openregio.nl?subject=Coaching%20plan%20beheren"
              className="openregio-button openregio-button-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "none" }}
              data-testid="button-coaching-beheer"
            >
              <Mail size={14} /> Contact opnemen
            </a>
            <Link href="/vandaag" style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 12 }}>
              Terug naar dashboard
            </Link>
          </div>
        ) : (
          <div className="openregio-upgrade-card" data-testid={`card-upgrade-${active.id}`} style={{ maxWidth: 420, margin: "0 auto" }}>
            {/* Huidig plan banner voor ingelogde leden */}
            {isLoggedIn && currentPlan && (
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "#f0f9ff", border: "1px solid #bae6fd",
                borderRadius: 10, padding: "8px 12px", marginBottom: 14,
                fontSize: 12, color: "#0369a1",
              }} data-testid="banner-current-plan">
                <Check size={13} style={{ flexShrink: 0 }} />
                <span>
                  Huidig plan: <strong>
                    {currentPlan === "coaching" ? "1-op-1 coaching" : currentPlan === "pro" ? "Pro" : "Basis"}
                  </strong>
                </span>
                {isAlreadyPro && (
                  <span style={{ marginLeft: "auto", color: "#475569" }}>
                    Upgrade mogelijk
                  </span>
                )}
              </div>
            )}

            <span className="openregio-upgrade-badge" data-testid="badge-plan">
              {active.badge}
            </span>
            <h2 data-testid="text-plan-name">{active.name}</h2>
            <div className="openregio-upgrade-price">
              <p className="openregio-price-amount" data-testid="text-plan-price">{active.price}</p>
              <span className="openregio-price-period">{active.period}</span>
            </div>
            <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, margin: "4px 0 14px" }}>
              <Euro size={11} style={{ display: "inline", marginRight: 3 }} />
              {active.affiliate}
            </p>

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
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleBetaling()}
                />
              </div>
            )}

            {error && (
              <div
                style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 12,
                  fontSize: 13, color: "#dc2626",
                }}
                data-testid="text-payment-error"
              >
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {(["basic", "pro"] as PlanId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setSelected(id); setError(null); }}
                  data-testid={`button-select-${id}`}
                  className={`openregio-button openregio-button-small ${
                    selected === id
                      ? id === "pro" ? "openregio-button-pro" : "openregio-button-basic"
                      : "openregio-button-outline"
                  }`}
                  style={{ flex: 1 }}
                >
                  {PLANS[id].name}
                  {currentPlan === id && (
                    <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.8 }}>(actief)</span>
                  )}
                </button>
              ))}
            </div>

            {/* Blokeer downgrade of "al actief" */}
            {isLoggedIn && isAlreadyOnSelected ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 10, padding: "11px 16px",
                fontSize: 13, color: "#15803d", fontWeight: 600,
              }} data-testid="text-already-active">
                <Check size={14} />
                Je hebt dit plan al actief
              </div>
            ) : isLoggedIn && isDowngrade ? (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 7,
                background: "#fffbeb", border: "1px solid #fde68a",
                borderRadius: 10, padding: "11px 16px",
                fontSize: 13, color: "#92400e",
              }} data-testid="text-downgrade-warning">
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                Downgraden is momenteel niet mogelijk via dit formulier. Neem contact op via{" "}
                <a href="mailto:info@openregio.nl" style={{ color: "#1d4ed8" }}>info@openregio.nl</a>.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBetaling}
                disabled={isLoading}
                data-testid="button-payment-link"
                className={`openregio-button ${active.id === "pro" ? "openregio-button-pro" : "openregio-button-basic"}`}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading
                  ? "Betaling starten…"
                  : isLoggedIn
                    ? `Upgrade naar ${active.name} (${active.price}/mnd)`
                    : `Ga naar betaling (${active.price}/mnd)`}
              </button>
            )}

            <p className="openregio-upgrade-note">
              <Lock size={11} style={{ display: "inline", marginRight: 4 }} />
              Veilige betaling via Mollie · maandelijks opzegbaar
            </p>

            {!isLoggedIn && (
              <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 8 }}>
                Na betaling ontvang je een e-mail om je account te activeren.
              </p>
            )}

            {/* Pro-gebruiker: coaching upgrade hint */}
            {isLoggedIn && currentPlan === "pro" && selected === "pro" && (
              <div style={{
                marginTop: 14, padding: "10px 14px", borderRadius: 10,
                background: "#f0fdfa", border: "1px solid #99f6e4",
                fontSize: 12, color: "#0f766e", textAlign: "center",
              }} data-testid="banner-coaching-hint">
                Wil je persoonlijke 1-op-1 begeleiding?{" "}
                <a
                  href="mailto:info@openregio.nl?subject=Interesse%20in%20Coaching-plan"
                  style={{ color: "#0e7490", fontWeight: 700 }}
                >
                  Vraag coaching aan
                </a>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/" data-testid="link-back-home" style={{ fontSize: 13, color: "#64748b" }}>
            ← Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
