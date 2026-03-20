import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Check, Mail, ChevronRight, ChevronDown,
  BarChart2, Users, ArrowRight, MapPin,
  Lock, Gavel, TrendingUp, AlertTriangle,
  CheckCircle2, RotateCcw, FileText, ChevronUp,
  Sparkles, Clock, TrendingDown, Layers
} from "lucide-react";
import logoImg from "@assets/optimized/logo.webp";
import footerLogoImg from "@assets/optimized/footer-logo.webp";
import streetImg from "@assets/optimized/street.webp";
import groupImg from "@assets/optimized/group.webp";

type WizardStep = "input" | "scanning" | "rapport";
type WizardMode = "regio" | "regelgeving";

const SCAN_MESSAGES = [
  "Jouw regio in kaart brengen…",
  "Lokale signalen analyseren…",
  "Kansen en risico's inventariseren…",
  "Branchegegevens ophalen…",
  "Rapport samenstellen…",
];

const SCAN_MESSAGES_REGELGEVING = [
  "Regelgeving doorzoeken…",
  "Relevante besluiten en wetten opzoeken…",
  "Vergunningseisen in kaart brengen…",
  "Lokale uitvoering analyseren…",
  "Rapport samenstellen…",
];

interface Section {
  label: string;
  content: string;
  icon: typeof CheckCircle2;
  color: string;
  bg: string;
  tag: string;
}

const REGIO_LABELS = ["MARKTKLIMAAT", "KANS", "RISICO", "ACTIE", "LOKALE TIP"];
const REGEL_LABELS = ["WETTELIJK KADER", "PRAKTIJK", "RISICO", "ACTIE", "SLIMME TIP"];

const LABEL_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; tag: string }> = {
  "MARKTKLIMAAT":   { icon: BarChart2,    color: "#1f5fae", bg: "rgba(31,95,174,.07)",  tag: "Marktklimaat" },
  "KANS":           { icon: TrendingUp,   color: "#059669", bg: "rgba(5,150,105,.07)",  tag: "Kans" },
  "RISICO":         { icon: AlertTriangle,color: "#dc2626", bg: "rgba(220,38,38,.07)",  tag: "Risico" },
  "ACTIE":          { icon: CheckCircle2, color: "#f28a1a", bg: "rgba(242,138,26,.07)", tag: "Eerste stap" },
  "LOKALE TIP":     { icon: MapPin,       color: "#7c3aed", bg: "rgba(124,58,237,.07)", tag: "Lokale tip" },
  "WETTELIJK KADER":{ icon: Gavel,        color: "#1f5fae", bg: "rgba(31,95,174,.07)",  tag: "Wet & Regelgeving" },
  "PRAKTIJK":       { icon: CheckCircle2, color: "#059669", bg: "rgba(5,150,105,.07)",  tag: "In de praktijk" },
  "SLIMME TIP":     { icon: Sparkles,     color: "#7c3aed", bg: "rgba(124,58,237,.07)", tag: "Slimme tip" },
};

function parseStructuredResponse(antwoord: string, mode: WizardMode): Section[] {
  const labels = mode === "regio" ? REGIO_LABELS : REGEL_LABELS;
  const sections: Section[] = [];
  for (const label of labels) {
    const regex = new RegExp(`${label}:\\s*(.+?)(?=(?:${labels.join("|")}):|\s*$)`, "si");
    const match = antwoord.match(regex);
    if (match && match[1]) {
      const cfg = LABEL_CONFIG[label];
      if (cfg) sections.push({ label, content: match[1].trim().replace(/\n+/g, " "), ...cfg });
    }
  }
  if (sections.length === 0 && antwoord.length > 30) {
    const fallbackCfg = LABEL_CONFIG[mode === "regio" ? "KANS" : "WETTELIJK KADER"];
    sections.push({ label: "Analyse", content: antwoord.slice(0, 400), ...fallbackCfg });
  }
  return sections;
}

function computeScore(antwoord: string, seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  const base = ((Math.abs(hash) % 24) + 56);
  const bonus = Math.min(antwoord.length / 100, 10);
  return Math.round(base + bonus);
}

