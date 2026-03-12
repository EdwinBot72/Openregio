import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Activity, Globe, Bot, Scale, Check, Mail, Phone, MapPinned, Search, Loader2,
  Briefcase, ShoppingBag, Building2, Target, Gavel, ScanText,
  AlertCircle, Clock, EyeOff, CheckCircle2, ChevronRight, BarChart2
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
        style={{ background: "rgba(235,242,252,.97)", borderColor: "#c5d5eb", backdropFilter: "blur(12px)" }}
        data-testid="nav-main"
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center" data-testid="link-home-logo">
              <img src={logoImg} alt="OpenRegio" className="h-12 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-1" style={{ color: "#1e3a5f" }}>
              <a href="#home" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-home">Home</a>
              <a href="#diensten" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-diensten">Diensten</a>
              <a href="#probleem" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-probleem">Herken je dit?</a>
              <a href="#voor-wie" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-voorwie">Voor wie</a>
              <a href="#member" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-lid">Abonnementen</a>
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
                  Grip op regels én<br />zichtbaarheid<br />
                  <span style={{ color: "#f28a1a" }}>in je regio.</span>
                </h1>
                <p
                  className="mb-8"
                  style={{ color: "rgba(255,255,255,.82)", fontSize: "17px", lineHeight: 1.75, maxWidth: "44ch" }}
                  data-testid="text-hero-subtitle"
                >
                  OpenRegio helpt ondernemers bij twee dingen: begrijpen wat de overheid doet — WOO, brieven, regelgeving — én controleren hoe zichtbaar je bent voor klanten in je regio.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/lidmaatschap"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-black"
                    style={{ background: "#f28a1a", color: "#1b1307" }}
                    data-testid="button-hero-lid"
                  >
                    Bekijk abonnementen
                  </Link>
                  <a
                    href="#diensten"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-black"
                    style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.22)" }}
                    data-testid="button-hero-discover"
                  >
                    Ontdek meer
                  </a>
                </div>
              </div>

              {/* Dashboard preview */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,.28)" }}
                data-testid="card-hero-preview"
              >
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#1a3c6e", borderBottom: "1px solid #0e2a52" }}>
                  <div className="flex gap-1.5">
                    {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,.70)", fontWeight: 700, marginLeft: "6px", letterSpacing: ".4px" }}>OpenRegio Dashboard</span>
                </div>
                <div className="p-4 space-y-2" style={{ background: "#f0f4f8" }}>
                  {[
                    { icon: ScanText, label: "Brief analyse", hint: "Begrijp overheidsbrieven direct", bg: "#2563eb" },
                    { icon: Gavel, label: "Woo-verzoek", hint: "Vraag informatie op bij overheid", bg: "#1f5fae" },
                    { icon: BarChart2, label: "Zichtbaarheid check", hint: "Hoe vindbaar ben je in de regio?", bg: "#059669" },
                    { icon: Bot, label: "RegioBot", hint: "Stel vragen over regelgeving", bg: "#7c3aed" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: "#fff", border: "1px solid #e2e8f0" }}
                      data-testid={`hero-preview-item-${i}`}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: item.bg }}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>{item.label}</div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{item.hint}</div>
                      </div>
                      <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.bg }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. TWEE-PIJLER SECTIE ── */}
        <section id="diensten" className="py-20" style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2" }} data-testid="section-diensten">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 38px)", letterSpacing: "-0.5px", color: "#0f172a" }} data-testid="text-diensten-title">
                Twee diensten. Één platform.
              </h2>
              <p style={{ color: "#64748b", fontSize: "17px", maxWidth: "54ch", margin: "0 auto" }}>
                Wij helpen je grip krijgen op de overheid — én controleren hoe goed klanten jou online vinden.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8" data-testid="grid-diensten">

              {/* Pijler 1: WOO & Regelgeving */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }} data-testid="card-dienst-woo">
                <div style={{ height: "4px", background: "#1f5fae" }} />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(31,95,174,.10)", color: "#1f5fae" }}>
                      <Gavel className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(31,95,174,.10)", color: "#1f5fae" }}>Basis + Pro</span>
                  </div>
                  <h3 className="font-black mb-2" style={{ fontSize: "22px", color: "#0f172a" }}>WOO & Regelgeving</h3>
                  <p className="mb-6" style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.7 }}>
                    Grip op wat de overheid besluit. Brieven begrijpen, informatie opvragen, beleid volgen.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      { label: "Brieven en besluiten begrijpen", desc: "Upload een onduidelijke brief — je krijgt direct een heldere uitleg." },
                      { label: "Woo-verzoeken opstellen", desc: "Maak in een paar stappen een waterdicht verzoek om overheidsinformatie." },
                      { label: "Beleid en regelgeving volgen", desc: "Blijf op de hoogte van wijzigingen die jouw sector direct raken." },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3" data-testid={`dienst-woo-item-${i}`}>
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#1f5fae" }} />
                        <span style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                          <strong style={{ fontWeight: 700 }}>{item.label}</strong> — {item.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/lidmaatschap" className="flex items-center justify-center w-full rounded-xl py-3 font-bold text-sm text-white gap-1" style={{ background: "#1f5fae" }} data-testid="button-dienst-woo">
                    Bekijk abonnementen <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Pijler 2: Zichtbaarheid checks */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }} data-testid="card-dienst-zichtbaarheid">
                <div style={{ height: "4px", background: "#f28a1a" }} />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(242,138,26,.10)", color: "#f28a1a" }}>
                      <Activity className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(242,138,26,.10)", color: "#c07010" }}>Basis + Pro</span>
                  </div>
                  <h3 className="font-black mb-2" style={{ fontSize: "22px", color: "#0f172a" }}>Zichtbaarheid checks</h3>
                  <p className="mb-6" style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.7 }}>
                    Wij controleren hoe vindbaar jij bent in je regio — zodat je weet waar je staat.
                  </p>
                  <ul className="space-y-4 mb-6">
                    {[
                      { label: "Online zichtbaarheid meten", desc: "Hoe goed vinden klanten jou via Google, kaarten en lokale platforms?" },
                      { label: "Bedrijfsprofiel beoordelen", desc: "Check of je gegevens kloppen en compleet zijn op alle relevante plekken." },
                      { label: "Regio-analyse opvragen", desc: "Zie hoe je presteert ten opzichte van concurrenten in jouw gemeente." },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3" data-testid={`dienst-zichtbaarheid-item-${i}`}>
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f28a1a" }} />
                        <span style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                          <strong style={{ fontWeight: 700 }}>{item.label}</strong> — {item.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-6" style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                    Wil je ook actief aan je website werken? Dat doen wij via Stroombox.
                  </p>
                  <Link href="/lidmaatschap" className="flex items-center justify-center w-full rounded-xl py-3 font-bold text-sm text-white gap-1" style={{ background: "#f28a1a" }} data-testid="button-dienst-zichtbaarheid">
                    Bekijk abonnementen <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 3. PROBLEEM ── */}
        <section id="probleem" className="py-20" style={{ background: "#fff", borderTop: "1px solid #e8ecf2" }} data-testid="section-probleem">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px", color: "#0f172a" }} data-testid="text-probleem-title">
                Herken je dit?
              </h2>
              <p style={{ color: "#64748b", fontSize: "17px" }}>Dit zijn de problemen waarvoor OpenRegio is gebouwd.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6" data-testid="grid-probleem">
              {[
                { icon: AlertCircle, color: "#1f5fae", bg: "rgba(31,95,174,.08)", title: "Overheidsbrieven zijn onleesbaar", desc: "Vol jargon en juridische termen — je weet niet wat je ermee moet." },
                { icon: Clock, color: "#1f5fae", bg: "rgba(31,95,174,.08)", title: "Woo-verzoeken zijn tijdrovend", desc: "Het proces is ingewikkeld en je weet niet precies waar je recht op hebt." },
                { icon: EyeOff, color: "#f28a1a", bg: "rgba(242,138,26,.08)", title: "Klanten vinden je niet online", desc: "Je bent actief in de regio, maar online ben je nauwelijks zichtbaar." },
                { icon: Search, color: "#f28a1a", bg: "rgba(242,138,26,.08)", title: "Je weet niet hoe je scoort", desc: "Geen idee hoe je bedrijfsprofiel eruitziet voor klanten die naar je zoeken." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-7 flex items-start gap-5" style={{ background: "#f8fafc", border: "1px solid #e8ecf2" }} data-testid={`card-probleem-${i}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, color: item.color }}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black mb-1.5" style={{ fontSize: "16px", color: "#0f172a" }}>{item.title}</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. TOOLS ── */}
        <section id="oplossingen" className="py-20" style={{ background: "#0e3f86" }} data-testid="section-oplossingen">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-black mb-3 text-white" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-oplossingen-title">
                Vier tools die het verschil maken.
              </h2>
              <p style={{ color: "rgba(255,255,255,.65)", fontSize: "16px" }}>Direct inzetbaar via je dashboard.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5" data-testid="grid-oplossingen">
              {[
                { icon: ScanText, label: "Brief analyse", badge: "Gratis te proberen", badgeColor: "#1f5fae", desc: "Upload een brief — krijg direct begrijpelijke uitleg en aanbevolen actie.", border: "#2563eb" },
                { icon: Gavel, label: "Woo-verzoek", badge: "Pro", badgeColor: "#f28a1a", desc: "Genereer een compleet, juridisch kloppend Woo-verzoek in enkele stappen.", border: "#1f5fae" },
                { icon: BarChart2, label: "Zichtbaarheid check", badge: "Basis", badgeColor: "#059669", desc: "Controleer direct hoe goed klanten jou vinden op Google en lokale platforms.", border: "#f28a1a" },
                { icon: Bot, label: "RegioBot", badge: "Basis + Pro", badgeColor: "#7c3aed", desc: "Stel vragen over regels, beleid en besluiten — RegioBot antwoordt direct.", border: "#7c3aed" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 flex items-start gap-5"
                  style={{ background: "rgba(255,255,255,.07)", borderLeft: `4px solid ${item.border}` }}
                  data-testid={`card-oplossing-${i}`}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,.10)" }}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-black text-white" style={{ fontSize: "15px" }}>{item.label}</span>
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: item.badgeColor }}>{item.badge}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,.65)", lineHeight: 1.65 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. REGIO-ANALYSE (interactief) ── */}
        <section id="regio-analyse" style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2", borderBottom: "1px solid #e8ecf2" }} data-testid="section-regio-analyse">
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

        {/* ── 6. REGELGEVING-CHECK (interactief) ── */}
        <section id="regelgeving-check" style={{ background: "#fff", borderBottom: "1px solid #e8ecf2" }} data-testid="section-regelgeving-check">
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
                  <Input placeholder="Je branche (bijv. Horeca)" value={regelgevingBranche} onChange={(e) => setRegelgevingBranche(e.target.value)} className="flex-1" data-testid="input-regelgeving-branche" />
                  <Input placeholder="Onderwerp (bijv. terrasvergunning)" value={regelgevingOnderwerp} onChange={(e) => setRegelgevingOnderwerp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRegelgevingCheck()} className="flex-1" data-testid="input-regelgeving-onderwerp" />
                </div>
                <Button onClick={handleRegelgevingCheck} disabled={regelgevingLoading || !regelgevingBranche.trim() || !regelgevingOnderwerp.trim()} className="w-full font-bold" style={{ background: "#1f5fae" }} data-testid="button-regelgeving-check">
                  {regelgevingLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse loopt...</> : <><Scale className="w-4 h-4 mr-2" />Controleer regelgeving</>}
                </Button>
                {regelgevingAntwoord && (
                  <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "rgba(31,95,174,.05)", border: "1px solid rgba(31,95,174,.12)", color: "#334155" }} data-testid="text-regelgeving-antwoord">
                    {regelgevingAntwoord}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. VOOR WIE ── */}
        <section id="voor-wie" className="py-20" style={{ background: "#f8fafc" }} data-testid="section-voor-wie">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-voor-wie-title">
                Voor ondernemers die grip willen houden.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6" data-testid="grid-voor-wie">
              {[
                { icon: Briefcase, color: "#1f5fae", bg: "rgba(31,95,174,.08)", titel: "Zelfstandigen", tekst: "Je werkt alleen en hebt geen juridisch team. Wij helpen je de weg vinden in regels, brieven én je zichtbaarheid in de regio." },
                { icon: ShoppingBag, color: "#f28a1a", bg: "rgba(242,138,26,.08)", titel: "Lokale ondernemers", tekst: "Je bent geworteld in je regio. Weet wat er in de gemeente speelt en zorg dat klanten je online weten te vinden." },
                { icon: Building2, color: "#059669", bg: "rgba(5,150,105,.08)", titel: "MKB-bedrijven", tekst: "Je groeit. Hou grip op regelgeving terwijl je team uitbreidt — en check regelmatig hoe vindbaar je bent." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid #e8ecf2" }} data-testid={`card-voor-wie-${i}`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: item.bg, color: item.color }}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black mb-2" style={{ fontSize: "17px", color: "#0f172a" }}>{item.titel}</h3>
                  <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.75, margin: 0 }}>{item.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. ABONNEMENTEN ── */}
        <section id="member" className="py-20" style={{ background: "#fff", borderTop: "1px solid #e8ecf2" }} data-testid="section-member">
          <div className="max-w-[880px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-member-title">Kies jouw abonnement</h2>
              <p style={{ color: "#64748b", fontSize: "16px" }}>Transparante tarieven, geen verrassingen.</p>
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
                  {["Regio-inzicht (gemeenteupdates, beleid)", "Brief analyse (beperkt)", "RegioBot (beperkt)", "Woo uitleg & voorbeelden", "Zichtbaarheid check", "Bedrijfsprofiel"].map((f, i) => (
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
                  {["Alles van Basis", "Brief analyse (volledig)", "RegioBot onbeperkt", "Woo-verzoek genereren", "Dossiers bouwen & beheren", "Uitgebreide zichtbaarheid check", "Projecten starten in RegioCrew"].map((f, i) => (
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

        {/* ── 9. CTA ── */}
        <section
          id="contact"
          className="py-20"
          style={{ background: "linear-gradient(135deg, #0e3f86, #1a5db5)" }}
          data-testid="section-cta"
        >
          <div className="max-w-[640px] mx-auto px-6 text-center">
            <h2 className="font-black text-white mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-cta-title">
              Start met OpenRegio.
            </h2>
            <p className="mb-8" style={{ color: "rgba(255,255,255,.75)", fontSize: "16px", lineHeight: 1.7 }}>
              Begrijp wat de overheid doet — en weet hoe goed klanten jou vinden.
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
            <a href="#diensten" className="hover:text-white transition-colors" data-testid="link-footer-diensten">Diensten</a>
            <Link href="/lidmaatschap" className="hover:text-white transition-colors" data-testid="link-footer-lid">Abonnementen</Link>
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
