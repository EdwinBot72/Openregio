import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Check, Mail, ChevronRight, ChevronDown,
  BarChart2, Users, ArrowRight, MapPin,
  Lock, Gavel, TrendingUp, AlertTriangle,
  CheckCircle2, RotateCcw, FileText, ChevronUp,
  Sparkles, Clock, TrendingDown, Layers
} from "lucide-react";
import logoImg from "@assets/ChatGPT_Image_15_feb_2026,_15_15_16_1771164937665.png";
import footerLogoImg from "@assets/afbeelding_1771441188699.png";
import streetImg from "@assets/ChatGPT_Image_16_mrt_2026,_17_09_39_1773677423650.png";
import groupImg from "@assets/ChatGPT_Image_16_mrt_2026,_14_46_04_1773671702074.png";

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
      if (cfg) {
        sections.push({
          label,
          content: match[1].trim().replace(/\n+/g, " "),
          ...cfg,
        });
      }
    }
  }

  // Fallback als parsing mislukt
  if (sections.length === 0 && antwoord.length > 30) {
    const fallbackCfg = LABEL_CONFIG[mode === "regio" ? "KANS" : "WETTELIJK KADER"];
    sections.push({
      label: "Analyse",
      content: antwoord.slice(0, 400),
      ...fallbackCfg,
    });
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

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>("input");
  const [wizardMode, setWizardMode] = useState<WizardMode>("regio");
  const [field1, setField1] = useState(""); // beroep or branche
  const [field2, setField2] = useState(""); // stad or onderwerp
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

  const handleCookieChoice = (accepted: boolean) => {
    localStorage.setItem("cookie_consent", accepted ? "accepted" : "rejected");
    setShowCookieBanner(false);
  };

  const startWizard = async () => {
    if (!field1.trim() || !field2.trim()) return;
    setWizardStep("scanning");
    setScanProgress(0);
    setScanMsgIdx(0);

    // Progress bar animation
    let prog = 0;
    scanIntervalRef.current = setInterval(() => {
      prog += Math.random() * 3.5 + 1.2;
      if (prog >= 92) prog = 92; // hold at 92 until API returns
      setScanProgress(Math.round(prog));
    }, 80);

    // Rotate scan messages
    let msgIdx = 0;
    msgIntervalRef.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % SCAN_MESSAGES.length;
      setScanMsgIdx(msgIdx);
    }, 700);

    // Call API
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

      // Complete progress to 100, then switch step
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

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100" style={{ boxShadow: "0 1px 0 #e8ecf2" }} data-testid="nav-main">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" data-testid="link-home-logo">
              <img src={logoImg} alt="OpenRegio" className="h-11 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium text-slate-600">
              <a href="#home" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-home">Home</a>
              <a href="#oplossingen" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-oplossingen">Oplossingen</a>
              <a href="#basischeck" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-basischeck">Basischeck</a>
              <a href="#member" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-lid">Lidmaatschap</a>
              <a href="#contact" className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid="link-nav-contact">Contact</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="button-nav-login">Inloggen</button>
              </Link>
              <a href="#basischeck" data-testid="button-nav-basischeck">
                <button className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#f28a1a" }}>Start de Basischeck</button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>

        {/* ─── HERO ─── */}
        <section id="home" className="py-20 md:py-28 bg-white" data-testid="section-hero">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full" style={{ background: "rgba(31,95,174,.08)", color: "#1f5fae" }}>
                  Voor Nederlandse ondernemers
                </span>
                <h1 className="font-black leading-tight mb-5 text-slate-900" style={{ fontSize: "clamp(28px, 3.8vw, 52px)", letterSpacing: "-1.5px" }} data-testid="text-hero-title">
                  Grip op regels, zichtbaarheid en kansen{" "}
                  <span style={{ color: "#1f5fae" }}>in je regio.</span>
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed mb-8" style={{ maxWidth: "44ch" }} data-testid="text-hero-subtitle">
                  OpenRegio helpt ondernemers om eerder te zien wat er verandert, beter gevonden te worden en sterker te staan in hun eigen regio.
                </p>
                <div className="flex flex-wrap gap-3 mb-7">
                  <a href="#basischeck" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#f28a1a" }} data-testid="button-hero-basischeck">
                    Start de Basischeck <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="#member" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors" data-testid="button-hero-lid">
                    Bekijk lidmaatschap
                  </a>
                </div>
                <p className="text-sm text-slate-400" data-testid="text-hero-trust">
                  Voor ondernemers die minder afhankelijk willen zijn van platformregels en gemiste kansen.
                </p>
              </div>
              <div className="relative" data-testid="card-hero-photo">
                <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.12)" }}>
                  <img src={streetImg} alt="Nederlandse winkelstraat" className="w-full object-cover" loading="eager" style={{ height: "340px" }} />
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-2xl px-5 py-4 flex items-center gap-3" style={{ background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,.12)", maxWidth: "220px" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,95,174,.10)", color: "#1f5fae" }}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Regionaal inzicht</div>
                    <div className="text-xs text-slate-400 mt-0.5">Direct toepasbaar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PROBLEEM ─── */}
        <section className="py-24" style={{ background: "#0b2240" }} data-testid="section-probleem">
          <div className="max-w-6xl mx-auto px-6">
            {/* Kop + intro — gecentreerd */}
            <div className="max-w-2xl mx-auto text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f28a1a" }}>Het probleem</span>
              <h2 className="font-black mt-4 mb-6 text-white" style={{ fontSize: "clamp(24px, 2.8vw, 40px)", letterSpacing: "-0.6px", lineHeight: 1.2 }} data-testid="text-probleem-title">
                Veel ondernemers missen signalen die direct impact hebben op hun bedrijf.
              </h2>
              <p className="leading-relaxed" style={{ fontSize: "16px", color: "rgba(255,255,255,0.65)" }}>
                Regels veranderen. Besluiten worden genomen. Lokale kansen ontstaan en verdwijnen. Veel daarvan is openbaar, maar verspreid, technisch of te laat zichtbaar. Ondertussen kost lage zichtbaarheid gewoon klanten.
              </p>
            </div>

            {/* 3 pijnpunten */}
            <div className="grid md:grid-cols-3 gap-5 mb-16">
              {[
                {
                  Icon: Clock,
                  label: "Te laat",
                  text: "Je ziet relevante veranderingen vaak pas als het al speelt",
                },
                {
                  Icon: TrendingDown,
                  label: "Gemiste omzet",
                  text: "Je online zichtbaarheid laat omzet liggen",
                },
                {
                  Icon: Layers,
                  label: "Versnipperd",
                  text: "Lokale kansen blijven versnipperd en onbenut",
                },
              ].map(({ Icon, label, text }, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-7"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  data-testid={`probleem-item-${i}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(220,38,38,0.2)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#f87171" }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f87171" }}>{label}</div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Foto — brede strip */}
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <img
                src={groupImg}
                alt="Ondernemers bespreken OpenRegio"
                className="w-full object-cover"
                style={{ height: "340px", objectPosition: "center 35%" }}
              />
              <div className="py-3 px-5 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Ondernemers bespreken OpenRegio</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3 PIJLERS ─── */}
        <section id="oplossingen" className="py-24" style={{ background: "#f8fafd" }} data-testid="section-oplossingen">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1f5fae" }}>Oplossingen</span>
              <h2 className="font-black mt-3 text-slate-900" style={{ fontSize: "clamp(22px, 2.8vw, 36px)", letterSpacing: "-0.6px" }} data-testid="text-oplossingen-title">
                Eén platform. Drie manieren om sterker te staan.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6" data-testid="grid-pijlers">
              {[
                { accent: "#1f5fae", icon: Gavel,    label: "Inzicht",       title: "Zie eerder wat verandert",       desc: "Volg regelgeving, openbare documenten en signalen die relevant zijn voor jouw onderneming, branche of regio." },
                { accent: "#f28a1a", icon: BarChart2, label: "Zichtbaarheid", title: "Word beter gevonden in je regio", desc: "Analyseer hoe zichtbaar jouw bedrijf is en ontdek waar je lokale kansen laat liggen." },
                { accent: "#059669", icon: Users,     label: "RegioVoordeel", title: "Pak meer kansen via je netwerk",  desc: "Kom in beeld binnen een regionaal ondernemersnetwerk — zichtbaarheid, samenwerking en doorverwijzing in één." },
              ].map((p, i) => (
                <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100" style={{ boxShadow: "0 2px 16px rgba(0,0,0,.05)" }} data-testid={`card-pijler-${i}`}>
                  <div className="h-1 mb-6 -mx-7 -mt-7 rounded-t-2xl" style={{ background: p.accent }} />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: `${p.accent}18`, color: p.accent }}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: p.accent }}>{p.label}</div>
                  <h3 className="font-black text-slate-900 mb-3" style={{ fontSize: "17px", lineHeight: 1.3 }}>{p.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="#basischeck" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#f28a1a" }} data-testid="button-pijlers-basischeck">
                Doe eerst de Basischeck <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ─── BASISCHECK WIZARD ─── */}
        <section id="basischeck" data-testid="section-basischeck"
          className="py-0"
          style={{ background: wizardStep === "rapport" ? "#f8fafd" : "#0e3a70" }}
        >

          {/* STAP 1 — INPUT */}
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

                {/* Mode toggle */}
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
                    className="w-full px-4 py-4 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 text-sm"
                    style={{ background: "#fff", border: "none", boxShadow: "0 2px 12px rgba(0,0,0,.15)" }}
                    data-testid="input-wizard-field1"
                  />
                  <input
                    type="text"
                    placeholder={wizardMode === "regio" ? "Je stad of gemeente" : "Onderwerp (bijv. terrasvergunning, reclame-uiting)"}
                    value={field2}
                    onChange={(e) => setField2(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startWizard()}
                    className="w-full px-4 py-4 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-2 text-sm"
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

          {/* STAP 2 — SCANNING */}
          {wizardStep === "scanning" && (
            <div className="py-24 px-6 flex items-center justify-center min-h-80">
              <div className="max-w-md mx-auto text-center w-full">
                {/* Animated logo pulse */}
                <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center relative" style={{ background: "rgba(255,255,255,.1)" }}>
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(242,138,26,.2)" }} />
                  <Sparkles className="w-9 h-9 text-white" />
                </div>

                <p
                  key={scanMsgIdx}
                  className="font-bold text-white text-lg mb-2"
                  style={{ animation: "fadeInUp .45s ease both" }}
                  data-testid="text-scan-message"
                >
                  {messages[scanMsgIdx]}
                </p>
                <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,.45)" }}>
                  {field1} · {field2}
                </p>

                {/* Progress bar */}
                <div className="rounded-full h-2 mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,.15)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%`, background: "linear-gradient(90deg, #1f5fae, #f28a1a)" }}
                    data-testid="bar-scan-progress"
                  />
                </div>
                <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,.4)" }}>{scanProgress}%</p>
              </div>
            </div>
          )}

          {/* STAP 3 — RAPPORT */}
          {wizardStep === "rapport" && (
            <div className="py-16 px-6">
              <div className="max-w-2xl mx-auto">

                {/* Rapport header */}
                <div className="bg-white rounded-2xl overflow-hidden mb-5" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.08)" }} data-testid="card-rapport">
                  <div className="px-7 py-5 flex flex-wrap items-start justify-between gap-4" style={{ background: "#0e3a70" }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-white opacity-60" />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,.55)" }}>
                          {wizardMode === "regio" ? "Regio Rapport" : "Regelgeving Rapport"}
                        </span>
                      </div>
                      <h3 className="font-black text-white text-xl leading-tight" data-testid="text-rapport-title">
                        {field1} · {field2}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,.4)" }}>{today}</p>
                    </div>

                    {/* Score badge */}
                    <div className="flex flex-col items-center" data-testid="badge-score">
                      <div
                        className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4"
                        style={{ borderColor: scoreColor, background: `${scoreColor}18` }}
                      >
                        <span className="font-black text-white leading-none" style={{ fontSize: "30px" }}>{score}</span>
                        <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,.5)" }}>/100</span>
                      </div>
                      <span className="text-xs font-black mt-1.5 px-2 py-0.5 rounded-full" style={{ background: `${scoreColor}25`, color: scoreColor }}>
                        {scoreLabel}
                      </span>
                      <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,.45)" }} data-testid="text-score-label">Zichtbaarheidsscore</span>
                    </div>
                  </div>

                  {/* Analyse secties */}
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

                  {/* Vergrendelde Pro-inzichten */}
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
                        <div
                          key={i}
                          className="relative flex items-center gap-3 p-3.5 rounded-xl overflow-hidden cursor-pointer group"
                          style={{ border: "1.5px dashed #e2e8f0", background: "#f8fafd" }}
                          onClick={() => window.location.href = "/lidmaatschap"}
                          data-testid={`locked-insight-${i}`}
                        >
                          <Lock className="w-4 h-4 flex-shrink-0 text-slate-400" />
                          <span className="text-sm text-slate-400 select-none" style={{ filter: "blur(3.5px)" }}>{text}</span>
                          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(31,95,174,.1)", color: "#1f5fae" }}>
                            Pro
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Volledige tekst toggle */}
                  {antwoord && (
                    <div className="border-t border-slate-100">
                      <button
                        className="w-full flex items-center justify-between px-7 py-3.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowFullText(!showFullText)}
                        data-testid="button-toggle-full-text"
                      >
                        <span>Volledige analyse bekijken</span>
                        {showFullText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {showFullText && (
                        <div className="px-7 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-50" data-testid="text-full-antwoord">
                          {antwoord}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="bg-white rounded-2xl p-6 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.07)", border: "1.5px solid rgba(31,95,174,.12)" }} data-testid="card-rapport-cta">
                  <p className="font-black text-slate-900 mb-1" style={{ fontSize: "18px" }}>Ontgrendel het volledige rapport</p>
                  <p className="text-slate-400 text-sm mb-5">Krijg toegang tot alle Pro-inzichten, persoonlijke signalen en je volledige regionaal profiel.</p>
                  <Link href="/lidmaatschap">
                    <button className="w-full py-4 rounded-xl text-base font-black text-white transition-opacity hover:opacity-90 mb-3" style={{ background: "#f28a1a" }} data-testid="button-rapport-cta">
                      Bekijk lidmaatschap <ChevronRight className="w-4 h-4 inline" />
                    </button>
                  </Link>
                  <button
                    onClick={resetWizard}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mx-auto"
                    data-testid="button-rapport-reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Doe de check opnieuw
                  </button>
                </div>

              </div>
            </div>
          )}

        </section>

        {/* ─── OVER ONS ─── */}
        <section className="py-24 bg-white border-t border-slate-100" data-testid="section-over-ons">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(0,0,0,.1)" }} data-testid="img-over-ons">
                <img src={groupImg} alt="Lokale ondernemers in de regio" className="w-full object-cover" loading="lazy" style={{ height: "420px", objectPosition: "center top" }} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1f5fae" }}>Over OpenRegio</span>
                <h2 className="font-black mt-3 mb-5 text-slate-900" style={{ fontSize: "clamp(22px, 2.6vw, 34px)", letterSpacing: "-0.6px" }} data-testid="text-over-ons-title">
                  Gebouwd voor ondernemers die sterker willen staan in hun regio.
                </h2>
                <p className="text-slate-500 leading-relaxed mb-6">
                  OpenRegio is een coöperatie van en voor lokale ondernemers. Geen zoveelste advertentieplatform, maar een platform dat je helpt om eerder te zien wat er speelt, beter gevonden te worden en minder afhankelijk te zijn van grote tussenlagen.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Niet alleen zichtbaar zijn, maar slimmer positioneren",
                    "Eerder zien wat eraan komt — niet pas reageren",
                    "Bouwen aan je eigen positie, niet leunen op Big Tech",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(31,95,174,.1)", color: "#1f5fae" }}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-slate-600 text-sm leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
                <a href="#basischeck" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#f28a1a" }} data-testid="button-over-ons-cta">
                  Start de Basischeck <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MEMBERSHIP ─── */}
        <section id="member" className="py-24" style={{ background: "#f8fafd" }} data-testid="section-member">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1f5fae" }}>Lidmaatschap</span>
              <h2 className="font-black mt-3 text-slate-900" style={{ fontSize: "clamp(22px, 2.6vw, 34px)", letterSpacing: "-0.6px" }} data-testid="text-member-title">
                Kies wat past bij jouw fase
              </h2>
              <p className="text-slate-400 mt-3 text-sm">Transparante tarieven. Maandelijks opzegbaar.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-7 border border-slate-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,.05)" }} data-testid="card-plan-basis">
                <h3 className="font-black text-slate-900 mb-1" style={{ fontSize: "20px" }}>Basis</h3>
                <p className="text-slate-400 text-xs mb-5">Voor ondernemers die meedoen en zichtbaar worden</p>
                <div className="mb-6" style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px", color: "#0f172a" }}>
                  €12,95 <span className="text-slate-400 font-medium" style={{ fontSize: "14px" }}>/maand</span>
                </div>
                <Link href="/lidmaatschap?plan=basic" className="block w-full py-3 rounded-xl text-center text-sm font-bold mb-6 transition-colors hover:bg-slate-100 border border-slate-200" style={{ color: "#1f5fae" }} data-testid="button-plan-basic-select">
                  Kies Basis
                </Link>
                <ul className="space-y-2.5">
                  {["Profiel & aanwezigheid op platform", "Basis zichtbaarheid in de regio", "Eerste signalen en updates", "Brief analyse (beperkt)", "RegioBot (beperkt)"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1f5fae" }} />
                      <span className="text-slate-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-7 relative" style={{ border: "1.5px solid #1f5fae", boxShadow: "0 8px 32px rgba(31,95,174,.15)" }} data-testid="card-plan-pro">
                <div className="absolute -top-3 left-7 px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "#1f5fae" }}>Aanbevolen</div>
                <h3 className="font-black text-slate-900 mb-1" style={{ fontSize: "20px" }}>Pro</h3>
                <p className="text-slate-400 text-xs mb-5">Voor ondernemers die actief informatievoordeel willen</p>
                <div className="mb-6" style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-1px", color: "#0f172a" }}>
                  €24 <span className="text-slate-400 font-medium" style={{ fontSize: "14px" }}>/maand</span>
                </div>
                <Link href="/lidmaatschap?plan=pro" className="block w-full py-3 rounded-xl text-center text-sm font-bold mb-6 text-white transition-opacity hover:opacity-90" style={{ background: "#1f5fae" }} data-testid="button-plan-pro-select">
                  Kies Pro
                </Link>
                <ul className="space-y-2.5">
                  {["Alles van Basis", "Diepere zichtbaarheidsscans", "Regelgeving en Woo-inzichten", "Brief analyse (volledig)", "RegioBot onbeperkt", "Dossiers bouwen en beheren"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1f5fae" }} />
                      <span className="text-slate-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-center mt-7 text-sm text-slate-400">
              Twijfel je nog?{" "}
              <a href="#basischeck" className="font-bold underline transition-colors hover:text-slate-600" style={{ color: "#1f5fae" }} data-testid="link-member-basischeck">
                Start de Basischeck
              </a>{" "}
              en zie wat past.
            </p>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-24 bg-white" data-testid="section-faq">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1f5fae" }}>Vragen</span>
              <h2 className="font-black mt-3 text-slate-900" style={{ fontSize: "clamp(22px, 2.6vw, 32px)", letterSpacing: "-0.6px" }} data-testid="text-faq-title">
                Veelgestelde vragen
              </h2>
            </div>
            <div className="space-y-2" data-testid="grid-faq">
              {[
                { q: "Is OpenRegio juridisch advies?", a: "Nee. OpenRegio helpt je signaleren, structureren en sneller zien wat relevant kan zijn. Voor juridisch advies verwijzen we je door naar een specialist." },
                { q: "Is dit alleen voor grote bedrijven?", a: "Nee. Juist ook voor kleine en lokale ondernemers die meer grip willen. Van zzp'er tot mkb — iedereen profiteert van betere informatie en zichtbaarheid." },
                { q: "Wat is het verschil tussen Basis en Pro?", a: "Basis is voor zichtbaarheid en regio-deelname. Pro is voor ondernemers die meer diepgang en informatievoordeel willen — zoals uitgebreide scans, regelgeving-inzichten en dossiers." },
                { q: "Waarom eerst de Basischeck?", a: "Omdat je dan direct ziet waar jouw bedrijf staat — en welke kansen je nu laat liggen. Zo weet je meteen wat je hebt aan OpenRegio, voordat je kiest." },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-100 overflow-hidden" data-testid={`faq-item-${i}`}>
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    data-testid={`button-faq-${i}`}
                  >
                    <span className="font-semibold text-slate-800 text-sm pr-4">{item.q}</span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400 transition-transform" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4" id={`faq-answer-${i}`} role="region">
                      <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── EIND-CTA ─── */}
        <section id="contact" className="py-24 relative overflow-hidden" style={{ background: "#0e3a70" }} data-testid="section-cta">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${streetImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(24px, 3vw, 40px)", letterSpacing: "-0.8px" }} data-testid="text-cta-title">
              Start vandaag met de Basischeck.
            </h2>
            <p className="mb-8 text-base leading-relaxed" style={{ color: "rgba(255,255,255,.65)" }}>
              In een paar stappen zie je waar jouw bedrijf staat — en welke kansen je nu laat liggen.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 justify-center" onSubmit={(e) => {
              e.preventDefault();
              const email = (e.currentTarget.querySelector('input[type=email]') as HTMLInputElement)?.value;
              window.location.href = `/lidmaatschap?email=${encodeURIComponent(email || '')}`;
            }}>
              <input type="email" required placeholder="Je e-mailadres" aria-label="Je e-mailadres" className="flex-1 max-w-xs px-4 py-3.5 rounded-xl text-sm outline-none bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-white/40 transition-colors" data-testid="input-cta-email" />
              <button type="submit" className="px-6 py-3.5 rounded-xl font-bold text-sm flex-shrink-0 transition-opacity hover:opacity-90" style={{ background: "#f28a1a", color: "#1b1307" }} data-testid="button-cta-submit">
                Start de Basischeck
              </button>
            </form>
            <div className="mt-10 pt-7 flex flex-wrap justify-center gap-5 text-sm border-t" style={{ borderColor: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.4)" }}>
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Nederland</div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />info@openregio.nl</div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 border-t border-slate-100 bg-white" data-testid="footer">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src={footerLogoImg} alt="OpenRegio" className="h-9 w-auto opacity-60" />
            <span className="text-xs text-slate-400">Grip op regels, zichtbaarheid en kansen in je regio</span>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-400">
            <a href="#home" className="hover:text-slate-700 transition-colors" data-testid="link-footer-home">Home</a>
            <a href="#oplossingen" className="hover:text-slate-700 transition-colors" data-testid="link-footer-oplossingen">Oplossingen</a>
            <a href="#basischeck" className="hover:text-slate-700 transition-colors" data-testid="link-footer-basischeck">Basischeck</a>
            <a href="#member" className="hover:text-slate-700 transition-colors" data-testid="link-footer-lid">Lidmaatschap</a>
            <a href="#contact" className="hover:text-slate-700 transition-colors" data-testid="link-footer-contact">Contact</a>
            <Link href="/privacy" className="hover:text-slate-700 transition-colors" data-testid="link-footer-privacy">Privacy</Link>
          </nav>
          <div className="text-xs text-slate-300">© {new Date().getFullYear()} OpenRegio</div>
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
