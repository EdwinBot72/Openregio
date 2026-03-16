import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Scale, Check, Mail, Search, Loader2, Target,
  Gavel, ScanText, ChevronRight, ChevronDown,
  BarChart2, Users, Shield, Briefcase, Store,
  Clock, ArrowRight, MapPin, Eye
} from "lucide-react";
import logoImg from "@assets/ChatGPT_Image_15_feb_2026,_15_15_16_1771164937665.png";
import footerLogoImg from "@assets/afbeelding_1771441188699.png";
import streetImg from "@assets/5dab2418-3038-4262-b4a0-233a5081e835_1773671805585.png";
import groupImg from "@assets/ChatGPT_Image_16_mrt_2026,_14_46_04_1773671702074.png";

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
  const [activeCheck, setActiveCheck] = useState<"regio" | "regelgeving">("regio");

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
    <div className="min-h-screen bg-white text-slate-900">

      {/* ─── STICKY HEADER ─── */}
      <header
        className="sticky top-0 z-50 bg-white border-b border-slate-100"
        style={{ boxShadow: "0 1px 0 #e8ecf2" }}
        data-testid="nav-main"
      >
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
                <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="button-nav-login">
                  Inloggen
                </button>
              </Link>
              <a href="#basischeck" data-testid="button-nav-basischeck">
                <button className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#f28a1a" }}>
                  Start de Basischeck
                </button>
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
                <h1
                  className="font-black leading-tight mb-5 text-slate-900"
                  style={{ fontSize: "clamp(28px, 3.8vw, 52px)", letterSpacing: "-1.5px" }}
                  data-testid="text-hero-title"
                >
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
                  <img
                    src={streetImg}
                    alt="Nederlandse winkelstraat"
                    className="w-full object-cover"
                    style={{ height: "420px" }}
                  />
                </div>
                <div
                  className="absolute -bottom-4 -left-4 rounded-2xl px-5 py-4 flex items-center gap-3"
                  style={{ background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,.12)", maxWidth: "220px" }}
                >
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

        {/* ─── TRUST STRIP ─── */}
        <section className="py-6 border-y border-slate-100" style={{ background: "#f8fafd" }} data-testid="section-trust">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid sm:grid-cols-3 gap-4 text-center sm:text-left">
              {[
                { icon: Clock, label: "In 3 minuten een eerste beeld", sub: "Geen technische kennis nodig" },
                { icon: MapPin, label: "Gericht op jouw regio", sub: "Lokale kansen en regelgeving" },
                { icon: Store, label: "Voor elke ondernemer", sub: "Van zzp tot mkb" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-3" data-testid={`trust-item-${i}`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,95,174,.09)", color: "#1f5fae" }}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PROBLEEM ─── */}
        <section className="py-24 bg-white" data-testid="section-probleem">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f28a1a" }}>Het probleem</span>
                <h2 className="font-black mt-3 mb-5 text-slate-900" style={{ fontSize: "clamp(22px, 2.6vw, 34px)", letterSpacing: "-0.6px", lineHeight: 1.2 }} data-testid="text-probleem-title">
                  Veel ondernemers missen signalen die direct impact hebben op hun bedrijf.
                </h2>
                <p className="text-slate-500 leading-relaxed mb-8" style={{ fontSize: "16px" }}>
                  Regels veranderen. Besluiten worden genomen. Lokale kansen ontstaan en verdwijnen. Veel daarvan is openbaar, maar verspreid, technisch of te laat zichtbaar. Ondertussen kost lage zichtbaarheid gewoon klanten.
                </p>
                <ul className="space-y-4">
                  {[
                    "Je ziet relevante veranderingen vaak pas als het al speelt",
                    "Je online zichtbaarheid laat omzet liggen",
                    "Lokale kansen blijven versnipperd en onbenut",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3" data-testid={`probleem-item-${i}`}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(242,138,26,.12)", color: "#f28a1a" }}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-slate-600 text-sm leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(0,0,0,.1)" }}>
                  <img src={groupImg} alt="Ondernemers bespreken OpenRegio" className="w-full object-cover" style={{ height: "400px" }} />
                </div>
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
                {
                  accent: "#1f5fae",
                  icon: Gavel,
                  label: "Inzicht",
                  title: "Zie eerder wat verandert",
                  desc: "Volg regelgeving, openbare documenten en signalen die relevant zijn voor jouw onderneming, branche of regio.",
                },
                {
                  accent: "#f28a1a",
                  icon: BarChart2,
                  label: "Zichtbaarheid",
                  title: "Word beter gevonden in je regio",
                  desc: "Analyseer hoe zichtbaar jouw bedrijf is en ontdek waar je lokale kansen laat liggen.",
                },
                {
                  accent: "#059669",
                  icon: Users,
                  label: "RegioVoordeel",
                  title: "Pak meer kansen via je netwerk",
                  desc: "Kom in beeld binnen een regionaal ondernemersnetwerk — zichtbaarheid, samenwerking en doorverwijzing in één.",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-7 border border-slate-100"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,.05)" }}
                  data-testid={`card-pijler-${i}`}
                >
                  <div className="h-1 rounded-full mb-6 -mx-7 -mt-7 rounded-t-2xl" style={{ background: p.accent }} />
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

        {/* ─── ZO WERKT HET / BASISCHECK ─── */}
        <section id="basischeck" className="py-24 bg-white" data-testid="section-basischeck">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-start">

              {/* Linkerkolom: stappen + tools */}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1f5fae" }}>Begin hier</span>
                <h2 className="font-black mt-3 mb-8 text-slate-900" style={{ fontSize: "clamp(22px, 2.6vw, 34px)", letterSpacing: "-0.6px" }} data-testid="text-basischeck-title">
                  Begin met de Basischeck
                </h2>

                {/* Stappen */}
                <div className="space-y-5 mb-10">
                  {[
                    { n: "01", title: "Vul je beroep en stad in", desc: "Of kies een branche en regelgevingsonderwerp." },
                    { n: "02", title: "Start de analyse", desc: "OpenRegio analyseert direct je regio of regelgevingsvraag." },
                    { n: "03", title: "Ontvang concreet inzicht", desc: "Je krijgt een helder overzicht van kansen, signalen en een vervolgadvies." },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-4" data-testid={`stap-${i}`}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm" style={{ background: "rgba(31,95,174,.08)", color: "#1f5fae" }}>
                        {s.n}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{s.title}</div>
                        <div className="text-slate-400 text-sm mt-0.5 leading-relaxed">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                  <div className="flex border-b border-slate-100">
                    <button
                      className={`flex-1 py-3 text-sm font-bold transition-colors ${activeCheck === "regio" ? "text-slate-900 bg-white" : "text-slate-400 bg-slate-50 hover:text-slate-600"}`}
                      onClick={() => setActiveCheck("regio")}
                      data-testid="tab-regio"
                    >
                      Regio-analyse
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-bold transition-colors ${activeCheck === "regelgeving" ? "text-slate-900 bg-white" : "text-slate-400 bg-slate-50 hover:text-slate-600"}`}
                      onClick={() => setActiveCheck("regelgeving")}
                      data-testid="tab-regelgeving"
                    >
                      Regelgeving-check
                    </button>
                  </div>

                  <div className="p-5">
                    {activeCheck === "regio" ? (
                      <div className="space-y-3">
                        <p className="text-slate-400 text-xs mb-3">Vul je beroep en stad in voor een snelle analyse.</p>
                        <Input
                          placeholder="Je beroep (bijv. Bakker)"
                          aria-label="Je beroep"
                          value={botBeroep}
                          onChange={(e) => setBotBeroep(e.target.value)}
                          className="text-sm"
                          data-testid="input-bot-beroep"
                        />
                        <Input
                          placeholder="Je stad"
                          aria-label="Je stad"
                          value={botStad}
                          onChange={(e) => setBotStad(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleBotVraag()}
                          className="text-sm"
                          data-testid="input-bot-stad"
                        />
                        <button
                          onClick={handleBotVraag}
                          disabled={botLoading || !botBeroep.trim() || !botStad.trim()}
                          className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
                          style={{ background: "#1f5fae" }}
                          data-testid="button-bot-vraag"
                        >
                          {botLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyse loopt…</> : <><Search className="w-4 h-4" />Analyseer mijn regio</>}
                        </button>
                        {botAntwoord && (
                          <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "rgba(31,95,174,.05)", border: "1px solid rgba(31,95,174,.12)", color: "#334155" }} data-testid="text-bot-antwoord">
                            {botAntwoord}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-slate-400 text-xs mb-3">Vul je branche en een onderwerp in voor direct inzicht.</p>
                        <Input
                          placeholder="Je branche (bijv. Horeca)"
                          aria-label="Je branche"
                          value={regelgevingBranche}
                          onChange={(e) => setRegelgevingBranche(e.target.value)}
                          className="text-sm"
                          data-testid="input-regelgeving-branche"
                        />
                        <Input
                          placeholder="Onderwerp (bijv. terrasvergunning)"
                          aria-label="Onderwerp"
                          value={regelgevingOnderwerp}
                          onChange={(e) => setRegelgevingOnderwerp(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRegelgevingCheck()}
                          className="text-sm"
                          data-testid="input-regelgeving-onderwerp"
                        />
                        <button
                          onClick={handleRegelgevingCheck}
                          disabled={regelgevingLoading || !regelgevingBranche.trim() || !regelgevingOnderwerp.trim()}
                          className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
                          style={{ background: "#1f5fae" }}
                          data-testid="button-regelgeving-check"
                        >
                          {regelgevingLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyse loopt…</> : <><Scale className="w-4 h-4" />Controleer regelgeving</>}
                        </button>
                        {regelgevingAntwoord && (
                          <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: "rgba(31,95,174,.05)", border: "1px solid rgba(31,95,174,.12)", color: "#334155" }} data-testid="text-regelgeving-antwoord">
                            {regelgevingAntwoord}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center mt-4">Laagdrempelig. Praktisch. Gericht op actie.</p>
              </div>

              {/* Rechterkolom: foto */}
              <div className="hidden md:block" data-testid="card-basischeck-photo">
                <div className="rounded-2xl overflow-hidden sticky top-24" style={{ boxShadow: "0 16px 48px rgba(0,0,0,.1)" }}>
                  <img src={groupImg} alt="Ondernemers met OpenRegio" className="w-full object-cover" style={{ height: "500px" }} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── OVER ONS ─── */}
        <section className="py-24 bg-white border-t border-slate-100" data-testid="section-over-ons">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(0,0,0,.1)" }} data-testid="img-over-ons">
                <img src={streetImg} alt="Lokale ondernemers regio" className="w-full object-cover" style={{ height: "420px" }} />
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
                { q: "Waarom eerst de Basischeck?", a: "Omdat je dan direct ziet waar jouw grootste kansen of zwakke punten zitten. Zo weet je meteen wat je hebt aan OpenRegio — voordat je kiest." },
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
                    <ChevronDown
                      className="w-4 h-4 flex-shrink-0 text-slate-400 transition-transform"
                      style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
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
        <section
          id="contact"
          className="py-24 relative overflow-hidden"
          style={{ background: "#0e3a70" }}
          data-testid="section-cta"
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${streetImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-black text-white mb-4" style={{ fontSize: "clamp(24px, 3vw, 40px)", letterSpacing: "-0.8px" }} data-testid="text-cta-title">
              Start vandaag met de Basischeck.
            </h2>
            <p className="mb-8 text-base leading-relaxed" style={{ color: "rgba(255,255,255,.65)" }}>
              In een paar stappen zie je waar jouw bedrijf staat — en welke kansen je nu laat liggen.
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
                placeholder="Je e-mailadres"
                aria-label="Je e-mailadres"
                className="flex-1 max-w-xs px-4 py-3.5 rounded-xl text-sm outline-none bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:border-white/40 transition-colors"
                data-testid="input-cta-email"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl font-bold text-sm flex-shrink-0 transition-opacity hover:opacity-90"
                style={{ background: "#f28a1a", color: "#1b1307" }}
                data-testid="button-cta-submit"
              >
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
