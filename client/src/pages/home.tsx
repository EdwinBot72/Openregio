import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  MapPin, Check, Mail, Phone, MapPinned, Search, Bot, Loader2,
  Scale, Shield, Building2, Leaf, AlertTriangle, Landmark, Receipt,
  FileText, Eye, Activity, FileSearch, Globe, Users, ClipboardList,
  Briefcase, ShoppingBag, Target
} from "lucide-react";
import logoImg from "@assets/ChatGPT_Image_15_feb_2026,_15_15_16_1771164937665.png";
import footerLogoImg from "@assets/afbeelding_1771441188699.png";

const WOO_ITEMS = [
  { icon: Building2, label: "Vastgoed & Grondposities" },
  { icon: Receipt, label: "Externe Inhuur" },
  { icon: Shield, label: "Handhaving" },
  { icon: Scale, label: "Subsidies & Staatssteun" },
  { icon: Landmark, label: "Mandaat & Delegatie" },
  { icon: Leaf, label: "Milieuzones" },
  { icon: AlertTriangle, label: "Invordering & Incasso" },
  { icon: FileText, label: "Aanbestedingen" },
  { icon: Eye, label: "PPS-constructies" },
  { icon: Receipt, label: "Parkeeropbrengsten" },
  { icon: Shield, label: "BOA-instructies" },
  { icon: Eye, label: "Cameratoezicht" },
  { icon: Scale, label: "WOZ-modellen" },
  { icon: Landmark, label: "Lobbycontacten" },
];

