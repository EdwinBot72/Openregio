import { useState, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "wouter";
import {
  ArrowRight, Loader2, Sparkles, TrendingUp, AlertTriangle,
  Lightbulb, CheckCircle2, Shield, FileText, RefreshCw,
  ChevronRight, Star, Lock, RotateCcw, Building2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Logo ────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
        <Building2 className="h-4 w-4 text-white" />
      </div>
      <span className="font-bold text-white text-base tracking-tight">OpenRegio</span>
    </div>
  );
}

// ─── Urgentie kleur ───────────────────────────────────────────────────────────

function urgentieKleur(u: string) {
  if (u === "hoog") return { dot: "bg-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", label: "Hoog" };
  if (u === "middel") return { dot: "bg-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", label: "Middel" };
  return { dot: "bg-slate-400", bg: "bg-slate-50 dark:bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", label: "Laag" };
}

// ─── Main component ───────────────────────────────────────────────────────────

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

  const BG = "#143464";

  return (
    <div className="min-h-screen bg-[#0b2240]">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/10" style={{ backgroundColor: BG }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" data-testid="link-home-logo">
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.4px", color: "#fff" }}>
              <span>Open</span>
              <span style={{ color: "#f28a1a" }}>Regio</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: "Home", href: "/" },
              { label: "Basischeck", href: "/basischeck" },
              { label: "Lidmaatschap", href: "/lidmaatschap" },
              { label: "Blogs", href: "/blogs" },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <span
                  className={`text-sm font-medium transition ${
                    item.label === "Basischeck" ? "text-white" : "text-white/60 hover:text-white/90"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <span className="text-sm font-medium text-white/70 hover:text-white transition" data-testid="button-nav-login">Inloggen</span>
            </Link>
            <Link href="/lidmaatschap">
              <button
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
                style={{ backgroundColor: "#f28a1a" }}
                data-testid="button-header-start"
              >
                Word lid
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero + Form ───────────────────────────────────────────────────── */}
      <section className="py-16 px-5" style={{ backgroundColor: BG }}>
        <div className="mx-auto max-w-2xl text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 mb-8">
            <Star className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Gratis Basischeck</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Zie direct wat er speelt in <span className="text-amber-300">jouw regio.</span>
          </h1>
          <p className="text-white/60 text-base mb-10">
            Duurt minder dan 30 seconden. Geen account nodig.
          </p>

          {/* Tab selector */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 mb-8" data-testid="tab-selector">
            {(["regio-analyse", "regelgeving"] as AnalyseType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setResultaat(null); setFout(""); }}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
                data-testid={`tab-${tab}`}
              >
                {tab === "regio-analyse" ? "Regio-analyse" : "Regelgeving"}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-[24px] bg-white dark:bg-slate-900 shadow-2xl shadow-black/40 p-6 text-left space-y-4">
            <div>
              <input
                type="text"
                value={beroep}
                onChange={(e) => setBeroep(e.target.value)}
                placeholder="Je beroep (bijv. Bakker, Horeca, Fysiotherapeut)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#143464] focus:ring-2 focus:ring-[#143464]/10 transition"
                data-testid="input-beroep"
                onKeyDown={(e) => e.key === "Enter" && startAnalyse()}
              />
            </div>
            <div>
              <input
                type="text"
                value={gemeente}
                onChange={(e) => setGemeente(e.target.value)}
                placeholder="Je stad of gemeente"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#143464] focus:ring-2 focus:ring-[#143464]/10 transition"
                data-testid="input-gemeente"
                onKeyDown={(e) => e.key === "Enter" && startAnalyse()}
              />
            </div>
            <div>
              <input
                type="text"
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                placeholder="Bedrijfsnaam — voor Google-profielcheck (optioneel)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#143464] focus:ring-2 focus:ring-[#143464]/10 transition"
                data-testid="input-bedrijfsnaam"
                onKeyDown={(e) => e.key === "Enter" && startAnalyse()}
              />
              <p className="text-xs text-slate-400 mt-1.5 ml-1">Optioneel</p>
            </div>

            {fout && (
              <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-xl px-4 py-3" data-testid="error-message">
                {fout}
              </p>
            )}

            <button
              onClick={startAnalyse}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
              style={{ backgroundColor: "#f28a1a" }}
              data-testid="button-start-analyse"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse bezig…
                </>
              ) : (
                <>
                  Start de analyse <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-white/40 mt-5">
            AI-gegenereerd inzicht op basis van openbare bronnen. Geen opslag van persoonsgegevens.
          </p>
        </div>
      </section>

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      {loading && (
        <section className="py-16 px-5 bg-[#0b2240]">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-[20px] bg-white/10 border border-white/15 flex items-center justify-center mx-auto">
              <Loader2 className="h-7 w-7 text-amber-300 animate-spin" />
            </div>
            <p className="text-white font-semibold">Analyse wordt opgesteld…</p>
            <p className="text-white/50 text-sm">
              We analyseren de situatie voor een <strong className="text-white/80">{beroep}</strong> in <strong className="text-white/80">{gemeente}</strong>
            </p>
          </div>
        </section>
      )}

      {/* ── Resultaten ────────────────────────────────────────────────────── */}
      {resultaat && submittedFor && (
        <section className="py-12 px-5 bg-[#0b2240]" ref={resultRef} data-testid="section-resultaat">
          <div className="mx-auto max-w-2xl space-y-6">

            {/* Header resultaat */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">
                  {submittedFor.type === "regio-analyse" ? "Regio-analyse" : "Regelgeving"} voor
                </p>
                <h2 className="text-xl font-black text-white">
                  {submittedFor.beroep} in {submittedFor.gemeente}
                </h2>
              </div>
              <button
                onClick={opnieuw}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/15 transition"
                data-testid="button-opnieuw"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Opnieuw
              </button>
            </div>

            {/* Samenvatting */}
            <div className="rounded-[20px] border border-amber-400/20 bg-amber-400/8 px-5 py-4" data-testid="card-samenvatting">
              <p className="text-amber-200 text-sm leading-relaxed">{resultaat.samenvatting}</p>
            </div>

            {/* Regio-analyse resultaten */}
            {isRegio(resultaat) && (
              <>
                {/* Kansen */}
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 space-y-4" data-testid="card-kansen">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/15 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white">Kansen in jouw regio</h3>
                  </div>
                  <div className="space-y-3">
                    {resultaat.kansen.map((k, i) => (
                      <div key={i} className="flex gap-3" data-testid={`kans-${i}`}>
                        <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{k.titel}</p>
                          <p className="text-sm text-white/55 leading-relaxed mt-0.5">{k.beschrijving}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risico's */}
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 space-y-4" data-testid="card-risicos">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-400/15 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    </div>
                    <h3 className="font-bold text-white">Risico's &amp; uitdagingen</h3>
                  </div>
                  <div className="space-y-3">
                    {resultaat.risicos.map((r, i) => (
                      <div key={i} className="flex gap-3" data-testid={`risico-${i}`}>
                        <div className="w-5 h-5 rounded-full bg-rose-400/20 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{r.titel}</p>
                          <p className="text-sm text-white/55 leading-relaxed mt-0.5">{r.beschrijving}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 space-y-4" data-testid="card-tips">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/15 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                    </div>
                    <h3 className="font-bold text-white">Concrete tips voor jou</h3>
                  </div>
                  <div className="space-y-3">
                    {resultaat.tips.map((t, i) => (
                      <div key={i} className="flex gap-3" data-testid={`tip-${i}`}>
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-amber-300">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{t.actie}</p>
                          <p className="text-sm text-white/55 leading-relaxed mt-0.5">{t.uitleg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Regelgeving resultaten */}
            {!isRegio(resultaat) && (
              <>
                {/* Vergunningen */}
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 space-y-4" data-testid="card-vergunningen">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-400/15 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-white">Relevante vergunningen</h3>
                  </div>
                  <div className="space-y-3">
                    {resultaat.vergunningen.map((v, i) => {
                      const uk = urgentieKleur(v.urgentie);
                      return (
                        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5" data-testid={`vergunning-${i}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${uk.dot}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="text-sm font-semibold text-white">{v.naam}</p>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${uk.bg} ${uk.text}`}>
                                  {uk.label}
                                </span>
                              </div>
                              <p className="text-sm text-white/55 leading-relaxed">{v.beschrijving}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Aandachtspunten */}
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 space-y-4" data-testid="card-aandachtspunten">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/15 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <h3 className="font-bold text-white">Aandachtspunten</h3>
                  </div>
                  <div className="space-y-3">
                    {resultaat.aandachtspunten.map((a, i) => (
                      <div key={i} className="flex gap-3" data-testid={`aandacht-${i}`}>
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{a.punt}</p>
                          <p className="text-sm text-white/55 leading-relaxed mt-0.5">{a.toelichting}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recente wijzigingen */}
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-5 space-y-4" data-testid="card-wijzigingen">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-400/15 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-violet-400" />
                    </div>
                    <h3 className="font-bold text-white">Recente wijzigingen</h3>
                  </div>
                  <div className="space-y-3">
                    {resultaat.recente_wijzigingen.map((w, i) => (
                      <div key={i} className="flex gap-3" data-testid={`wijziging-${i}`}>
                        <div className="w-5 h-5 rounded-full bg-violet-400/20 flex items-center justify-center shrink-0 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{w.onderwerp}</p>
                          <p className="text-sm text-white/55 leading-relaxed mt-0.5">{w.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* CTA — lid worden */}
            <div className="rounded-[20px] border border-amber-400/25 bg-amber-400/8 p-6 text-center space-y-4" data-testid="card-cta-lid">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-black text-white text-lg">Wil je dit elke week automatisch?</h3>
                <p className="text-white/60 text-sm mt-1.5 max-w-sm mx-auto">
                  Als lid van OpenRegio ontvang je gepersonaliseerde updates, subsidie-alerts en een uitgebreide basischeck — elke week vers voor jouw sector en regio.
                </p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/register">
                  <button
                    className="rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: "#f28a1a" }}
                    data-testid="button-word-lid"
                  >
                    Word gratis lid <ArrowRight className="inline h-4 w-4 ml-1.5" />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition" data-testid="button-inloggen">
                    Inloggen
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── Waardepropositie (getoond als er geen resultaat is) ───────────── */}
      {!resultaat && !loading && (
        <section className="py-16 px-5 bg-[#0b2240]">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white mb-2">Wat je gratis krijgt</h2>
              <p className="text-white/50 text-sm">Direct inzicht, zonder registratie</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: TrendingUp,
                  kleur: "text-emerald-400",
                  bg: "bg-emerald-400/15",
                  titel: "Regio-analyse",
                  tekst: "Kansen, risico's en trends voor jouw beroep in jouw gemeente — AI-gegenereerd op basis van actuele bronnen.",
                },
                {
                  icon: FileText,
                  kleur: "text-blue-400",
                  bg: "bg-blue-400/15",
                  titel: "Regelgeving-check",
                  tekst: "Welke vergunningen heb je nodig? Wat zijn de actuele aandachtspunten voor jouw sector? Direct antwoord.",
                },
                {
                  icon: Shield,
                  kleur: "text-violet-400",
                  bg: "bg-violet-400/15",
                  titel: "Privacy-first",
                  tekst: "Geen account nodig. Geen opslag van je gegevens. Resultaten worden niet gedeeld met derden.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.titel} className="rounded-[20px] border border-white/10 bg-white/5 p-5 space-y-3">
                    <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${item.kleur}`} />
                    </div>
                    <p className="font-bold text-white text-sm">{item.titel}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{item.tekst}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 px-5 bg-[#08182f]">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4 flex-wrap">
          <Logo />
          <div className="flex gap-5">
            <Link href="/privacy"><span className="text-xs text-white/40 hover:text-white/70 transition">Privacy</span></Link>
            <Link href="/voorwaarden"><span className="text-xs text-white/40 hover:text-white/70 transition">Voorwaarden</span></Link>
            <Link href="/contact"><span className="text-xs text-white/40 hover:text-white/70 transition">Contact</span></Link>
          </div>
          <p className="text-xs text-white/30">© 2025 OpenRegio</p>
        </div>
      </footer>

    </div>
  );
}