export default function HomePage() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [wizardStep, setWizardStep] = useState<WizardStep>("input");
  const [wizardMode, setWizardMode] = useState<WizardMode>("regio");
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMsgIdx, setScanMsgIdx] = useState(0);
  const [antwoord, setAntwoord] = useState("");
  const [score, setScore] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [showFullText, setShowFullText] = useState(false);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShowCookieBanner(true);
  }, []);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
    };
  }, []);

  const handleCookieChoice = (accepted: boolean) => {
    localStorage.setItem("cookie_consent", accepted ? "accepted" : "rejected");
    setShowCookieBanner(false);
  };

  const startWizard = async () => {
    if (!field1.trim() || !field2.trim()) return;
    setWizardStep("scanning");
    setScanProgress(0);
    setScanMsgIdx(0);

    let prog = 0;
    scanIntervalRef.current = setInterval(() => {
      prog += Math.random() * 3.5 + 1.2;
      if (prog >= 92) prog = 92;
      setScanProgress(Math.round(prog));
    }, 80);

    const msgs = wizardMode === "regio" ? SCAN_MESSAGES : SCAN_MESSAGES_REGELGEVING;
    let msgIdx = 0;
    msgIntervalRef.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length;
      setScanMsgIdx(msgIdx);
    }, 700);

    try {
      const endpoint = wizardMode === "regio" ? "/api/regiobot/buurman" : "/api/regelgeving/check";
      const body = wizardMode === "regio"
        ? { beroep: field1.trim(), stad: field2.trim() }
        : { branche: field1.trim(), onderwerp: field2.trim() };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const rawAntwoord = data.antwoord || data.error || "Analyse voltooid.";
      const computedScore = computeScore(rawAntwoord, field2 + field1);
      const computedSections = parseStructuredResponse(rawAntwoord, wizardMode);

      setAntwoord(rawAntwoord);
      setScore(computedScore);
      setSections(computedSections);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
      setScanProgress(100);
      setTimeout(() => setWizardStep("rapport"), 500);
    } catch {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (msgIntervalRef.current) clearInterval(msgIntervalRef.current);
      setAntwoord("Kon geen verbinding maken. Probeer het later opnieuw.");
      setScore(60);
      setSections([]);
      setScanProgress(100);
      setTimeout(() => setWizardStep("rapport"), 500);
    }
  };

  const resetWizard = () => {
    setWizardStep("input");
    setField1("");
    setField2("");
    setScanProgress(0);
    setScanMsgIdx(0);
    setAntwoord("");
    setSections([]);
    setShowFullText(false);
  };

  const messages = wizardMode === "regio" ? SCAN_MESSAGES : SCAN_MESSAGES_REGELGEVING;
  const scoreColor = score >= 75 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626";
  const scoreLabel = score >= 75 ? "Goed" : score >= 60 ? "Matig" : "Kwetsbaar";
  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur" data-testid="nav-main">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 gap-4">
          <Link href="/" data-testid="link-home-logo">
            <img src={logoImg} alt="OpenRegio" className="h-10 w-auto" />
          </Link>

          <nav className="hidden gap-1 md:flex text-sm font-medium text-slate-600">
            <a href="#wat-is-openregio" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-wat-is">Wat is OpenRegio</a>
            <a href="#hoe-het-werkt" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-hoe">Hoe het werkt</a>
            <a href="#tarieven" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-tarieven">Tarieven</a>
            <a href="#voorbeelden" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-voorbeelden">Voorbeelden</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="button-nav-login">Inloggen</button>
            </Link>
            <a href="#basischeck" data-testid="button-nav-start">
              <button className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors">
                Start direct
              </button>
            </a>
          </div>
        </div>
      </header>

      <main>

        {/* ─── HERO ─── */}
        <section id="home" className="bg-gradient-to-br from-sky-50 via-white to-emerald-50" data-testid="section-hero">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-block rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">
                Lokaal platform voor ondernemers en organisaties
              </p>

              <h1 className="max-w-xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl" data-testid="text-hero-title">
                Meer klanten. Minder gedoe.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600" data-testid="text-hero-subtitle">
                OpenRegio is een platform waar ondernemers en organisaties in jouw regio
                elkaar direct vinden en samenwerken.
              </p>

              <p className="mt-3 max-w-xl text-base leading-7 text-slate-500">
                Voor lokale ondernemers, gemeenten en organisaties die direct zaken willen doen
                zonder tussenpartijen.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row flex-wrap">
                <a
                  href="#ondernemer"
                  className="rounded-2xl bg-sky-600 px-6 py-4 text-center font-semibold text-white hover:bg-sky-700 transition-colors"
                  data-testid="button-hero-ondernemer"
                >
                  Ik ben ondernemer
                </a>
                <a
                  href="#organisatie"
                  className="rounded-2xl border border-slate-300 px-6 py-4 text-center font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  data-testid="button-hero-organisatie"
                >
                  Ik ben gemeente / organisatie
                </a>
                <a
                  href="#basischeck"
                  className="rounded-2xl bg-emerald-600 px-6 py-4 text-center font-semibold text-white hover:bg-emerald-700 transition-colors"
                  data-testid="button-hero-basischeck"
                >
                  Doe de Basischeck
                </a>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Voor ondernemers</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Meer zichtbaar in je regio</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-600 shrink-0" /> Profiel aanmaken</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-600 shrink-0" /> Regio en aanbod tonen</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-600 shrink-0" /> Direct gevonden worden</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Voor organisaties</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Lokaal aanbod direct vinden</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Zoek ondernemers in de regio</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Vind direct contactgegevens</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Werk zonder tussenlagen</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-sky-600 p-5 text-white">
                  <p className="text-sm font-medium text-sky-100">In 3 stappen aan de slag</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
                    <div className="rounded-xl bg-white/10 p-3">1. Profiel aanmaken</div>
                    <div className="rounded-xl bg-white/10 p-3">2. Regio & aanbod invullen</div>
                    <div className="rounded-xl bg-white/10 p-3">3. Gevonden worden</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── WAT IS OPENREGIO ─── */}
        <section id="wat-is-openregio" className="mx-auto max-w-7xl px-6 py-20" data-testid="section-wat-is">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Wat is OpenRegio
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                Direct contact. Lokale zichtbaarheid. Minder ruis.
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-8 text-slate-600">
              <p>
                OpenRegio is een platform waar vraag en aanbod in jouw regio samenkomen.
                Geen tussenpersonen. Geen ingewikkelde systemen. Gewoon lokaal zaken doen.
              </p>
              <p>
                Je maakt een profiel aan, laat zien wat je doet en wordt direct gevonden
                door ondernemers, gemeenten en organisaties in jouw omgeving. Volg ook regelgeving
                en openbare signalen die jouw bedrijf raken.
              </p>
            </div>
          </div>
        </section>

        {/* ─── VOOR WIE ─── */}
        <section className="bg-slate-50" data-testid="section-voor-wie">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Voor wie
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                Eén platform. Twee duidelijke ingangen.
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div
                id="ondernemer"
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                data-testid="card-ondernemer"
              >
                <p className="text-sm font-semibold text-slate-500">Ik ben ondernemer</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">Word gevonden in jouw regio</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Laat klanten, organisaties en samenwerkingspartners direct zien wat jij doet.
                </p>
                <ul className="mt-6 space-y-3 text-slate-700">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-sky-600 shrink-0" /> Meer lokale zichtbaarheid</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-sky-600 shrink-0" /> Duidelijk profiel en aanbod</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-sky-600 shrink-0" /> Direct contact zonder tussenpartij</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-sky-600 shrink-0" /> Signalen die jouw bedrijf raken</li>
                </ul>
                <a
                  href="#tarieven"
                  className="mt-8 inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 transition-colors"
                  data-testid="button-ondernemer-cta"
                >
                  Meld je aan als ondernemer
                </a>
              </div>

              <div
                id="organisatie"
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                data-testid="card-organisatie"
              >
                <p className="text-sm font-semibold text-slate-500">Ik ben gemeente / organisatie</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">Vind lokaal aanbod zonder omwegen</h3>
                <p className="mt-4 leading-7 text-slate-600">
                  Zoek gericht naar ondernemers in de regio en leg direct contact voor opdrachten,
                  samenwerking of regionale inkoop.
                </p>
                <ul className="mt-6 space-y-3 text-slate-700">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Lokale partijen sneller vinden</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Direct contact en korte lijnen</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Regionale samenwerking versterken</li>
                </ul>
                <a
                  href="mailto:info@openregio.nl"
                  className="mt-8 inline-block rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  data-testid="button-organisatie-cta"
                >
                  Neem contact op
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BASISCHECK WIZARD ─── */}
        <section id="basischeck" data-testid="section-basischeck"
          className="py-0"
          style={{ background: wizardStep === "rapport" ? "#f8fafd" : "#0e3a70" }}
        >

          {wizardStep === "input" && (
            <div className="py-24 px-6">
              <div className="max-w-xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.8)" }}>
                  <Sparkles className="w-3.5 h-3.5" /> Gratis Basischeck
                </div>
                <h2 className="font-black text-white mb-3" style={{ fontSize: "clamp(26px, 3.2vw, 42px)", letterSpacing: "-1px", lineHeight: 1.15 }} data-testid="text-wizard-title">
                  Wat is jouw regio-positie?
                </h2>
                <p className="mb-10 text-base" style={{ color: "rgba(255,255,255,.6)" }}>
                  Duurt minder dan 30 seconden. Geen account nodig.
                </p>

                <div className="flex rounded-xl p-1 mb-8 mx-auto max-w-xs" style={{ background: "rgba(255,255,255,.1)" }}>
                  {(["regio", "regelgeving"] as WizardMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setWizardMode(m)}
                      className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                      style={wizardMode === m
                        ? { background: "#fff", color: "#0e3a70" }
                        : { color: "rgba(255,255,255,.6)" }}
                      data-testid={`button-mode-${m}`}
                    >
                      {m === "regio" ? "Regio-analyse" : "Regelgeving"}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 text-left mb-6">
                  <input
                    type="text"
                    placeholder={wizardMode === "regio" ? "Je beroep (bijv. Bakker, Horeca, Fysiotherapeut)" : "Je branche (bijv. Horeca, Detailhandel, Bouw)"}
                    value={field1}
                    onChange={(e) => setField1(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                    style={{ background: "#fff", border: "none", boxShadow: "0 2px 12px rgba(0,0,0,.15)" }}
                    data-testid="input-wizard-field1"
                  />
                  <input
                    type="text"
                    placeholder={wizardMode === "regio" ? "Je stad of gemeente" : "Onderwerp (bijv. terrasvergunning, reclame-uiting)"}
                    value={field2}
                    onChange={(e) => setField2(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startWizard()}
                    className="w-full px-4 py-4 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                    style={{ background: "#fff", border: "none", boxShadow: "0 2px 12px rgba(0,0,0,.15)" }}
                    data-testid="input-wizard-field2"
                  />
                </div>

                <button
                  onClick={startWizard}
                  disabled={!field1.trim() || !field2.trim()}
                  className="w-full py-4 rounded-xl text-base font-black flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-30"
                  style={{ background: "#f28a1a", color: "#1b1307" }}
                  data-testid="button-wizard-start"
                >
                  Start de analyse <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,.35)" }}>
                  AI-gegenereerd inzicht op basis van openbare bronnen. Geen opslag van persoonsgegevens.
                </p>
              </div>
            </div>
          )}

          {wizardStep === "scanning" && (
            <div className="py-24 px-6 flex items-center justify-center min-h-80">
              <div className="max-w-md mx-auto text-center w-full">
                <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center relative" style={{ background: "rgba(255,255,255,.1)" }}>
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(242,138,26,.2)" }} />
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
                <p key={scanMsgIdx} className="font-bold text-white text-lg mb-2" style={{ animation: "fadeInUp .45s ease both" }} data-testid="text-scan-message">
                  {messages[scanMsgIdx]}
                </p>
                <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,.45)" }}>{field1} · {field2}</p>
                <div className="rounded-full h-2 mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,.15)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${scanProgress}%`, background: "linear-gradient(90deg, #1f5fae, #f28a1a)" }} data-testid="bar-scan-progress" />
                </div>
                <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,.4)" }}>{scanProgress}%</p>
              </div>
            </div>
          )}

          {wizardStep === "rapport" && (
            <div className="py-16 px-6">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl overflow-hidden mb-5" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.08)" }} data-testid="card-rapport">
                  <div className="px-7 py-5 flex flex-wrap items-start justify-between gap-4" style={{ background: "#0e3a70" }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-white opacity-60" />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,.55)" }}>
                          {wizardMode === "regio" ? "Regio Rapport" : "Regelgeving Rapport"}
                        </span>
                      </div>
                      <h3 className="font-black text-white text-xl leading-tight" data-testid="text-rapport-title">{field1} · {field2}</h3>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,.4)" }}>{today}</p>
                    </div>
                    <div className="flex flex-col items-center" data-testid="badge-score">
                      <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4" style={{ borderColor: scoreColor, background: `${scoreColor}18` }}>
                        <span className="font-black text-white leading-none" style={{ fontSize: "30px" }}>{score}</span>
                        <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,.5)" }}>/100</span>
                      </div>
                      <span className="text-xs font-black mt-1.5 px-2 py-0.5 rounded-full" style={{ background: `${scoreColor}25`, color: scoreColor }}>{scoreLabel}</span>
                      <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,.45)" }} data-testid="text-score-label">Zichtbaarheidsscore</span>
                    </div>
                  </div>

                  <div className="px-7 py-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                      {wizardMode === "regio" ? "Regio-analyse" : "Regelgeving-analyse"}
                    </p>
                    <div className="space-y-3" data-testid="grid-findings">
                      {sections.length > 0 ? sections.map((s, i) => {
                        const Icon = s.icon;
                        return (
                          <div key={i} className="rounded-xl p-4" style={{ background: s.bg }} data-testid={`finding-${i}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                              <span className="text-xs font-black uppercase tracking-widest" style={{ color: s.color }}>{s.tag}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{s.content}</p>
                          </div>
                        );
                      }) : (
                        <div className="rounded-xl p-4 text-sm text-slate-500 leading-relaxed" style={{ background: "#f8fafd" }}>
                          {antwoord}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-7 pb-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Pro-inzichten</p>
                    <div className="space-y-2.5">
                      {(wizardMode === "regio" ? [
                        `Concurrentieanalyse: wie zijn de 3 sterkste spelers als ${field1} in ${field2} en wat doen zij beter?`,
                        `Subsidie- en fondsencheck: welke gemeentelijke regelingen zijn beschikbaar voor ${field1} in ${field2}?`,
                      ] : [
                        `Historisch handhavingsoverzicht: hoe heeft de gemeente dit onderwerp de afgelopen 2 jaar gehandhaafd?`,
                        `Bezwaar- en beroepsmogelijkheden: welke stappen kun je zetten als je het niet eens bent met een beslissing?`,
                      ]).map((text, i) => (
                        <div key={i} className="relative flex items-center gap-3 p-3.5 rounded-xl overflow-hidden cursor-pointer" style={{ border: "1.5px dashed #e2e8f0", background: "#f8fafd" }} onClick={() => window.location.href = "/lidmaatschap"} data-testid={`locked-insight-${i}`}>
                          <Lock className="w-4 h-4 flex-shrink-0 text-slate-400" />
                          <span className="text-sm text-slate-400 select-none" style={{ filter: "blur(3.5px)" }}>{text}</span>
                          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(31,95,174,.1)", color: "#1f5fae" }}>Pro</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {antwoord && (
                    <div className="border-t border-slate-100">
                      <button className="w-full flex items-center justify-between px-7 py-3.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setShowFullText(!showFullText)} data-testid="button-toggle-full-text">
                        <span>Volledige analyse bekijken</span>
                        {showFullText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {showFullText && (
                        <div className="px-7 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-50" data-testid="text-full-antwoord">{antwoord}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.07)", border: "1.5px solid rgba(31,95,174,.12)" }} data-testid="card-rapport-cta">
                  <p className="font-black text-slate-900 mb-1" style={{ fontSize: "18px" }}>Ontgrendel het volledige rapport</p>
                  <p className="text-slate-400 text-sm mb-5">Krijg toegang tot alle Pro-inzichten, persoonlijke signalen en je volledige regionaal profiel.</p>
                  <Link href="/lidmaatschap">
                    <button className="w-full py-4 rounded-xl text-base font-black text-white transition-opacity hover:opacity-90 mb-3" style={{ background: "#f28a1a" }} data-testid="button-rapport-cta">
                      Bekijk lidmaatschap <ChevronRight className="w-4 h-4 inline" />
                    </button>
                  </Link>
                  <button onClick={resetWizard} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mx-auto" data-testid="button-rapport-reset">
                    <RotateCcw className="w-3.5 h-3.5" /> Doe de check opnieuw
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ─── HOE HET WERKT ─── */}
        <section id="hoe-het-werkt" className="mx-auto max-w-7xl px-6 py-20" data-testid="section-hoe-het-werkt">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Hoe het werkt</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">In 3 stappen aan de slag</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Profiel aanmaken", text: "Maak een eenvoudig profiel van je bedrijf of organisatie. Kies je sector, regio en wat je aanbiedt." },
              { step: "2", title: "Regio en aanbod invullen", text: "Laat zien waar je actief bent en wat je aanbiedt. Volg ook signalen en regelgeving die relevant zijn." },
              { step: "3", title: "Gevonden worden en contacten leggen", text: "Word zichtbaar in jouw regio en leg direct contact met klanten, gemeenten en partners." },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TARIEVEN ─── */}
        <section id="tarieven" className="bg-slate-900 text-white" data-testid="section-tarieven">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">Lid worden & tarieven</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Kies het pakket dat past bij jouw regio-aanpak
              </h2>
              <p className="mt-3 text-slate-400 text-sm">Transparante tarieven. Maandelijks opzegbaar.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: "Basis",
                  price: "€12,95",
                  period: "/maand",
                  desc: "Voor ondernemers die meedoen en zichtbaar worden",
                  features: [
                    "Bedrijfsprofiel & aanwezigheid op platform",
                    "Basis zichtbaarheid in de regio",
                    "Eerste signalen en updates",
                    "Brief analyse (beperkt)",
                    "RegioBot (beperkt)",
                  ],
                  highlight: false,
                  cta: "Kies Basis",
                  href: "/lidmaatschap?plan=basic",
                },
                {
                  name: "Pro",
                  price: "€24",
                  period: "/maand",
                  desc: "Voor ondernemers die actief informatievoordeel willen",
                  features: [
                    "Alles van Basis",
                    "Diepere zichtbaarheidsscans",
                    "Regelgeving en Woo-inzichten",
                    "Brief analyse (volledig)",
                    "RegioBot onbeperkt",
                    "Dossiers bouwen en beheren",
                  ],
                  highlight: true,
                  cta: "Kies Pro — Aanbevolen",
                  href: "/lidmaatschap?plan=pro",
                },
                {
                  name: "Regio Groei",
                  price: "Op aanvraag",
                  period: "",
                  desc: "Voor organisaties en grotere regionale samenwerkingen",
                  features: [
                    "Voor organisaties en grotere samenwerkingen",
                    "Regionale matches op maat",
                    "Maatwerk ondersteuning",
                    "Directe accountmanager",
                  ],
                  highlight: false,
                  cta: "Neem contact op",
                  href: "mailto:info@openregio.nl",
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 flex flex-col ${plan.highlight ? "bg-sky-600 shadow-2xl shadow-sky-900/30" : "border border-white/10 bg-white/5"}`}
                  data-testid={`card-plan-${plan.name.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm opacity-70">{plan.desc}</p>
                  <p className="mt-4 text-4xl font-extrabold">
                    {plan.price}
                    {plan.period && <span className="text-base font-normal opacity-70">{plan.period}</span>}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm leading-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.href}
                    className={`mt-8 inline-block rounded-xl px-5 py-3.5 text-center font-semibold transition-colors ${plan.highlight ? "bg-white text-sky-700 hover:bg-slate-100" : "bg-white text-slate-900 hover:bg-slate-100"}`}
                    data-testid={`button-plan-${plan.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>

            {/* FAQ in tarieven */}
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-bold mb-6">Veelgestelde vragen</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { q: "Kan ik opzeggen?", a: "Ja, je kunt maandelijks opzeggen. Geen gedoe." },
                  { q: "Hoe snel kan ik starten?", a: "Direct na aanmelding kun je je profiel vullen en zichtbaar worden." },
                  { q: "Is er maatwerk mogelijk?", a: "Ja, voor regio's en organisaties is maatwerk mogelijk via Regio Groei." },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="font-semibold">{item.q}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── VOORBEELDEN ─── */}
        <section id="voorbeelden" className="mx-auto max-w-7xl px-6 py-20" data-testid="section-voorbeelden">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Voorbeelden</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Zo kan OpenRegio eruitzien in de praktijk
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { name: "Jan", company: "Aannemer uit Haarlem", text: "Meer lokale aanvragen zonder afhankelijk te zijn van grote platforms. Ik word nu direct gevonden." },
              { name: "Lisa", company: "Coach uit Amsterdam", text: "Sneller contact met klanten en organisaties in de buurt. De signalen helpen me om relevant te blijven." },
              { name: "Mark", company: "Webbouwer uit Utrecht", text: "Nieuwe samenwerkingen via regionale zichtbaarheid. Ik had dit eerder moeten doen." },
            ].map((item) => (
              <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" data-testid={`card-testimonial-${item.name.toLowerCase()}`}>
                <p className="text-lg leading-8 text-slate-700">"{item.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-sky-700">{item.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── START VANDAAG ─── */}
        <section id="contact" className="bg-emerald-50" data-testid="section-cta">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Start vandaag</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">
              Lokaal zichtbaar worden begint met één stap
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Maak je profiel aan en laat zien wat jij in jouw regio te bieden hebt.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row flex-wrap">
              <a
                href="#basischeck"
                className="rounded-2xl bg-emerald-600 px-6 py-4 font-semibold text-white hover:bg-emerald-700 transition-colors"
                data-testid="button-cta-basischeck"
              >
                Doe de gratis Basischeck
              </a>
              <a
                href="#tarieven"
                className="rounded-2xl bg-sky-600 px-6 py-4 font-semibold text-white hover:bg-sky-700 transition-colors"
                data-testid="button-cta-aanmelden"
              >
                Meld je aan als ondernemer
              </a>
              <a
                href="mailto:info@openregio.nl"
                className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold text-slate-900 hover:bg-white transition-colors"
                data-testid="button-cta-contact"
              >
                <Mail className="inline w-4 h-4 mr-2" />
                Neem contact op
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 bg-white" data-testid="footer">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={footerLogoImg} alt="OpenRegio" className="h-9 w-auto opacity-60" />
            <span className="text-xs text-slate-400">Grip op regels, zichtbaarheid en kansen in je regio</span>
          </div>
          <nav className="flex flex-wrap gap-4">
            <a href="#wat-is-openregio" className="hover:text-slate-900 transition-colors" data-testid="link-footer-wat-is">Wat is OpenRegio</a>
            <a href="#tarieven" className="hover:text-slate-900 transition-colors" data-testid="link-footer-tarieven">Tarieven</a>
            <a href="#voorbeelden" className="hover:text-slate-900 transition-colors" data-testid="link-footer-voorbeelden">Voorbeelden</a>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors" data-testid="link-footer-privacy">Privacy</Link>
          </nav>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Nederland</div>
            <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> info@openregio.nl</div>
            <span>© {new Date().getFullYear()} OpenRegio</span>
          </div>
        </div>
      </footer>

      {/* ─── COOKIE BANNER ─── */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white" style={{ boxShadow: "0 -4px 24px rgba(0,0,0,.08)" }} data-testid="cookie-banner">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500" style={{ maxWidth: "540px" }}>
              Wij gebruiken cookies om je ervaring te verbeteren. Lees ons{" "}
              <Link href="/cookiebeleid" className="underline text-slate-700" data-testid="link-cookie-policy">cookiebeleid</Link>.
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleCookieChoice(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors" data-testid="button-cookie-reject">Weigeren</button>
              <button onClick={() => handleCookieChoice(true)} className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#1f5fae" }} data-testid="button-cookie-accept">Accepteren</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
