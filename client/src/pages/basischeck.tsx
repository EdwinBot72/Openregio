import { useState, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "wouter";
import {
  ArrowRight, Loader2, TrendingUp, AlertTriangle,
  Lightbulb, CheckCircle2, Shield, FileText, RefreshCw,
  ChevronRight, Star, Lock, RotateCcw,
} from "lucide-react";
import { PublicTopNav } from "@/components/PublicTopNav";

type AnalyseType = "regio-analyse" | "regelgeving";

type RegioResultaat = {
  kansen: { titel: string; beschrijving: string }[];
  risicos: { titel: string; beschrijving: string }[];
  tips: { actie: string; uitleg: string }[];
  samenvatting: string;
};

type RegelgevingResultaat = {
  vergunningen: { naam: string; beschrijving: string; urgentie: "hoog" | "middel" | "laag" }[];
  aandachtspunten: { punt: string; toelichting: string }[];
  recente_wijzigingen: { onderwerp: string; impact: string }[];
  samenvatting: string;
};

type Resultaat = RegioResultaat | RegelgevingResultaat;

function isRegio(r: Resultaat): r is RegioResultaat {
  return "kansen" in r;
}

function urgentieKleur(u: string) {
  if (u === "hoog") return { dot: "#dc2626", bg: "#fef2f2", text: "#b91c1c", label: "Hoog" };
  if (u === "middel") return { dot: "#f28a1a", bg: "#fff7ed", text: "#c2410c", label: "Middel" };
  return { dot: "#94a3b8", bg: "#f1f5f9", text: "#475569", label: "Laag" };
}

export default function BasischeckPage() {
  usePageTitle("Gratis Basischeck — OpenRegio");

  const [activeTab, setActiveTab] = useState<AnalyseType>("regio-analyse");
  const [beroep, setBeroep] = useState("");
  const [gemeente, setGemeente] = useState("");
  const [bedrijfsnaam, setBedrijfsnaam] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultaat, setResultaat] = useState<Resultaat | null>(null);
  const [fout, setFout] = useState("");
  const [submittedFor, setSubmittedFor] = useState<{ beroep: string; gemeente: string; type: AnalyseType } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const startAnalyse = async () => {
    if (!beroep.trim() || !gemeente.trim()) {
      setFout("Vul je beroep en stad of gemeente in.");
      return;
    }
    setFout("");
    setLoading(true);
    setResultaat(null);
    setSubmittedFor({ beroep: beroep.trim(), gemeente: gemeente.trim(), type: activeTab });

    try {
      const res = await fetch("/api/basischeck/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beroep: beroep.trim(), gemeente: gemeente.trim(), bedrijfsnaam: bedrijfsnaam.trim(), type: activeTab }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analyse mislukt");
      }

      const data = await res.json();
      setResultaat(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err: any) {
      setFout(err.message || "Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const opnieuw = () => {
    setResultaat(null);
    setFout("");
    setSubmittedFor(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #d4dde9",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    color: "#0b2240",
    background: "#fff",
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div className="openregio-public-page" data-testid="page-basischeck">
      <PublicTopNav />

      <div className="openregio-public-content" style={{ maxWidth: 760 }}>
        {/* Hero badge + titel */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#fff7ed",
              color: "#c2410c",
              border: "1px solid #fed7aa",
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".5px",
              marginBottom: 14,
            }}
          >
            <Star className="h-3 w-3" /> Gratis Basischeck
          </span>
          <h1 className="openregio-public-title" style={{ fontSize: 34 }}>
            Zie direct wat er speelt in <span style={{ color: "#1f5fae" }}>jouw regio.</span>
          </h1>
          <p className="openregio-public-lead" style={{ marginBottom: 0 }}>
            Duurt minder dan 30 seconden. Geen account nodig.
          </p>
        </div>

        {/* Tab selector */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div
            style={{ display: "inline-flex", background: "#e6ebf2", borderRadius: 999, padding: 4 }}
            data-testid="tab-selector"
          >
            {(["regio-analyse", "regelgeving"] as AnalyseType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setResultaat(null); setFout(""); }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: activeTab === tab ? "#fff" : "transparent",
                  color: activeTab === tab ? "#0b2240" : "#64748b",
                  boxShadow: activeTab === tab ? "0 1px 3px rgba(11,34,64,.08)" : "none",
                  transition: "all .15s",
                }}
                data-testid={`tab-${tab}`}
              >
                {tab === "regio-analyse" ? "Regio-analyse" : "Regelgeving"}
              </button>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="openregio-public-card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              value={beroep}
              onChange={(e) => setBeroep(e.target.value)}
              placeholder="Je beroep (bijv. Bakker, Horeca, Fysiotherapeut)"
              style={inputStyle}
              data-testid="input-beroep"
              onKeyDown={(e) => e.key === "Enter" && startAnalyse()}
            />
            <input
              type="text"
              value={gemeente}
              onChange={(e) => setGemeente(e.target.value)}
              placeholder="Je stad of gemeente"
              style={inputStyle}
              data-testid="input-gemeente"
              onKeyDown={(e) => e.key === "Enter" && startAnalyse()}
            />
            <div>
              <input
                type="text"
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                placeholder="Bedrijfsnaam — voor Google-profielcheck (optioneel)"
                style={inputStyle}
                data-testid="input-bedrijfsnaam"
                onKeyDown={(e) => e.key === "Enter" && startAnalyse()}
              />
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, marginLeft: 4 }}>Optioneel</p>
            </div>

            {fout && (
              <p
                style={{ fontSize: 13, color: "#b91c1c", background: "#fef2f2", borderRadius: 8, padding: "10px 12px", margin: 0 }}
                data-testid="error-message"
              >
                {fout}
              </p>
            )}

            <button
              onClick={startAnalyse}
              disabled={loading}
              className="openregio-button openregio-button-primary"
              style={{ width: "100%", marginTop: 4, justifyContent: "center" }}
              data-testid="button-start-analyse"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyse bezig…</>
              ) : (
                <>Start de analyse <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginBottom: 0 }}>
          AI-gegenereerd inzicht op basis van openbare bronnen. Geen opslag van persoonsgegevens.
        </p>
      </div>

      {/* ── Loading state ──────────────────────────────────────────── */}
      {loading && (
        <div className="openregio-public-content" style={{ maxWidth: 760, textAlign: "center", paddingTop: 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#1f5fae" }} />
          </div>
          <p style={{ fontSize: 14, color: "#0b2240", fontWeight: 700, margin: "0 0 4px" }}>Analyse wordt opgesteld…</p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Voor een <strong>{beroep}</strong> in <strong>{gemeente}</strong>
          </p>
        </div>
      )}

      {/* ── Resultaten ─────────────────────────────────────────────── */}
      {resultaat && submittedFor && (
        <div ref={resultRef} className="openregio-public-content" style={{ maxWidth: 760, paddingTop: 0 }} data-testid="section-resultaat">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 4px" }}>
                {submittedFor.type === "regio-analyse" ? "Regio-analyse" : "Regelgeving"} voor
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0b2240", margin: 0 }}>
                {submittedFor.beroep} in {submittedFor.gemeente}
              </h2>
            </div>
            <button
              onClick={opnieuw}
              className="openregio-button openregio-button-outline openregio-button-small"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              data-testid="button-opnieuw"
            >
              <RotateCcw className="h-3 w-3" /> Opnieuw
            </button>
          </div>

          {/* Samenvatting */}
          <div
            className="openregio-public-card"
            style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
            data-testid="card-samenvatting"
          >
            <p style={{ color: "#7c2d12", margin: 0, fontSize: 14, lineHeight: 1.6 }}>{resultaat.samenvatting}</p>
          </div>

          {isRegio(resultaat) && (
            <>
              {/* Kansen */}
              <div className="openregio-public-card" data-testid="card-kansen">
                <h2><TrendingUp className="w-4 h-4" style={{ color: "#059669" }} /> Kansen in jouw regio</h2>
                {resultaat.kansen.map((k, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginTop: 10 }} data-testid={`kans-${i}`}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: "#059669", flexShrink: 0, marginTop: 3 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", margin: "0 0 2px" }}>{k.titel}</p>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{k.beschrijving}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Risico's */}
              <div className="openregio-public-card" data-testid="card-risicos">
                <h2><AlertTriangle className="w-4 h-4" style={{ color: "#dc2626" }} /> Risico's &amp; uitdagingen</h2>
                {resultaat.risicos.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginTop: 10 }} data-testid={`risico-${i}`}>
                    <AlertTriangle className="h-4 w-4" style={{ color: "#dc2626", flexShrink: 0, marginTop: 3 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", margin: "0 0 2px" }}>{r.titel}</p>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{r.beschrijving}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="openregio-public-card" data-testid="card-tips">
                <h2><Lightbulb className="w-4 h-4" style={{ color: "#f28a1a" }} /> Concrete tips voor jou</h2>
                {resultaat.tips.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginTop: 10 }} data-testid={`tip-${i}`}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff7ed", color: "#c2410c", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", margin: "0 0 2px" }}>{t.actie}</p>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{t.uitleg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!isRegio(resultaat) && (
            <>
              {/* Vergunningen */}
              <div className="openregio-public-card" data-testid="card-vergunningen">
                <h2><FileText className="w-4 h-4" style={{ color: "#1f5fae" }} /> Relevante vergunningen</h2>
                {resultaat.vergunningen.map((v, i) => {
                  const uk = urgentieKleur(v.urgentie);
                  return (
                    <div key={i} className="openregio-soft-box" data-testid={`vergunning-${i}`}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: uk.dot, flexShrink: 0, marginTop: 6 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", margin: 0 }}>{v.naam}</p>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: uk.bg, color: uk.text }}>
                              {uk.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{v.beschrijving}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aandachtspunten */}
              <div className="openregio-public-card" data-testid="card-aandachtspunten">
                <h2><AlertTriangle className="w-4 h-4" style={{ color: "#f28a1a" }} /> Aandachtspunten</h2>
                {resultaat.aandachtspunten.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginTop: 10 }} data-testid={`aandacht-${i}`}>
                    <AlertTriangle className="h-4 w-4" style={{ color: "#f28a1a", flexShrink: 0, marginTop: 3 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", margin: "0 0 2px" }}>{a.punt}</p>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{a.toelichting}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recente wijzigingen */}
              <div className="openregio-public-card" data-testid="card-wijzigingen">
                <h2><RefreshCw className="w-4 h-4" style={{ color: "#7c3aed" }} /> Recente wijzigingen</h2>
                {resultaat.recente_wijzigingen.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginTop: 10 }} data-testid={`wijziging-${i}`}>
                    <ChevronRight className="h-4 w-4" style={{ color: "#7c3aed", flexShrink: 0, marginTop: 3 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", margin: "0 0 2px" }}>{w.onderwerp}</p>
                      <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{w.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CTA - lid worden */}
          <div
            className="openregio-public-card"
            style={{ textAlign: "center", background: "#0b2240", borderColor: "#0b2240" }}
            data-testid="card-cta-lid"
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(242,138,26,.18)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Lock className="h-5 w-5" style={{ color: "#f28a1a" }} />
            </div>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 8px", justifyContent: "center" }}>Wil je dit elke week automatisch?</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.75)", margin: "0 auto 16px", maxWidth: 420, lineHeight: 1.6 }}>
              Als lid van OpenRegio ontvang je gepersonaliseerde updates, subsidie-alerts en een uitgebreide basischeck — elke week vers voor jouw sector en regio.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/lidmaatschap">
                <button className="openregio-button openregio-button-primary" data-testid="button-word-lid">
                  Word lid <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/login">
                <button
                  className="openregio-button openregio-button-outline"
                  style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}
                  data-testid="button-inloggen"
                >
                  Inloggen
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Waardepropositie (geen resultaat) ─────────────────────── */}
      {!resultaat && !loading && (
        <div className="openregio-public-content" style={{ maxWidth: 1000, paddingTop: 0 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0b2240", margin: "0 0 4px" }}>Wat je gratis krijgt</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Direct inzicht, zonder registratie</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {[
              { icon: TrendingUp, color: "#059669", bg: "#dcfce7", titel: "Regio-analyse", tekst: "Kansen, risico's en trends voor jouw beroep in jouw gemeente — AI-gegenereerd op basis van actuele bronnen." },
              { icon: FileText, color: "#1f5fae", bg: "#E6F1FB", titel: "Regelgeving-check", tekst: "Welke vergunningen heb je nodig? Wat zijn de actuele aandachtspunten voor jouw sector? Direct antwoord." },
              { icon: Shield, color: "#7c3aed", bg: "#ede9fe", titel: "Privacy-first", tekst: "Geen account nodig. Geen opslag van je gegevens. Resultaten worden niet gedeeld met derden." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titel} className="openregio-public-card" style={{ marginBottom: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#0b2240", margin: "0 0 4px" }}>{item.titel}</p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{item.tekst}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <footer style={{ borderTop: "1px solid #e6ebf2", padding: "24px 16px", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 8 }}>
          <Link href="/privacy"><span style={{ color: "#64748b", cursor: "pointer" }}>Privacy</span></Link>
          <Link href="/voorwaarden"><span style={{ color: "#64748b", cursor: "pointer" }}>Voorwaarden</span></Link>
          <Link href="/disclaimer"><span style={{ color: "#64748b", cursor: "pointer" }}>Disclaimer</span></Link>
        </div>
        © 2026 OpenRegio
      </footer>
    </div>
  );
}
