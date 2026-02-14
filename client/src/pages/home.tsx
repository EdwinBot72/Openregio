import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MapPin, Users, Settings, Target, MessageCircle, Check, Mail, Phone, MapPinned, Search, Bot, Send, Loader2, FileText, Scale, Shield, Building2, Leaf, AlertTriangle, Landmark, Receipt, Eye } from "lucide-react";
import sfeerbeeldImg from "@assets/pexels-thisisengineering-3861969_1771083749018.jpg";
import logoImg from "@assets/afbeelding_1771084318315.png";

const WOO_ITEMS = [
  { icon: Building2, label: "Vastgoed & Grondposities", desc: "Welke grond koopt of verkoopt de gemeente en wie profiteert?" },
  { icon: Receipt, label: "Externe Inhuur", desc: "Welke adviesbureaus verdienen aan gemeentebeleid en hoeveel?" },
  { icon: Shield, label: "Handhaving", desc: "Wordt er selectief gehandhaafd per branche en op welke criteria?" },
  { icon: Scale, label: "Subsidies & Staatssteun", desc: "Welke bedrijven krijgen subsidie en waarom juist zij?" },
  { icon: Landmark, label: "Mandaat & Delegatie", desc: "Wie heeft beslisbevoegdheid en op basis waarvan?" },
  { icon: Leaf, label: "Milieuzones", desc: "Wat is de juridische grondslag en impact op MKB?" },
  { icon: AlertTriangle, label: "Invordering & Incasso", desc: "Hoe verdient de gemeente aan boetes en deurwaarderscontracten?" },
  { icon: FileText, label: "Aanbestedingen", desc: "Stille gunningen onder de Europese drempel: wie wordt gekozen?" },
  { icon: Eye, label: "PPS-constructies", desc: "Publiek-private deals: risicoverdeling, winstdeling, contracten." },
  { icon: Receipt, label: "Parkeeropbrengsten", desc: "Hoeveel pakt de gemeente en waar gaat het geld naartoe?" },
  { icon: Shield, label: "BOA-instructies", desc: "Interne werkinstructies, bonussen en quota van handhavers." },
  { icon: Eye, label: "Cameratoezicht", desc: "Welke data wordt verzameld, door wie en hoe lang bewaard?" },
  { icon: Scale, label: "WOZ-modellen", desc: "Hoe berekent de gemeente jouw WOZ-waarde en met welke data?" },
  { icon: Landmark, label: "Lobbycontacten", desc: "Welke projectontwikkelaars en bedrijven spreken het bestuur?" },
];

