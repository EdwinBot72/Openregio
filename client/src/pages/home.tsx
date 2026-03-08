import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  FileSearch, Activity, Globe, Bot, Scale, FileText,
  MapPin, Check, Mail, Phone, MapPinned, Search, Loader2,
  Briefcase, ShoppingBag, Building2, Target, Users
} from "lucide-react";
import logoImg from "@assets/ChatGPT_Image_15_feb_2026,_15_15_16_1771164937665.png";
import footerLogoImg from "@assets/afbeelding_1771441188699.png";

export default function HomePage() {
  const [botBeroep, setBotBeroep] = useState("");
  const [botStad, setBotStad] = useState("");
  const [botAntwoord, setBotAntwoord] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [regelgevingBranche, setRegelgevingBranche] = useState("");
  const [regelgevingOnderwerp, setRegelgevingOnderwerp] = useState("");
  const [regelgevingAntwoord, setRegelgevingAntwoord] = useState("");
  const [regelgevingLoading, setRegelgevingLoading] = useState(false);
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

  const handleRegelgevingCheck = async () => {
    if (!regelgevingBranche.trim() || !regelgevingOnderwerp.trim()) return;
    setRegelgevingLoading(true);
    setRegelgevingAntwoord("");
    try {
      const res = await fetch("/api/regelgeving/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branche: regelgevingBranche.trim(), onderwerp: regelgevingOnderwerp.trim() }),
      });
      const data = await res.json();
      setRegelgevingAntwoord(data.antwoord || data.error || "Geen antwoord ontvangen.");
    } catch {
      setRegelgevingAntwoord("Kon geen verbinding maken. Probeer het later opnieuw.");
    } finally {
      setRegelgevingLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#ffffff", color: "#0f172a" }}>

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(255,255,255,.96)", borderColor: "#e8ecf2", backdropFilter: "blur(12px)" }}
        data-testid="nav-main"
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center" data-testid="link-home-logo">
              <img src={logoImg} alt="OpenRegio" className="h-12 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-1" style={{ color: "#334155" }}>
              <a href="#home" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100" data-testid="link-nav-home">Home</a>
              <a href="#probleem" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100" data-testid="link-nav-probleem">Het probleem</a>
              <a href="#oplossingen" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100" data-testid="link-nav-oplossingen">Oplossingen</a>
              <a href="#dashboard-uitleg" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100" data-testid="link-nav-dashboard">Dashboard</a>
              <a href="#contact" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100" data-testid="link-nav-contact">Contact</a>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-semibold" data-testid="button-nav-login">Inloggen</Button>
              </Link>
              <Link href="/lidmaatschap">
                <Button size="sm" className="text-sm font-bold rounded-full px-4" style={{ background: "#1f5fae" }} data-testid="button-nav-lid">
                  Word lid
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>

        {/* ── 1. HERO ── */}
        <section id="home" className="hero relative" data-testid="section-hero">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="grid md:grid-cols-[1fr_1fr] gap-12 py-20 md:py-28 items-center">

              <div>
                <h1
                  className="font-black leading-tight mb-5"
                  style={{ fontSize: "clamp(30px, 4vw, 52px)", letterSpacing: "-1px", color: "#fff" }}
                  data-testid="text-hero-title"
                >
                  Grip op regels,<br />zichtbaarheid en<br />ondernemerschap<br />in je regio.
                </h1>
                <p
                  className="mb-8"
                  style={{ color: "rgba(255,255,255,.82)", fontSize: "17px", lineHeight: 1.75, maxWidth: "44ch" }}
                  data-testid="text-hero-subtitle"
                >
                  OpenRegio helpt ondernemers begrijpen wat er verandert, hoe je met regels omgaat en hoe je zichtbaar blijft voor klanten.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-black"
                    style={{ background: "#f28a1a", color: "#1b1307" }}
                    data-testid="button-hero-dashboard"
                  >
                    Bekijk dashboard
                  </Link>
                  <a
                    href="#probleem"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-black"
                    style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.22)" }}
                    data-testid="button-hero-discover"
                  >
                    Ontdek wat er speelt
                  </a>
                </div>
              </div>

              {/* Dashboard preview */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.28)" }}
                data-testid="card-hero-preview"
              >
                {/* Titlebar */}
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ background: "#1a3c6e", borderBottom: "1px solid #0e2a52" }}
                >
                  <div className="flex gap-1.5">
                    {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,.70)", fontWeight: 700, marginLeft: "6px", letterSpacing: ".4px" }}>OpenRegio Dashboard</span>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2" style={{ background: "#f4f6f9" }}>
                  {[
                    { icon: FileSearch, label: "Brief analyse", hint: "AI-analyse in seconden", accent: "#1f5fae", bg: "#eaf1fb" },
                    { icon: Activity, label: "Regio updates", hint: "Lokaal beleid en besluiten", accent: "#0e9062", bg: "#e6f7f1" },
                    { icon: Globe, label: "Website check", hint: "Vindbaarheid controleren", accent: "#7c3aed", bg: "#f0ebfd" },
                    { icon: Bot, label: "RegioBot", hint: "WOO & beleidsvragen", accent: "#f28a1a", bg: "#fff4e6" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: "#fff", border: "1px solid #e2e8f0" }}
                      data-testid={`hero-preview-item-${i}`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: item.bg, color: item.accent }}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>{item.label}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{item.hint}</div>
                      </div>
                      <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.accent, opacity: 0.5 }} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. PROBLEEM ── */}
        <section id="probleem" className="py-20" style={{ background: "#fff" }} data-testid="section-probleem">
          <div className="max-w-[720px] mx-auto px-6">
            <h2
              className="font-black mb-4"
              style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px", color: "#0f172a" }}
              data-testid="text-probleem-title"
            >
              Ondernemen wordt steeds ingewikkelder.
            </h2>
            <p className="mb-8" style={{ color: "#475569", fontSize: "17px", lineHeight: 1.8 }}>
              Regels veranderen, brieven zijn onduidelijk en online zichtbaarheid wordt steeds belangrijker. OpenRegio helpt dit overzichtelijk te maken.
            </p>
            <ul className="space-y-4" data-testid="list-probleem">
              {[
                "Begrijp regels en overheidsbrieven",
                "Zie wat er verandert in jouw regio",
                "Houd je bedrijf zichtbaar voor klanten",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3" data-testid={`probleem-item-${i}`}>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(31,95,174,.10)", color: "#1f5fae" }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Regio-analyse ── */}
        <section style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2", borderBottom: "1px solid #e8ecf2" }} data-testid="section-regio-analyse">
          <div className="max-w-[1100px] mx-auto px-6 py-14">
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-start">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(242,138,26,.12)", color: "#f28a1a" }}>
                    <Target className="w-4 h-4" />
                  </div>
                  <h2 className="font-black text-lg" style={{ color: "#0f172a" }} data-testid="text-regio-analyse-title">Regio-analyse</h2>
                </div>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.7 }}>
                  Vul je beroep en stad in voor een snelle analyse: concurrentie, kansen en je eerste stap.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="Je beroep (bijv. Bakker)" value={botBeroep} onChange={(e) => setBotBeroep(e.target.value)} className="flex-1" data-testid="input-bot-beroep" />
                  <Input placeholder="Je stad" value={botStad} onChange={(e) => setBotStad(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleBotVraag()} className="flex-1" data-testid="input-bot-stad" />
                </div>
                <Button onClick={handleBotVraag} disabled={botLoading || !botBeroep.trim() || !botStad.trim()} className="w-full font-bold" style={{ background: "#1f5fae" }} data-testid="button-bot-vraag">
                  {botLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse loopt...</> : <><Search className="w-4 h-4 mr-2" />Analyseer mijn regio</>}
                </Button>
                {botAntwoord && (
                  <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "rgba(31,95,174,.05)", border: "1px solid rgba(31,95,174,.12)", color: "#334155" }} data-testid="text-bot-antwoord">
                    {botAntwoord}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Regelgeving-check ── */}
        <section data-testid="section-regelgeving-check" style={{ background: "#fff", borderTop: "1px solid #e8ecf2", borderBottom: "1px solid #e8ecf2" }}>
          <div className="max-w-[1100px] mx-auto px-6 py-14">
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-start">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(31,95,174,.10)", color: "#1f5fae" }}>
                    <Scale className="w-4 h-4" />
                  </div>
                  <h2 className="font-black text-lg" style={{ color: "#0f172a" }}>Regelgeving-check</h2>
                </div>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.75 }}>
                  Vul je branche en een onderwerp in. Je krijgt direct uitleg over welke wet geldt, wat dat voor jou betekent, en welke stap je kunt zetten.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Je branche (bijv. Horeca)"
                    value={regelgevingBranche}
                    onChange={(e) => setRegelgevingBranche(e.target.value)}
                    className="flex-1"
                    data-testid="input-regelgeving-branche"
                  />
                  <Input
                    placeholder="Onderwerp (bijv. terrasvergunning)"
                    value={regelgevingOnderwerp}
                    onChange={(e) => setRegelgevingOnderwerp(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegelgevingCheck()}
                    className="flex-1"
                    data-testid="input-regelgeving-onderwerp"
                  />
                </div>
                <Button
                  onClick={handleRegelgevingCheck}
                  disabled={regelgevingLoading || !regelgevingBranche.trim() || !regelgevingOnderwerp.trim()}
                  className="w-full font-bold"
                  style={{ background: "#1f5fae" }}
                  data-testid="button-regelgeving-check"
                >
                  {regelgevingLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse loopt...</>
                    : <><Scale className="w-4 h-4 mr-2" />Controleer regelgeving</>
                  }
                </Button>
                {regelgevingAntwoord && (
                  <div
                    className="rounded-xl p-4 text-sm leading-relaxed"
                    style={{ background: "rgba(31,95,174,.05)", border: "1px solid rgba(31,95,174,.12)", color: "#334155" }}
                    data-testid="text-regelgeving-antwoord"
                  >
                    {regelgevingAntwoord}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. WAT OPENREGIO DOET — 3 kaarten ── */}
        <section id="oplossingen" className="py-20" style={{ background: "#fff" }} data-testid="section-oplossingen">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-oplossingen-title">
                Eén plek voor regels, brieven en zichtbaarheid.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6" data-testid="grid-oplossingen">
              {[
                {
                  icon: Scale,
                  titel: "Begrijp regels en brieven",
                  tekst: "Analyseer brieven, begrijp regelgeving en zie welke stappen logisch zijn.",
                  accent: "#1f5fae",
                },
                {
                  icon: Globe,
                  titel: "Houd je bedrijf zichtbaar",
                  tekst: "Controleer je website en lokale vindbaarheid zodat klanten je blijven vinden.",
                  accent: "#1f5fae",
                },
                {
                  icon: Activity,
                  titel: "Zie wat er gebeurt in je regio",
                  tekst: "Volg veranderingen in beleid, projecten, subsidies en kansen voor ondernemers.",
                  accent: "#1f5fae",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-8"
                  style={{ background: "#f8fafc", border: "1px solid #e8ecf2" }}
                  data-testid={`card-oplossing-${i}`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(31,95,174,.10)", color: item.accent }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black mb-2" style={{ fontSize: "17px", color: "#0f172a" }}>{item.titel}</h3>
                  <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.75, margin: 0 }}>{item.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. DASHBOARD SECTIE ── */}
        <section id="dashboard-uitleg" className="py-20" style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2", borderBottom: "1px solid #e8ecf2" }} data-testid="section-dashboard-uitleg">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="grid md:grid-cols-[1fr_1.1fr] gap-14 items-center">

              <div>
                <h2 className="font-black mb-4" style={{ fontSize: "clamp(22px, 2.8vw, 34px)", letterSpacing: "-0.4px", color: "#0f172a" }} data-testid="text-dashboard-title">
                  Alles overzichtelijk op één dashboard.
                </h2>
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: FileSearch, tekst: "Brieven analyseren" },
                    { icon: Activity, tekst: "Regels bekijken" },
                    { icon: Bot, tekst: "Vragen stellen" },
                    { icon: Globe, tekst: "Je website controleren" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3" data-testid={`dashboard-feature-${i}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,95,174,.08)", color: "#1f5fae" }}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold" style={{ fontSize: "15px", color: "#0f172a" }}>{item.tekst}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-black text-white" style={{ background: "#1f5fae" }} data-testid="button-dashboard-link">
                  Naar het dashboard
                </Link>
              </div>

              {/* Mockup */}
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e8ecf2", boxShadow: "0 16px 48px rgba(15,23,42,.08)" }} data-testid="mockup-dashboard">
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#1f5fae" }}>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,255,255,.28)" }} />)}
                  </div>
                  <span className="text-white font-bold text-xs ml-2">OpenRegio Dashboard</span>
                </div>
                <div className="p-6" style={{ background: "#f8fafc" }}>
                  <p className="font-bold mb-4" style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Snelle acties</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: FileSearch, label: "Analyseer brief" },
                      { icon: Activity, label: "Regio updates" },
                      { icon: Bot, label: "Stel vraag" },
                      { icon: Globe, label: "Website check" },
                    ].map((btn, i) => (
                      <div key={i} className="rounded-xl p-4 flex flex-col items-center gap-2 text-center" style={{ background: "#fff", border: "1px solid #e8ecf2" }} data-testid={`mockup-btn-${i}`}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: i < 2 ? "rgba(31,95,174,.08)" : "rgba(242,138,26,.08)", color: i < 2 ? "#1f5fae" : "#f28a1a" }}>
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

        {/* ── 5. VOOR WIE — 3 kaarten ── */}
        <section id="voor-wie" className="py-20" style={{ background: "#fff" }} data-testid="section-voor-wie">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-voor-wie-title">
                Voor ondernemers die grip willen houden.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6" data-testid="grid-voor-wie">
              {[
                {
                  icon: Briefcase,
                  titel: "Zelfstandigen",
                  tekst: "Je werkt alleen en hebt geen juridisch team. Wij helpen je de weg vinden in regels en brieven.",
                },
                {
                  icon: ShoppingBag,
                  titel: "Lokale ondernemers",
                  tekst: "Je bent geworteld in je regio. We helpen je lokaal sterk en zichtbaar te blijven.",
                },
                {
                  icon: Building2,
                  titel: "MKB-bedrijven",
                  tekst: "Je groeit. We helpen je schaalbaar grip houden op regelgeving terwijl je team uitbreidt.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-8"
                  style={{ background: "#f8fafc", border: "1px solid #e8ecf2" }}
                  data-testid={`card-voor-wie-${i}`}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(31,95,174,.08)", color: "#1f5fae" }}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black mb-2" style={{ fontSize: "17px", color: "#0f172a" }}>{item.titel}</h3>
                  <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.75, margin: 0 }}>{item.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. LID WORDEN ── */}
        <section id="member" className="py-20" style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2" }} data-testid="section-member">
          <div className="max-w-[880px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-member-title">Word lid van OpenRegio</h2>
              <p style={{ color: "#64748b", fontSize: "16px" }}>Kies een plan dat bij jouw onderneming past.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basis */}
              <div className="rounded-2xl p-8 bg-white" style={{ border: "1.5px solid #dbe4f0" }} data-testid="card-plan-basis">
                <h3 className="font-black mb-1" style={{ fontSize: "22px" }}>Basis-lid</h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>Volwaardig lid van de coöperatie</p>
                <div className="mb-6" style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1px" }}>
                  €12,95 <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>/ maand</span>
                </div>
                <Link href="/lidmaatschap?plan=basic" className="block w-full rounded-xl py-3 text-center font-bold text-sm mb-6" style={{ background: "rgba(31,95,174,.08)", color: "#1f5fae", border: "1px solid rgba(31,95,174,.18)" }} data-testid="button-plan-basic-select">
                  Kies Basis-lid
                </Link>
                <ul className="space-y-3">
                  {["Toegang tot regio updates", "Kennisbank", "Voorbeeld analyses", "Netwerk basis"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#1f5fae" }} />
                      <span style={{ fontSize: "14px", color: "#334155" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div className="rounded-2xl p-8 bg-white relative" style={{ border: "1.5px solid rgba(242,138,26,.45)" }} data-testid="card-plan-pro">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "#1f5fae" }}>Populair</div>
                <h3 className="font-black mb-1" style={{ fontSize: "22px" }}>Pro-bijdrager</h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>Alle tools, volledige toegang</p>
                <div className="mb-6" style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1px" }}>
                  €24 <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>/ maand</span>
                </div>
                <Link href="/lidmaatschap?plan=pro" className="block w-full rounded-xl py-3 text-center font-bold text-sm mb-6" style={{ background: "rgba(242,138,26,.10)", color: "#c07010", border: "1px solid rgba(242,138,26,.28)" }} data-testid="button-plan-pro-select">
                  Kies Pro-bijdrager
                </Link>
                <ul className="space-y-3">
                  {["Alles van Basis", "Document upload", "Brief analyse", "Website check"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#f28a1a" }} />
                      <span style={{ fontSize: "14px", color: "#334155" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. CTA ONDERAAN ── */}
        <section
          id="contact"
          className="py-20"
          style={{ background: "linear-gradient(135deg, #0e3f86, #1a5db5)" }}
          data-testid="section-cta"
        >
          <div className="max-w-[640px] mx-auto px-6 text-center">
            <h2 className="font-black text-white mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-cta-title">
              Ontdek wat er speelt in jouw regio.
            </h2>
            <p className="mb-8" style={{ color: "rgba(255,255,255,.75)", fontSize: "16px", lineHeight: 1.7 }}>
              Start eenvoudig en krijg overzicht in regels, brieven en zichtbaarheid.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 justify-center"
              onSubmit={(e) => {
                e.preventDefault();
                const email = (e.currentTarget.querySelector('input[type=email]') as HTMLInputElement)?.value;
                window.location.href = `/lidmaatschap?email=${encodeURIComponent(email || '')}`;
              }}
            >
              <input
                type="email"
                required
                placeholder="E-mailadres"
                className="flex-1 max-w-sm px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "none", background: "rgba(255,255,255,.12)", color: "#fff" }}
                data-testid="input-cta-email"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-black text-sm flex-shrink-0"
                style={{ background: "#f28a1a", color: "#1b1307" }}
                data-testid="button-cta-submit"
              >
                Start met OpenRegio
              </button>
            </form>
            <div className="mt-10 pt-6 flex flex-wrap justify-center gap-4 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.60)" }}>
              <div className="flex items-center gap-1.5"><MapPinned className="w-4 h-4" /> Nederland</div>
              <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> +31 (0) ...</div>
              <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> info@openregio.nl</div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="py-8" style={{ background: "#080e1e", color: "#94a3b8" }} data-testid="footer">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={footerLogoImg} alt="OpenRegio" className="h-10 w-auto opacity-80" />
            <span style={{ fontSize: "12px", color: "#475569" }}>Regelgeving transparant voor ondernemers</span>
          </div>
          <nav className="flex flex-wrap gap-5 text-sm">
            <a href="#home" className="hover:text-white transition-colors" data-testid="link-footer-home">Home</a>
            <a href="#oplossingen" className="hover:text-white transition-colors" data-testid="link-footer-oplossingen">Oplossingen</a>
            <Link href="/lidmaatschap" className="hover:text-white transition-colors" data-testid="link-footer-lid">Word lid</Link>
            <a href="#contact" className="hover:text-white transition-colors" data-testid="link-footer-contact">Contact</a>
          </nav>
          <div className="w-full flex flex-wrap gap-1 text-xs mt-2" style={{ color: "#334155" }}>
            <span>© {new Date().getFullYear()} OpenRegio.</span>
            <span style={{ color: "#1e293b" }}>·</span>
            <Link href="/privacy" className="hover:underline" data-testid="link-footer-privacy">Privacybeleid</Link>
            <span style={{ color: "#1e293b" }}>·</span>
            <Link href="/disclaimer" className="hover:underline" data-testid="link-footer-disclaimer">Disclaimer</Link>
            <span style={{ color: "#1e293b" }}>·</span>
            <Link href="/cookiebeleid" className="hover:underline" data-testid="link-footer-cookiebeleid">Cookiebeleid</Link>
          </div>
        </div>
      </footer>

      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: "rgba(8,14,30,.96)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,.08)" }} data-testid="cookie-banner">
          <div className="max-w-[1100px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm" style={{ color: "#94a3b8", maxWidth: "600px" }}>
              Wij gebruiken cookies om je ervaring te verbeteren. Lees ons{" "}
              <Link href="/cookiebeleid" className="underline" style={{ color: "#60a5fa" }} data-testid="link-cookie-policy">cookiebeleid</Link>.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleCookieChoice(false)} className="text-slate-300" data-testid="button-cookie-reject">Weigeren</Button>
              <Button size="sm" onClick={() => handleCookieChoice(true)} style={{ background: "#1f5fae" }} className="text-white font-bold" data-testid="button-cookie-accept">Accepteren</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
