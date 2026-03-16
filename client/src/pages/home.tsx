import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Activity, Bot, Scale, Check, Mail, Phone, MapPinned, Search, Loader2,
  Target, Gavel, ScanText, AlertCircle, Eye, TrendingUp,
  CheckCircle2, ChevronRight, ChevronDown, BarChart2, Users, Zap, Shield,
  Lightbulb, Building2, Briefcase, Store
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

      {/* ── 1. STICKY NAV ── */}
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
              <a href="#oplossingen" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-oplossingen">Oplossingen</a>
              <a href="#basischeck" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-basischeck">Basischeck</a>
              <a href="#member" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-lid">Lidmaatschap</a>
              <a href="#contact" className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100" data-testid="link-nav-contact">Contact</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-semibold" data-testid="button-nav-login">Inloggen</Button>
              </Link>
              <a href="#basischeck">
                <Button size="sm" className="text-sm font-bold rounded-full px-5" style={{ background: "#f28a1a", color: "#1b1307" }} data-testid="button-nav-basischeck">
                  Start de Basischeck
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>

        {/* ── 2. HERO ── */}
        <section id="home" className="hero relative" data-testid="section-hero">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="grid md:grid-cols-[1fr_1fr] gap-12 py-20 md:py-28 items-center">
              <div>
                <h1
                  className="font-black leading-tight mb-5"
                  style={{ fontSize: "clamp(30px, 4vw, 50px)", letterSpacing: "-1px", color: "#fff" }}
                  data-testid="text-hero-title"
                >
                  Grip op regels, zichtbaarheid en kansen{" "}
                  <span style={{ color: "#f28a1a" }}>in je regio.</span>
                </h1>
                <p
                  className="mb-8"
                  style={{ color: "rgba(255,255,255,.82)", fontSize: "17px", lineHeight: 1.75, maxWidth: "48ch" }}
                  data-testid="text-hero-subtitle"
                >
                  OpenRegio helpt ondernemers om eerder te zien wat er verandert, beter gevonden te worden en sterker te staan in hun eigen regio.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <a
                    href="#basischeck"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-black"
                    style={{ background: "#f28a1a", color: "#1b1307" }}
                    data-testid="button-hero-basischeck"
                  >
                    Start de Basischeck
                  </a>
                  <a
                    href="#member"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-black"
                    style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.22)" }}
                    data-testid="button-hero-lid"
                  >
                    Bekijk lidmaatschap
                  </a>
                </div>
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: "13px", lineHeight: 1.6, maxWidth: "50ch" }} data-testid="text-hero-trust">
                  Voor ondernemers die minder afhankelijk willen zijn van platformregels, onduidelijke besluiten en gemiste lokale kansen.
                </p>
              </div>

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
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,.70)", fontWeight: 700, marginLeft: "6px" }}>OpenRegio Dashboard</span>
                </div>
                <div className="p-4 space-y-2" style={{ background: "#f0f4f8" }}>
                  {[
                    { icon: ScanText, label: "Brief analyse", hint: "Begrijp overheidsbrieven direct", bg: "#2563eb" },
                    { icon: Gavel, label: "Verborgen info opvragen", hint: "Officiële overheidsinfo ophalen", bg: "#1f5fae" },
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

        {/* ── 3. PROBLEEM / HERKENNING ── */}
        <section id="probleem" className="py-16" style={{ background: "#fff", borderTop: "1px solid #e8ecf2" }} data-testid="section-probleem">
          <div className="max-w-[860px] mx-auto px-6 text-center">
            <h2 className="font-black mb-5" style={{ fontSize: "clamp(22px, 2.8vw, 32px)", letterSpacing: "-0.4px", color: "#0f172a" }} data-testid="text-probleem-title">
              Veel ondernemers missen signalen die direct impact hebben op hun bedrijf.
            </h2>
            <p className="mb-8" style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.75, maxWidth: "62ch", margin: "0 auto" }}>
              Regels veranderen. Besluiten worden genomen. Lokale kansen ontstaan en verdwijnen. Veel daarvan is openbaar, maar verspreid, technisch of te laat zichtbaar. Ondertussen kost lage zichtbaarheid gewoon klanten.
            </p>
            <div className="grid sm:grid-cols-3 gap-5" data-testid="grid-probleem-bullets">
              {[
                { icon: AlertCircle, text: "Je ziet relevante veranderingen vaak pas als het al speelt" },
                { icon: Eye, text: "Je online zichtbaarheid laat omzet liggen" },
                { icon: Zap, text: "Lokale kansen blijven versnipperd en onbenut" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 text-left flex items-start gap-3"
                  style={{ background: "#f8fafc", border: "1px solid #e8ecf2" }}
                  data-testid={`card-probleem-${i}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f28a1a" }} />
                  <span style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. DRIE PIJLERS ── */}
        <section id="oplossingen" className="py-20" style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2" }} data-testid="section-oplossingen">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px", color: "#0f172a" }} data-testid="text-oplossingen-title">
                Eén platform. Drie manieren om sterker te staan.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6" data-testid="grid-pijlers">
              {[
                {
                  icon: Gavel,
                  color: "#1f5fae",
                  bg: "rgba(31,95,174,.08)",
                  accentBg: "#1f5fae",
                  title: "Inzicht",
                  subtitle: "Zie eerder wat verandert",
                  desc: "Volg regelgeving, openbare documenten en signalen die relevant kunnen zijn voor jouw onderneming, branche of regio.",
                },
                {
                  icon: BarChart2,
                  color: "#f28a1a",
                  bg: "rgba(242,138,26,.08)",
                  accentBg: "#f28a1a",
                  title: "Zichtbaarheid",
                  subtitle: "Word beter gevonden in je regio",
                  desc: "Krijg inzicht in hoe zichtbaar jouw bedrijf echt is en waar je lokale kansen laat liggen.",
                },
                {
                  icon: Users,
                  color: "#059669",
                  bg: "rgba(5,150,105,.08)",
                  accentBg: "#059669",
                  title: "RegioVoordeel",
                  subtitle: "Pak meer kansen via je netwerk",
                  desc: "Kom in beeld binnen een regionaal ondernemersnetwerk waar zichtbaarheid, samenwerking en doorverwijzing samenkomen.",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}
                  data-testid={`card-pijler-${i}`}
                >
                  <div style={{ height: "4px", background: p.accentBg }} />
                  <div className="p-7">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: p.bg, color: p.color }}>
                      <p.icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: p.color }}>{p.title}</div>
                    <h3 className="font-black mb-2" style={{ fontSize: "18px", color: "#0f172a" }}>{p.subtitle}</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7 }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a
                href="#basischeck"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black"
                style={{ background: "#f28a1a", color: "#1b1307" }}
                data-testid="button-pijlers-basischeck"
              >
                Doe eerst de Basischeck <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ── 5. BASISCHECK ── */}
        <section id="basischeck" className="py-20" style={{ background: "#fff", borderTop: "1px solid #e8ecf2" }} data-testid="section-basischeck">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px", color: "#0f172a" }} data-testid="text-basischeck-title">
                Begin met de Basischeck
              </h2>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7, maxWidth: "58ch", margin: "0 auto" }}>
                In een paar stappen zie je waar jouw bedrijf nu staat op het gebied van zichtbaarheid, informatiepositie en regionale kansen. Zonder gedoe, gewoon helder.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-testid="grid-basischeck-benefits">
              {[
                { icon: Search, text: "Een eerste scan van de huidige situatie" },
                { icon: Lightbulb, text: "Zicht op gemiste kansen" },
                { icon: Target, text: "Een duidelijk vervolgadvies" },
                { icon: CheckCircle2, text: "Inzicht of Basis of Pro beter past" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-4 flex flex-col items-center text-center gap-2" style={{ background: "#f8fafc", border: "1px solid #e8ecf2" }} data-testid={`basischeck-benefit-${i}`}>
                  <item.icon className="w-5 h-5" style={{ color: "#1f5fae" }} />
                  <span style={{ fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8" style={{ borderRight: "1px solid #e2e8f0" }}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(242,138,26,.12)", color: "#f28a1a" }}>
                      <Target className="w-4 h-4" />
                    </div>
                    <h3 className="font-black" style={{ fontSize: "16px", color: "#0f172a" }}>Regio-analyse</h3>
                  </div>
                  <p className="mb-4" style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6 }}>
                    Vul je beroep en stad in voor een snelle analyse: concurrentie, kansen en je eerste stap.
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="Je beroep (bijv. Bakker)" aria-label="Je beroep" value={botBeroep} onChange={(e) => setBotBeroep(e.target.value)} className="text-sm" data-testid="input-bot-beroep" />
                    <Input placeholder="Je stad" aria-label="Je stad" value={botStad} onChange={(e) => setBotStad(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleBotVraag()} className="text-sm" data-testid="input-bot-stad" />
                    <Button onClick={handleBotVraag} disabled={botLoading || !botBeroep.trim() || !botStad.trim()} className="w-full font-bold text-sm" style={{ background: "#1f5fae" }} data-testid="button-bot-vraag">
                      {botLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse loopt...</> : <><Search className="w-4 h-4 mr-2" />Analyseer mijn regio</>}
                    </Button>
                    {botAntwoord && (
                      <div className="rounded-lg p-3 text-sm leading-relaxed" style={{ background: "rgba(31,95,174,.05)", border: "1px solid rgba(31,95,174,.12)", color: "#334155" }} data-testid="text-bot-antwoord">
                        {botAntwoord}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(31,95,174,.10)", color: "#1f5fae" }}>
                      <Scale className="w-4 h-4" />
                    </div>
                    <h3 className="font-black" style={{ fontSize: "16px", color: "#0f172a" }}>Regelgeving-check</h3>
                  </div>
                  <p className="mb-4" style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6 }}>
                    Vul je branche en een onderwerp in — je krijgt direct uitleg over welke wet geldt en welke stap je kunt zetten.
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="Je branche (bijv. Horeca)" aria-label="Je branche" value={regelgevingBranche} onChange={(e) => setRegelgevingBranche(e.target.value)} className="text-sm" data-testid="input-regelgeving-branche" />
                    <Input placeholder="Onderwerp (bijv. terrasvergunning)" aria-label="Onderwerp" value={regelgevingOnderwerp} onChange={(e) => setRegelgevingOnderwerp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRegelgevingCheck()} className="text-sm" data-testid="input-regelgeving-onderwerp" />
                    <Button onClick={handleRegelgevingCheck} disabled={regelgevingLoading || !regelgevingBranche.trim() || !regelgevingOnderwerp.trim()} className="w-full font-bold text-sm" style={{ background: "#1f5fae" }} data-testid="button-regelgeving-check">
                      {regelgevingLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse loopt...</> : <><Scale className="w-4 h-4 mr-2" />Controleer regelgeving</>}
                    </Button>
                    {regelgevingAntwoord && (
                      <div className="rounded-lg p-3 text-sm leading-relaxed" style={{ background: "rgba(31,95,174,.05)", border: "1px solid rgba(31,95,174,.12)", color: "#334155" }} data-testid="text-regelgeving-antwoord">
                        {regelgevingAntwoord}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center mt-5" style={{ color: "#94a3b8", fontSize: "13px" }}>
              Laagdrempelig. Praktisch. Gericht op actie.
            </p>
          </div>
        </section>

        {/* ── 6. BEWIJS / DEMO ── */}
        <section className="py-20" style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2" }} data-testid="section-bewijs">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(22px, 2.8vw, 34px)", letterSpacing: "-0.4px", color: "#0f172a" }} data-testid="text-bewijs-title">
                Zo ziet grip eruit in de praktijk
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6" data-testid="grid-bewijs">
              {[
                {
                  icon: Gavel,
                  color: "#1f5fae",
                  bg: "rgba(31,95,174,.08)",
                  accentBg: "#1f5fae",
                  label: "Regelgeving-signaal",
                  desc: "Relevant besluit of wijziging gespot in jouw regio of branche.",
                  example: "Nieuw bestemmingsplan vastgesteld — impact op horecavergunningen in centrum.",
                },
                {
                  icon: BarChart2,
                  color: "#f28a1a",
                  bg: "rgba(242,138,26,.08)",
                  accentBg: "#f28a1a",
                  label: "Zichtbaarheidsscan",
                  desc: "Je bedrijf scoort laag op lokale vindbaarheid en laat aanvragen liggen.",
                  example: "Google Maps: profiel onvolledig — 3 concurrenten scoren hoger in jouw regio.",
                },
                {
                  icon: TrendingUp,
                  color: "#059669",
                  bg: "rgba(5,150,105,.08)",
                  accentBg: "#059669",
                  label: "Kansensignaal",
                  desc: "Nieuwe samenwerking, opdracht of regiokans zichtbaar.",
                  example: "Gemeente opent subsidieregeling voor lokale verduurzaming — aanvragen mogelijk.",
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }} data-testid={`card-bewijs-${i}`}>
                  <div style={{ height: "3px", background: item.accentBg }} />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-black" style={{ fontSize: "15px", color: "#0f172a" }}>{item.label}</span>
                    </div>
                    <p className="mb-4" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
                    <div className="rounded-lg px-4 py-3" style={{ background: item.bg, fontSize: "13px", color: "#334155", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{item.example}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center mt-8" style={{ color: "#64748b", fontSize: "14px" }}>
              Geen vaag verhaal, maar concrete signalen waar je iets mee kunt.
            </p>
          </div>
        </section>

        {/* ── 7. VOOR WIE ── */}
        <section id="voor-wie" className="py-20" style={{ background: "#fff", borderTop: "1px solid #e8ecf2" }} data-testid="section-voor-wie">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(22px, 2.8vw, 34px)", letterSpacing: "-0.4px", color: "#0f172a" }} data-testid="text-voorwie-title">
                Voor ondernemers die niet achter de feiten aan willen lopen
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6" data-testid="grid-voor-wie">
              {[
                {
                  icon: Store,
                  color: "#1f5fae",
                  bg: "rgba(31,95,174,.08)",
                  title: "Lokale ondernemers",
                  desc: "Die beter gevonden willen worden en meer grip willen op hun regio.",
                },
                {
                  icon: Shield,
                  color: "#f28a1a",
                  bg: "rgba(242,138,26,.08)",
                  title: "Ondernemers in gereguleerde markten",
                  desc: "Die eerder willen zien wat beleid, besluiten of regels kunnen betekenen.",
                },
                {
                  icon: Briefcase,
                  color: "#059669",
                  bg: "rgba(5,150,105,.08)",
                  title: "Onafhankelijke ondernemers",
                  desc: "Die minder afhankelijk willen zijn van grote platforms en liever bouwen op hun eigen positie en netwerk.",
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-7 text-center" style={{ background: "#f8fafc", border: "1px solid #e8ecf2" }} data-testid={`card-voor-wie-${i}`}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: item.bg, color: item.color }}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-black mb-2" style={{ fontSize: "17px", color: "#0f172a" }}>{item.title}</h3>
                  <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. LIDMAATSCHAP ── */}
        <section id="member" className="py-20" style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf2" }} data-testid="section-member">
          <div className="max-w-[880px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-black mb-3" style={{ fontSize: "clamp(24px, 3vw, 36px)", letterSpacing: "-0.5px" }} data-testid="text-member-title">Kies wat past bij jouw fase</h2>
              <p style={{ color: "#64748b", fontSize: "16px" }}>Transparante tarieven, geen verrassingen.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-8 bg-white" style={{ border: "1.5px solid #dbe4f0" }} data-testid="card-plan-basis">
                <h3 className="font-black mb-1" style={{ fontSize: "22px" }}>Basis</h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>Voor ondernemers die zichtbaar willen zijn en regionaal mee willen doen</p>
                <div className="mb-6" style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1px" }}>
                  €12,95 <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>/ maand</span>
                </div>
                <Link href="/lidmaatschap?plan=basic" className="block w-full rounded-xl py-3 text-center font-bold text-sm mb-6" style={{ background: "rgba(31,95,174,.08)", color: "#1f5fae", border: "1px solid rgba(31,95,174,.18)" }} data-testid="button-plan-basic-select">
                  Kies Basis
                </Link>
                <ul className="space-y-3">
                  {["Profiel en aanwezigheid op het platform", "Basis zichtbaarheid in je regio", "Toegang tot netwerkvoordelen", "Eerste signalen en updates", "Brief analyse (beperkt)", "RegioBot (beperkt)"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#1f5fae" }} />
                      <span style={{ fontSize: "14px", color: "#334155" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl p-8 bg-white relative" style={{ border: "1.5px solid rgba(242,138,26,.45)" }} data-testid="card-plan-pro">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "#1f5fae" }}>Populair</div>
                <h3 className="font-black mb-1" style={{ fontSize: "22px" }}>Pro</h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>Voor ondernemers die actief informatievoordeel willen pakken</p>
                <div className="mb-6" style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1px" }}>
                  €24 <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>/ maand</span>
                </div>
                <Link href="/lidmaatschap?plan=pro" className="block w-full rounded-xl py-3 text-center font-bold text-sm mb-6" style={{ background: "rgba(242,138,26,.10)", color: "#c07010", border: "1px solid rgba(242,138,26,.28)" }} data-testid="button-plan-pro-select">
                  Kies Pro
                </Link>
                <ul className="space-y-3">
                  {["Alles van Basis", "Diepere zichtbaarheidsscans", "Regelgeving en Woo-inzichten", "Uitgebreidere signalen", "Brief analyse (volledig)", "RegioBot onbeperkt", "Dossiers bouwen en beheren"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#f28a1a" }} />
                      <span style={{ fontSize: "14px", color: "#334155" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-center mt-6" style={{ color: "#64748b", fontSize: "14px" }}>
              Twijfel je nog? <a href="#basischeck" className="font-bold underline" style={{ color: "#1f5fae" }} data-testid="link-member-basischeck">Start met de Basischeck</a> en zie wat past.
            </p>
          </div>
        </section>

        {/* ── 9. POSITIONERING ── */}
        <section className="py-20" style={{ background: "#0e3f86" }} data-testid="section-positionering">
          <div className="max-w-[860px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(22px, 2.8vw, 34px)", letterSpacing: "-0.4px" }} data-testid="text-positionering-title">
                Waarom OpenRegio anders is
              </h2>
              <p style={{ color: "rgba(255,255,255,.70)", fontSize: "16px", lineHeight: 1.7, maxWidth: "58ch", margin: "0 auto" }}>
                OpenRegio is geen zoveelste advertentieplatform of vrijblijvende community. Het is gebouwd voor ondernemers die sterker willen staan met betere informatie, meer regionale zichtbaarheid en minder afhankelijkheid van grote tussenlagen.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5" data-testid="grid-positionering">
              {[
                "Niet alleen zichtbaar zijn, maar slimmer positioneren",
                "Niet pas reageren als iets verandert, maar eerder zien wat eraan komt",
                "Niet alleen netwerken, maar ook voordeel pakken uit je regio",
                "Niet leunen op Big Tech, maar bouwen aan je eigen basis",
              ].map((text, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 flex items-start gap-3"
                  style={{ background: "rgba(255,255,255,.07)" }}
                  data-testid={`card-positionering-${i}`}
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f28a1a" }} />
                  <span style={{ fontSize: "15px", color: "rgba(255,255,255,.85)", lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. FAQ ── */}
        <section className="py-20" style={{ background: "#fff", borderTop: "1px solid #e8ecf2" }} data-testid="section-faq">
          <div className="max-w-[720px] mx-auto px-6">
            <h2 className="font-black text-center mb-10" style={{ fontSize: "clamp(22px, 2.8vw, 32px)", letterSpacing: "-0.4px", color: "#0f172a" }} data-testid="text-faq-title">
              Veelgestelde vragen
            </h2>
            <div className="space-y-3" data-testid="grid-faq">
              {[
                { q: "Is OpenRegio juridisch advies?", a: "Nee. OpenRegio helpt je signaleren, structureren en sneller zien wat relevant kan zijn. Voor juridisch advies verwijzen we je door naar een specialist." },
                { q: "Is dit alleen voor grote bedrijven?", a: "Nee. Juist ook voor kleine en lokale ondernemers die meer grip willen. Van zzp'er tot mkb — iedereen profiteert van betere informatie en zichtbaarheid." },
                { q: "Wat is het verschil tussen Basis en Pro?", a: "Basis is voor zichtbaarheid en regio-deelname. Pro is voor ondernemers die meer diepgang en informatievoordeel willen — zoals uitgebreide scans, regelgeving-inzichten en dossiers." },
                { q: "Waarom eerst de Basischeck?", a: "Omdat je dan direct ziet waar jouw grootste kansen of zwakke punten zitten. Zo weet je meteen wat je hebt aan OpenRegio — voordat je kiest." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid #e8ecf2", background: openFaq === i ? "#f8fafc" : "#fff" }}
                  data-testid={`faq-item-${i}`}
                >
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    data-testid={`button-faq-${i}`}
                  >
                    <span className="font-bold" style={{ fontSize: "15px", color: "#0f172a" }}>{item.q}</span>
                    <ChevronDown
                      className="w-5 h-5 flex-shrink-0 ml-3 transition-transform"
                      style={{ color: "#94a3b8", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                      <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 11. CTA / CONTACT ── */}
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
              Grip op regels, zichtbaarheid en kansen in je regio.
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
                aria-label="E-mailadres"
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

      {/* ── FOOTER ── */}
      <footer className="py-8" style={{ background: "#080e1e", color: "#94a3b8" }} data-testid="footer">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={footerLogoImg} alt="OpenRegio" className="h-10 w-auto opacity-80" />
            <span style={{ fontSize: "12px", color: "#475569" }}>Grip op regels, zichtbaarheid en kansen in je regio</span>
          </div>
          <nav className="flex flex-wrap gap-5 text-sm">
            <a href="#home" className="hover:text-white transition-colors" data-testid="link-footer-home">Home</a>
            <a href="#oplossingen" className="hover:text-white transition-colors" data-testid="link-footer-oplossingen">Oplossingen</a>
            <a href="#basischeck" className="hover:text-white transition-colors" data-testid="link-footer-basischeck">Basischeck</a>
            <a href="#member" className="hover:text-white transition-colors" data-testid="link-footer-lid">Lidmaatschap</a>
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