export default function HomePage() {
  const [botBeroep, setBotBeroep] = useState("");
  const [botStad, setBotStad] = useState("");
  const [botAntwoord, setBotAntwoord] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShowCookieBanner(true);
  }, []);

  const handleCookieChoice = (accepted: boolean) => {
    localStorage.setItem("cookie_consent", accepted ? "accepted" : "rejected");
    setShowCookieBanner(false);
  };

  const handleBotVraag = async () => {
    if (!botBeroep.trim() || !botStad.trim()) return;
    setBotLoading(true);
    setBotAntwoord("");
    try {
      const res = await fetch("/api/regiobot/buurman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beroep: botBeroep.trim(), stad: botStad.trim() }),
      });
      const data = await res.json();
      setBotAntwoord(data.antwoord || data.error || "Geen antwoord ontvangen.");
    } catch {
      setBotAntwoord("Kon geen verbinding maken. Probeer het later opnieuw.");
    } finally {
      setBotLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#f5f7fb", color: "#0f172a" }}>

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ background: "rgba(245,247,251,.97)", borderColor: "#e6ebf2" }} data-testid="nav-main">
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="flex items-center justify-between py-3.5 gap-3">
            <Link href="/" className="flex items-center gap-2 font-black" data-testid="link-home-logo">
              <img src={logoImg} alt="OpenRegio logo" className="h-16 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-2.5 font-extrabold" style={{ color: "#0f172a" }}>
              <a href="#home" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-home">Home</a>
              <a href="#probleem" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-probleem">Het probleem</a>
              <a href="#diensten" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-diensten">Oplossingen</a>
              <a href="#dashboard-uitleg" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-dashboard">Dashboard</a>
              <a href="#contact" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-contact">Contact</a>
            </nav>

            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="button-nav-login">Inloggen</Button>
              </Link>
              <Link
                href="/lidmaatschap"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-black text-white text-sm"
                style={{ background: "#1f5fae", boxShadow: "0 14px 40px rgba(31,95,174,.25)" }}
                data-testid="button-nav-lid"
              >
                Word lid
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>

        {/* ── 1. HERO ── */}
        <section
          id="home"
          className="hero relative"
          data-testid="section-hero"
        >
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="grid md:grid-cols-[1.2fr_.8fr] gap-4 py-14 md:py-16 items-stretch">
              <div>
                <h1
                  className="font-black leading-[1.05] mb-3"
                  style={{ fontSize: "clamp(28px, 4.2vw, 52px)", letterSpacing: "-0.6px" }}
                  data-testid="text-hero-title"
                >
                  Grip op regels,<br />zichtbaarheid en<br />ondernemerschap<br />in je regio.
                </h1>
                <p
                  className="mb-5"
                  style={{ color: "rgba(255,255,255,.90)", fontSize: "clamp(15px, 1.7vw, 17px)", maxWidth: "60ch", lineHeight: 1.7 }}
                  data-testid="text-hero-subtitle"
                >
                  OpenRegio helpt ondernemers begrijpen wat er verandert, hoe je met regels omgaat en hoe je zichtbaar blijft voor klanten.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-full font-black text-sm"
                    style={{ background: "#f28a1a", color: "#1b1307", boxShadow: "0 14px 40px rgba(242,138,26,.30)" }}
                    data-testid="button-hero-dashboard"
                  >
                    Bekijk dashboard
                  </Link>
                  <a
                    href="#probleem"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-full font-black text-sm"
                    style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}
                    data-testid="button-hero-discover"
                  >
                    Ontdek wat er speelt
                  </a>
                </div>
              </div>

              <aside
                className="rounded-[18px] p-5"
                style={{
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.18)",
                  backdropFilter: "blur(8px)"
                }}
                data-testid="card-hero-toolkit"
              >
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,.70)", marginBottom: "12px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>Alles op één plek</p>
                <div className="space-y-2.5">
                  {[
                    { icon: FileSearch, label: "Brief analyse", hint: "AI-analyse in seconden" },
                    { icon: Activity, label: "Regio updates", hint: "Lokaal beleid en besluiten" },
                    { icon: Globe, label: "Website check", hint: "Vindbaarheid controleren" },
                    { icon: Bot, label: "RegioBot", hint: "WOO & beleidsvragen" },
                  ].map((tool, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-[12px] px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.14)" }}
                      data-testid={`pillar-hero-${i}`}
                    >
                      <tool.icon className="w-4 h-4 flex-shrink-0" style={{ color: "#f28a1a" }} />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 900 }}>{tool.label}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,.65)" }}>{tool.hint}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Lichtkrant ticker ── */}
        <section className="overflow-hidden" style={{ background: "#f5f7fb", borderBottom: "1px solid #e6ebf2" }} data-testid="section-lichtkrant">
          <div className="py-2">
            <div className="relative">
              <div
                className="flex gap-5 animate-scroll"
                style={{ width: "max-content" }}
                data-testid="lichtkrant-ticker"
              >
                {[...WOO_ITEMS, ...WOO_ITEMS].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 flex-shrink-0"
                    data-testid={`lichtkrant-item-${i}`}
                  >
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1f5fae" }} />
                    <span className="text-xs" style={{ color: "#5b677a" }}>{item.label}</span>
                    <span style={{ color: "#d1d5db" }}>&middot;</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <style>{`
            @keyframes scroll-ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll-ticker 60s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
        </section>

        {/* ── 2. HET PROBLEEM ── */}
        <section id="probleem" className="py-12" style={{ background: "#f5f7fb", borderBottom: "1px solid #e6ebf2" }} data-testid="section-probleem">
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-black mb-2" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.3px", color: "#0f172a" }} data-testid="text-probleem-title">
                Ondernemen wordt steeds ingewikkelder.
              </h2>
              <p style={{ color: "#5b677a", fontSize: "16px" }}>Ondernemers hebben elke dag te maken met:</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4" data-testid="grid-problemen">
              {[
                {
                  icon: Scale,
                  titel: "Ingewikkelde regels en vergunningen",
                  tekst: "Nieuwe wetgeving, lokale verordeningen — te veel om bij te houden terwijl je gewoon je werk wilt doen.",
                  accent: "#1f5fae",
                  bg: "rgba(31,95,174,.06)",
                },
                {
                  icon: FileText,
                  titel: "Onduidelijke brieven van de overheid",
                  tekst: "Juridisch taalgebruik zonder duidelijke actie of termijn. Je weet niet wat je moet doen of wanneer.",
                  accent: "#1f5fae",
                  bg: "rgba(31,95,174,.06)",
                },
                {
                  icon: Globe,
                  titel: "Digitale afhankelijkheid",
                  tekst: "Steeds meer afhankelijk van grote platforms voor klanten en zichtbaarheid. Terwijl jij het werk doet.",
                  accent: "#f28a1a",
                  bg: "rgba(242,138,26,.06)",
                },
                {
                  icon: ClipboardList,
                  titel: "Groeiende administratielast",
                  tekst: "Meer formulieren, meer regels, meer verantwoording. Minder tijd voor je echte werk.",
                  accent: "#f28a1a",
                  bg: "rgba(242,138,26,.06)",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 flex gap-4 items-start"
                  style={{ background: "#fff", border: "1px solid #e6ebf2" }}
                  data-testid={`card-probleem-${i}`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: item.bg, color: item.accent }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ fontSize: "15px", color: "#0f172a" }}>{item.titel}</h3>
                    <p style={{ fontSize: "13.5px", color: "#5b677a", lineHeight: 1.7, margin: 0 }}>{item.tekst}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center mt-6 font-bold" style={{ color: "#1f5fae", fontSize: "16px", fontStyle: "italic" }} data-testid="text-probleem-bridge">
              OpenRegio helpt dit overzichtelijk te maken.
            </p>
          </div>
        </section>

        {/* ── Regio-analyse (interactief) ── */}
        <section className="py-8" style={{ background: "#fff", borderBottom: "1px solid #e6ebf2" }} data-testid="section-regio-analyse">
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-start">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(242,138,26,.12)", color: "#f28a1a" }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="font-black text-xl" style={{ color: "#0f172a" }} data-testid="text-regio-analyse-title">
                    Regio-analyse
                  </h2>
                </div>
                <p style={{ color: "#5b677a", fontSize: "14px" }}>
                  Vul je beroep en stad in voor een snelle marktanalyse: concurrentie, kansen en je eerste stap.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <Input
                    placeholder="Je beroep (bijv. Bakker)"
                    value={botBeroep}
                    onChange={(e) => setBotBeroep(e.target.value)}
                    className="flex-1"
                    data-testid="input-bot-beroep"
                  />
                  <Input
                    placeholder="Je stad"
                    value={botStad}
                    onChange={(e) => setBotStad(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBotVraag()}
                    className="flex-1"
                    data-testid="input-bot-stad"
                  />
                </div>
                <Button
                  onClick={handleBotVraag}
                  disabled={botLoading || !botBeroep.trim() || !botStad.trim()}
                  className="w-full"
                  style={{ background: "#1f5fae" }}
                  data-testid="button-bot-vraag"
                >
                  {botLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse loopt...</>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" />Analyseer mijn regio</>
                  )}
                </Button>
                {botAntwoord && (
                  <div
                    className="rounded-xl p-4 text-sm leading-relaxed"
                    style={{ background: "rgba(31,95,174,.06)", border: "1px solid rgba(31,95,174,.15)", color: "#334155" }}
                    data-testid="text-bot-antwoord"
                  >
                    {botAntwoord}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. WAT OPENREGIO DOET — 3 oplossingsblokken ── */}
        <section id="diensten" className="py-12" style={{ background: "#fff", borderBottom: "1px solid #e6ebf2" }} data-testid="section-diensten">
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-black mb-2" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.3px" }} data-testid="text-diensten-title">
                Eén plek voor regels, brieven en zichtbaarheid.
              </h2>
              <p style={{ color: "#5b677a", fontSize: "15px" }}>Drie dingen die OpenRegio voor je doet.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5" data-testid="grid-diensten">
              {[
                {
                  icons: [Scale, FileSearch],
                  titel: "Begrijp regels en brieven",
                  tekst: "Lees en begrijp overheidsbrieven en regelgeving zonder juridisch jargon.",
                  sub: "Brief analyse · WOO-bibliotheek · RegioBot",
                  accent: "#1f5fae",
                  bg: "rgba(31,95,174,.07)",
                },
                {
                  icons: [Globe, MapPin],
                  titel: "Houd je bedrijf zichtbaar",
                  tekst: "Controleer je website en lokale vindbaarheid. Geen advertentiebudget nodig.",
                  sub: "Website check · Google-vindbaarheid · Lokale aanwezigheid",
                  accent: "#f28a1a",
                  bg: "rgba(242,138,26,.07)",
                },
                {
                  icons: [Users, Building2],
                  titel: "Werk samen in je regio",
                  tekst: "Leer van andere ondernemers en ontdek kansen in jouw gemeente.",
                  sub: "Ondernemersnetwerk · Aanbestedingen · Gemeente-updates",
                  accent: "#1f5fae",
                  bg: "rgba(31,95,174,.07)",
                },
              ].map((blok, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6"
                  style={{ background: blok.bg, border: `1px solid ${blok.accent}22` }}
                  data-testid={`card-dienst-${i}`}
                >
                  <div className="flex gap-2 mb-4">
                    {blok.icons.map((Icon, j) => (
                      <div
                        key={j}
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: blok.accent, color: "#fff" }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    ))}
                  </div>
                  <h3 className="font-black mb-2" style={{ fontSize: "18px", color: "#0f172a" }}>{blok.titel}</h3>
                  <p style={{ color: "#334155", fontSize: "14px", lineHeight: 1.7, marginBottom: "12px" }}>{blok.tekst}</p>
                  <p style={{ fontSize: "12px", color: blok.accent, fontWeight: 700 }}>{blok.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. GROW-sectie ── */}
        <section className="py-14" style={{ background: "linear-gradient(135deg, #0e3f86, #1f5fae)" }} data-testid="section-grow">
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="font-black text-white mb-2" style={{ fontSize: "clamp(24px, 3vw, 38px)", letterSpacing: "-0.3px" }} data-testid="text-grow-title">
                Grow — versterk je bedrijf.
              </h2>
              <p style={{ color: "rgba(255,255,255,.75)", fontSize: "16px" }}>OpenRegio helpt je groeien op vier fronten.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4" data-testid="grid-grow">
              {[
                { letter: "G", icon: Scale, titel: "Grip op regels", tekst: "Begrijp wetgeving en brieven zonder advocaat." },
                { letter: "R", icon: MapPin, titel: "Regio-inzicht", tekst: "Zie wat er verandert in jouw gemeente en regio." },
                { letter: "O", icon: Globe, titel: "Online zichtbaarheid", tekst: "Controleer je website en lokale vindbaarheid." },
                { letter: "W", icon: Users, titel: "Werk en samenwerking", tekst: "Leer van andere ondernemers in jouw regio." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 text-center"
                  style={{
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.14)",
                  }}
                  data-testid={`card-grow-${i}`}
                >
                  <div
                    className="text-4xl font-black mb-3 leading-none"
                    style={{ color: "#f28a1a", letterSpacing: "-2px" }}
                  >
                    {item.letter}
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-white mb-1" style={{ fontSize: "15px" }}>{item.titel}</h3>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,.70)", lineHeight: 1.6 }}>{item.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. DASHBOARD UITLEG ── */}
        <section id="dashboard-uitleg" className="py-12" style={{ background: "#fff", borderBottom: "1px solid #e6ebf2" }} data-testid="section-dashboard-uitleg">
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
              <div>
                <h2 className="font-black mb-3" style={{ fontSize: "clamp(22px, 2.8vw, 34px)", letterSpacing: "-0.3px", color: "#0f172a" }} data-testid="text-dashboard-title">
                  Alles overzichtelijk op één dashboard.
                </h2>
                <p className="mb-5" style={{ color: "#5b677a", fontSize: "15px", lineHeight: 1.7 }}>
                  Met het OpenRegio dashboard kun je direct aan de slag. Geen omwegen, geen onleesbare documenten.
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: FileSearch, tekst: "Brieven analyseren en begrijpen" },
                    { icon: Activity, tekst: "Regels in je regio bekijken" },
                    { icon: Bot, tekst: "Vragen stellen over procedures" },
                    { icon: Globe, tekst: "Je website controleren" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3" data-testid={`dashboard-feature-${i}`}>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(31,95,174,.10)", color: "#1f5fae" }}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold" style={{ fontSize: "14px", color: "#0f172a" }}>{item.tekst}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-full font-black text-sm text-white"
                    style={{ background: "#1f5fae" }}
                    data-testid="button-dashboard-link"
                  >
                    Naar het dashboard
                  </Link>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid #e6ebf2",
                  boxShadow: "0 20px 60px rgba(15,23,42,.12)"
                }}
                data-testid="mockup-dashboard"
              >
                {/* Header balk */}
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ background: "#1f5fae" }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,.30)" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,.30)" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,.30)" }} />
                  </div>
                  <span className="text-white font-black text-sm ml-2">OpenRegio Dashboard</span>
                </div>

                {/* Dashboard body */}
                <div className="p-5" style={{ background: "#f5f7fb" }}>
                  <p className="font-bold mb-3" style={{ fontSize: "12px", color: "#5b677a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Snelle acties</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: FileSearch, label: "Analyseer brief", color: "#1f5fae", bg: "rgba(31,95,174,.08)" },
                      { icon: Activity, label: "Regio updates", color: "#1f5fae", bg: "rgba(31,95,174,.08)" },
                      { icon: Bot, label: "Stel vraag", color: "#f28a1a", bg: "rgba(242,138,26,.08)" },
                      { icon: Globe, label: "Website check", color: "#f28a1a", bg: "rgba(242,138,26,.08)" },
                    ].map((btn, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                        style={{ background: "#fff", border: "1px solid #e6ebf2" }}
                        data-testid={`mockup-btn-${i}`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ background: btn.bg, color: btn.color }}
                        >
                          <btn.icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold" style={{ fontSize: "12px", color: "#0f172a" }}>{btn.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. VOOR WIE ── */}
        <section id="voor-wie" className="py-12" style={{ background: "#f5f7fb", borderBottom: "1px solid #e6ebf2" }} data-testid="section-voor-wie">
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-black mb-2" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.3px", color: "#0f172a" }} data-testid="text-voor-wie-title">
                Voor wie is OpenRegio?
              </h2>
              <p style={{ color: "#5b677a", fontSize: "15px" }}>Voor elke ondernemer die grip wil op regels en zichtbaarheid.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4" data-testid="grid-voor-wie">
              {[
                {
                  icon: Briefcase,
                  titel: "Zelfstandigen",
                  tekst: "Je werkt alleen en hebt geen juridisch team achter je. Wij helpen je de weg vinden in regels en brieven.",
                  accent: "#1f5fae",
                  bg: "rgba(31,95,174,.07)",
                },
                {
                  icon: ShoppingBag,
                  titel: "Lokale ondernemers",
                  tekst: "Je bent geworteld in je regio. We helpen je lokaal sterk te blijven en zichtbaar te zijn voor klanten dichtbij.",
                  accent: "#f28a1a",
                  bg: "rgba(242,138,26,.07)",
                },
                {
                  icon: Building2,
                  titel: "MKB-bedrijven",
                  tekst: "Je groeit. We helpen je schaalbaar grip te houden op regelgeving terwijl je team uitbreidt.",
                  accent: "#f28a1a",
                  bg: "rgba(242,138,26,.07)",
                },
                {
                  icon: Target,
                  titel: "Ondernemers met ambitie",
                  tekst: "Je wil niet alleen overleven — je wil begrijpen, verbeteren en vooruit. OpenRegio geeft je de tools.",
                  accent: "#1f5fae",
                  bg: "rgba(31,95,174,.07)",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 flex gap-4 items-start"
                  style={{ background: "#fff", border: "1px solid #e6ebf2" }}
                  data-testid={`card-voor-wie-${i}`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg, color: item.accent }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ fontSize: "15px", color: "#0f172a" }}>{item.titel}</h3>
                    <p style={{ fontSize: "13.5px", color: "#5b677a", lineHeight: 1.7, margin: 0 }}>{item.tekst}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. MEMBERSHIP + CTA ── */}
        <section
          id="member"
          className="py-8"
          style={{
            background: "radial-gradient(800px 500px at 10% 0%, rgba(31,95,174,.10), transparent 60%), radial-gradient(800px 500px at 90% 0%, rgba(242,138,26,.10), transparent 60%), #f5f7fb"
          }}
          data-testid="section-member"
        >
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="text-center pb-2.5">
              <h2 className="font-bold mb-2" style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }} data-testid="text-member-title">Word lid van OpenRegio</h2>
              <p style={{ color: "#5b677a", margin: 0 }} data-testid="text-member-lead">Kies een plan dat bij jouw onderneming past en start vandaag nog.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-3.5 mt-5">
              {/* Basis Plan */}
              <div
                className="rounded-[22px] p-4 relative overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "2px solid rgba(31,95,174,.35)",
                  boxShadow: "0 16px 40px rgba(15,23,42,.10)"
                }}
                data-testid="card-plan-basis"
              >
                <h3 className="font-bold" style={{ fontSize: "20px", marginBottom: "6px" }}>Basis-lid</h3>
                <p style={{ color: "#5b677a", fontSize: "13px", marginBottom: "10px" }}>Volwaardig lid van de coöperatie</p>
                <div style={{ fontSize: "34px", fontWeight: 1000, letterSpacing: "-0.4px", marginBottom: "10px" }}>
                  €12,95 <span style={{ fontSize: "14px", color: "#5b677a", fontWeight: 900 }}>excl. BTW / maand</span>
                </div>
                <Link
                  href="/lidmaatschap?plan=basic"
                  className="block w-full rounded-[14px] p-3 text-center font-black mb-3"
                  style={{
                    background: "linear-gradient(180deg, rgba(31,95,174,.08), rgba(31,95,174,.02))",
                    border: "1px solid rgba(31,95,174,.25)"
                  }}
                  data-testid="button-plan-basic-select"
                >
                  Kies Basis-lid
                </Link>
                <ul className="space-y-0">
                  {[
                    "Bedrijfsprofiel in lokaal netwerk",
                    "Ontdek en ontmoet ondernemers",
                    "Volledige stemrecht in de coöperatie",
                    "Basischeck & weerbaarheidsbadges",
                    "RegioBot & WOO-bibliotheek",
                    "Printbare overzichten",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 items-start py-2.5 font-bold"
                      style={{ borderTop: i > 0 ? "1px solid #e6ebf2" : "none" }}
                    >
                      <span
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(31,95,174,.12)", color: "#1f5fae", border: "1px solid rgba(31,95,174,.18)" }}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div
                className="rounded-[22px] p-4 relative overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "2px solid rgba(242,138,26,.40)",
                  boxShadow: "0 16px 40px rgba(15,23,42,.10)"
                }}
                data-testid="card-plan-pro"
              >
                <div
                  className="absolute top-3.5 right-3.5 px-3 py-2 rounded-full text-white font-black text-xs"
                  style={{ background: "#1f5fae", boxShadow: "0 12px 30px rgba(31,95,174,.20)" }}
                >
                  Populair
                </div>
                <h3 className="font-bold" style={{ fontSize: "20px", marginBottom: "6px" }}>Pro-bijdrager</h3>
                <p style={{ color: "#5b677a", fontSize: "13px", marginBottom: "10px" }}>Draag extra bij en krijg krachtige tools</p>
                <div style={{ fontSize: "34px", fontWeight: 1000, letterSpacing: "-0.4px", marginBottom: "10px" }}>
                  €24 <span style={{ fontSize: "14px", color: "#5b677a", fontWeight: 900 }}>excl. BTW / maand</span>
                </div>
                <Link
                  href="/lidmaatschap?plan=pro"
                  className="block w-full rounded-[14px] p-3 text-center font-black mb-3"
                  style={{
                    background: "linear-gradient(180deg, rgba(242,138,26,.10), rgba(242,138,26,.02))",
                    border: "1px solid rgba(242,138,26,.28)"
                  }}
                  data-testid="button-plan-pro-select"
                >
                  Kies Pro-bijdrager
                </Link>
                <ul className="space-y-0">
                  {[
                    "Alles van Basis-lid",
                    "RegioBot: WOO & regelgeving AI",
                    "Persoonlijke WOO-bibliotheek",
                    "Printbare overzichten",
                    "Prioriteit ondersteuning",
                    "Bouw mee aan nieuwe features",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 items-start py-2.5 font-bold"
                      style={{ borderTop: i > 0 ? "1px solid #e6ebf2" : "none" }}
                    >
                      <span
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(242,138,26,.14)", color: "#f28a1a", border: "1px solid rgba(242,138,26,.22)" }}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA Strip */}
            <div
              id="contact"
              className="mt-5 rounded-[28px] overflow-hidden grid md:grid-cols-[1.4fr_.6fr]"
              style={{
                background: "radial-gradient(900px 400px at 20% 20%, rgba(255,255,255,.22), transparent 60%), linear-gradient(135deg, #0e3f86, #1f5fae)",
                boxShadow: "0 16px 40px rgba(15,23,42,.10)",
                border: "1px solid rgba(15,23,42,.06)",
                color: "#fff"
              }}
              data-testid="section-cta"
            >
              <div className="p-6">
                <h3 className="font-bold" style={{ fontSize: "30px", letterSpacing: "-0.4px", marginBottom: "8px" }} data-testid="text-cta-title">
                  Ontdek wat er speelt in jouw regio.
                </h3>
                <p style={{ color: "rgba(255,255,255,.86)", marginBottom: "14px", maxWidth: "70ch" }}>
                  Start meteen. Vul je e-mailadres in en ga aan de slag met regelgeving, brieven en zichtbaarheid.
                </p>
                <form className="flex flex-wrap gap-2.5 items-center mt-2.5" onSubmit={(e) => { e.preventDefault(); const email = (e.currentTarget.querySelector('input[type=email]') as HTMLInputElement)?.value; window.location.href = `/lidmaatschap?email=${encodeURIComponent(email || '')}`; }}>
                  <input
                    type="email"
                    required
                    placeholder="E-mailadres"
                    className="flex-1 min-w-[260px] px-3.5 py-3.5 rounded-[14px] text-sm outline-none"
                    style={{ border: "1px solid rgba(255,255,255,.25)", background: "#fff", color: "#0f172a" }}
                    data-testid="input-cta-email"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-4 py-3.5 rounded-full font-black text-sm"
                    style={{ background: "#f28a1a", color: "#1b1307", boxShadow: "0 14px 40px rgba(242,138,26,.25)" }}
                    data-testid="button-cta-submit"
                  >
                    Start met OpenRegio
                  </button>
                </form>
                <div style={{ marginTop: "10px", color: "rgba(255,255,255,.78)", fontSize: "12px" }}>
                  Direct door naar onboarding en betaling.
                </div>
              </div>

              <div
                className="p-6 flex flex-col justify-center gap-2.5"
                style={{
                  background: "radial-gradient(700px 300px at 40% 40%, rgba(255,255,255,.14), transparent 60%), linear-gradient(135deg, rgba(242,138,26,.95), rgba(255,159,45,.92))",
                  color: "#1b1307"
                }}
              >
                <h4 className="font-bold" style={{ fontSize: "22px", margin: 0 }}>Neem contact op</h4>
                <ul className="font-black pl-4 space-y-1.5">
                  <li className="flex items-center gap-2"><MapPinned className="w-4 h-4" /> Nederland</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +31 (0) ...</li>
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@openregio.nl</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-7 py-7" style={{ background: "#0b1020", color: "#e5e7eb" }} data-testid="footer">
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3 items-center">
              <img src={footerLogoImg} alt="OpenRegio logo" className="h-14 w-auto" />
              <div>
                <div style={{ fontSize: "12px", color: "rgba(229,231,235,.70)" }}>Regelgeving transparant voor ondernemers</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#home" className="opacity-90 hover:opacity-100 hover:underline" data-testid="link-footer-home">Home</a>
              <span className="opacity-50">·</span>
              <a href="#diensten" className="opacity-90 hover:opacity-100 hover:underline" data-testid="link-footer-cases">Oplossingen</a>
              <span className="opacity-50">·</span>
              <Link href="/lidmaatschap" className="opacity-90 hover:opacity-100 hover:underline" data-testid="link-footer-lid">Word lid</Link>
              <span className="opacity-50">·</span>
              <a href="#contact" className="opacity-90 hover:opacity-100 hover:underline" data-testid="link-footer-contact">Contact</a>
            </div>
          </div>
          <div className="h-px my-3.5" style={{ background: "rgba(255,255,255,.12)" }} />
          <div className="flex flex-wrap gap-1" style={{ fontSize: "12px", color: "rgba(229,231,235,.70)" }}>
            <span>© {new Date().getFullYear()} OpenRegio — Alle rechten voorbehouden.</span>
            <span className="opacity-50">·</span>
            <Link href="/privacy" className="hover:underline hover:opacity-100" data-testid="link-footer-privacy">Privacybeleid</Link>
            <span className="opacity-50">·</span>
            <Link href="/disclaimer" className="hover:underline hover:opacity-100" data-testid="link-footer-disclaimer">Disclaimer</Link>
            <span className="opacity-50">·</span>
            <Link href="/cookiebeleid" className="hover:underline hover:opacity-100" data-testid="link-footer-cookiebeleid">Cookiebeleid</Link>
          </div>
        </div>
      </footer>

      {showCookieBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{ background: "rgba(11,16,32,.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,.10)" }}
          data-testid="cookie-banner"
        >
          <div className="max-w-[1120px] mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm" style={{ color: "#e5e7eb", maxWidth: "640px" }}>
              Wij gebruiken cookies om je ervaring te verbeteren. Lees ons{" "}
              <Link href="/cookiebeleid" className="underline" style={{ color: "#3aa0ff" }} data-testid="link-cookie-policy">cookiebeleid</Link>.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCookieChoice(false)}
                className="text-white"
                data-testid="button-cookie-reject"
              >
                Weigeren
              </Button>
              <Button
                size="sm"
                onClick={() => handleCookieChoice(true)}
                style={{ background: "#1f5fae" }}
                className="text-white"
                data-testid="button-cookie-accept"
              >
                Accepteren
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