export default function HomePage() {
  const [botBeroep, setBotBeroep] = useState("");
  const [botStad, setBotStad] = useState("");
  const [botAntwoord, setBotAntwoord] = useState("");
  const [botLoading, setBotLoading] = useState(false);

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
      <header className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ background: "rgba(255,255,255,.92)", borderColor: "#e6ebf2" }} data-testid="nav-main">
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="flex items-center justify-between py-3.5 gap-3">
            <Link href="/" className="flex items-center gap-2 font-black" data-testid="link-home-logo">
              <img src={logoImg} alt="OpenRegio logo" className="h-9 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-2.5 font-extrabold" style={{ color: "#0f172a" }}>
              <a href="#home" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-home">Home</a>
              <a href="#diensten" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-diensten">Pijlers</a>
              <a href="#over" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-over">Over ons</a>
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
        {/* Hero Section */}
        <section 
          id="home"
          className="hero relative"
          data-testid="section-hero"
        >
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="grid md:grid-cols-[1.2fr_.8fr] gap-4 py-14 md:py-16 items-stretch">
              <div>
                <h1 
                  className="font-black leading-[1.05] mb-2.5"
                  style={{ fontSize: "clamp(30px, 4.4vw, 54px)", letterSpacing: "-0.6px" }}
                  data-testid="text-hero-title"
                >
                  Samen bouwen<br/>aan een sterke regio
                </h1>
                <p 
                  className="mb-4"
                  style={{ color: "rgba(255,255,255,.90)", fontSize: "clamp(15px, 1.7vw, 18px)", maxWidth: "68ch" }}
                  data-testid="text-hero-subtitle"
                >
                  Oplossingen voor regionale samenwerking en innovatie. Minder praat, meer uitvoering.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Link 
                    href="/lidmaatschap"
                    className="inline-flex items-center justify-center px-4 py-3 rounded-full font-black text-sm"
                    style={{ background: "#f28a1a", color: "#1b1307", boxShadow: "0 14px 40px rgba(242,138,26,.25)" }}
                    data-testid="button-hero-lid"
                  >
                    Word lid
                  </Link>
                  <a 
                    href="#diensten"
                    className="inline-flex items-center justify-center px-4 py-3 rounded-full font-black text-sm"
                    style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}
                    data-testid="button-hero-discover"
                  >
                    Ontdek meer
                  </a>
                </div>
              </div>

              <aside 
                className="rounded-[18px] p-4"
                style={{ 
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.18)",
                  backdropFilter: "blur(8px)"
                }}
                data-testid="card-hero-toolkit"
              >
                <strong style={{ fontSize: "18px" }}>Jouw regionale toolkit</strong>

                <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                  {[
                    { label: "RegioBot", hint: "WOO & Beleid AI" },
                    { label: "RegioCrew", hint: "Regionale samenwerking" },
                    { label: "Zichtbaarheid", hint: "Lokale vindbaarheid" },
                    { label: "Back to Basis", hint: "Betrouwbaarheidscheck" },
                  ].map((pillar, i) => (
                    <div 
                      key={i}
                      className="rounded-[14px] p-3"
                      style={{ 
                        border: "1px solid rgba(255,255,255,.20)",
                        background: "rgba(255,255,255,.10)"
                      }}
                      data-testid={`pillar-hero-${i}`}
                    >
                      <div style={{ fontSize: "15px", fontWeight: 900, marginBottom: "4px" }}>{pillar.label}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,.78)" }}>{pillar.hint}</div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* RegioBot Lichtkrant */}
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

        {/* Regio-analyse */}
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
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyse loopt...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyseer mijn regio
                    </>
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

        {/* Vier Pijlers */}
        <section id="diensten" className="py-8" style={{ background: "#fff", borderBottom: "1px solid #e6ebf2" }} data-testid="section-diensten">
          <div className="max-w-[1120px] mx-auto px-4">
            <h2 className="font-bold mb-1" style={{ fontSize: "28px", letterSpacing: "-0.3px" }} data-testid="text-pijlers-title">Vier pijlers</h2>
            <p style={{ color: "#5b677a", marginBottom: "18px" }} data-testid="text-pijlers-lead">Alles wat je nodig hebt om je regio sterker te maken.</p>

            <div className="grid md:grid-cols-2 gap-3.5">
              {[
                { 
                  icon: Users, 
                  title: "RegioMarkt", 
                  desc: "Vaste regionale werkverdeling. Werk dat jij niet doet, verwijs je door naar iemand in je regio die het wél kan. Geen algoritmes, gewoon lokaal.",
                  color: "#1f5fae",
                  bg: "rgba(31,95,174,.08)",
                  border: "rgba(31,95,174,.15)",
                },
                { 
                  icon: Bot, 
                  title: "RegioBot", 
                  desc: "Toont welke regels, besluiten en mandaten er zijn. Geen advies, geen mening — alleen controleerbare documenten en wat ontbreekt.",
                  color: "#1f5fae",
                  bg: "rgba(31,95,174,.08)",
                  border: "rgba(31,95,174,.15)",
                },
                { 
                  icon: MapPin, 
                  title: "Zichtbaarheid", 
                  desc: "Zorgt dat je bedrijf correct en vindbaar is in je regio. Juiste gegevens, reviews en lokale zoekresultaten — zonder advertenties.",
                  color: "#f28a1a",
                  bg: "rgba(242,138,26,.08)",
                  border: "rgba(242,138,26,.15)",
                },
                { 
                  icon: Shield, 
                  title: "Back to Basic", 
                  desc: "Je bedrijf draait ook zonder digitale systemen. Bereikbaarheid, eenvoudige betalingen en papier als het nodig is. Betrouwbaar, altijd.",
                  color: "#f28a1a",
                  bg: "rgba(242,138,26,.08)",
                  border: "rgba(242,138,26,.15)",
                },
              ].map((pillar, i) => (
                <div 
                  key={i}
                  className="rounded-md p-4 flex gap-3.5 items-start"
                  style={{ background: pillar.bg, border: `1px solid ${pillar.border}` }}
                  data-testid={`card-pijler-${i}`}
                >
                  <div 
                    className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: pillar.color, color: "#fff" }}
                  >
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ margin: 0, fontSize: "16px" }} data-testid={`text-pijler-title-${i}`}>{pillar.title}</h3>
                    <p style={{ margin: "4px 0 0", color: "#5b677a", fontSize: "13px", lineHeight: 1.6 }}>{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sfeerbeeld */}
        <section 
          className="relative overflow-hidden" 
          style={{ height: "280px" }} 
          data-testid="section-sfeerbeeld"
        >
          <img 
            src={sfeerbeeldImg} 
            alt="Data en transparantie" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ background: "linear-gradient(90deg, rgba(14,63,134,.88), rgba(14,63,134,.55))" }} 
          />
          <div className="relative h-full flex items-center justify-center px-4">
            <div className="text-center max-w-[720px]">
              <p className="font-bold text-white" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", lineHeight: 1.5, textShadow: "0 2px 12px rgba(0,0,0,.25)", fontStyle: "italic" }} data-testid="text-sfeerbeeld-quote">
                "Zodra aannames het fundament worden van beleid, is het slechts een kwestie van tijd voordat bevoegdheid, motivering en gelijke behandeling onderuitgaan."
              </p>
            </div>
          </div>
        </section>

        {/* Waarom OpenRegio */}
        <section id="over" className="py-8" style={{ borderBottom: "1px solid #e6ebf2" }} data-testid="section-why">
          <div className="max-w-[1120px] mx-auto px-4">
            <h2 className="font-bold mb-1" style={{ fontSize: "28px", letterSpacing: "-0.3px" }} data-testid="text-why-title">Waarom OpenRegio?</h2>
            <p style={{ color: "#5b677a", marginBottom: "18px" }} data-testid="text-why-lead">Heldere waarde. Geen gedoe. Regio sterker, ondernemers draaien.</p>

            <div className="grid md:grid-cols-3 gap-3.5">
              {[
                { icon: Settings, title: "Deskundige aanpak", desc: "Structuur, uitvoering, meetbaar resultaat." },
                { icon: Target, title: "Heldere strategie", desc: "Prioriteiten en KPI's, geen eindeloze plannen." },
                { icon: MessageCircle, title: "Korte lijnen", desc: "Snel schakelen. Persoonlijk contact." },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="rounded-md p-4 flex gap-3 items-start"
                  style={{ background: "#fff", border: "1px solid #e6ebf2" }}
                  data-testid={`card-why-${i}`}
                >
                  <div 
                    className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(242,138,26,.10)", color: "#f28a1a" }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ margin: 0, fontSize: "15px" }}>{item.title}</h3>
                    <p style={{ margin: "4px 0 0", color: "#5b677a", fontSize: "13px" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership Section */}
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
              <p style={{ color: "#5b677a", margin: 0 }} data-testid="text-member-lead">Kies een plan dat bij jouw onderneming past en start vandaag nog met lokale samenwerking.</p>
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
                        style={{ 
                          background: "rgba(31,95,174,.12)",
                          color: "#1f5fae",
                          border: "1px solid rgba(31,95,174,.18)"
                        }}
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
                        style={{ 
                          background: "rgba(242,138,26,.14)",
                          color: "#f28a1a",
                          border: "1px solid rgba(242,138,26,.22)"
                        }}
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
                <h3 className="font-bold" style={{ fontSize: "30px", letterSpacing: "-0.4px", marginBottom: "8px" }} data-testid="text-cta-title">Zet de eerste stap!</h3>
                <p style={{ color: "rgba(255,255,255,.86)", marginBottom: "14px", maxWidth: "70ch" }}>
                  Start meteen met lokale samenwerking. Vul je e-mailadres in en ga door naar betaling.
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
                    Lidmaatschap starten
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
              <div 
                className="w-9 h-9 rounded-xl relative"
                style={{ 
                  background: "conic-gradient(from 200deg, #1f5fae, #3aa0ff, #f28a1a, #5ccf8a, #1f5fae)",
                  boxShadow: "0 8px 22px rgba(15,23,42,.08)"
                }}
              >
                <div className="absolute rounded-lg border" style={{ inset: "11px", borderColor: "rgba(255,255,255,.6)" }} />
              </div>
              <div>
                <div className="font-black">OpenRegio</div>
                <div style={{ fontSize: "12px", color: "rgba(229,231,235,.70)" }}>Samen bouwen aan een sterke regio</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#home" className="opacity-90 hover:opacity-100 hover:underline" data-testid="link-footer-home">Home</a>
              <span className="opacity-50">·</span>
              <a href="#diensten" className="opacity-90 hover:opacity-100 hover:underline" data-testid="link-footer-cases">Pijlers</a>
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
    </div>
  );
}
