import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  MapPin,
  Play,
  Mail,
  Users,
  Award,
  Check,
  FileText,
  Scale,
  FileCheck,
  Info,
  ArrowRight,
  Globe,
  Search,
  Star,
  Calendar,
  Lightbulb,
  Menu,
  X,
  Handshake,
  ChevronRight,
  Lock,
  FileSearch,
  Gavel,
  Bot,
  Upload,
  Zap,
  TrendingUp,
  Bell,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import "@/styles/landing-mockup.css";

export default function HomePage() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashHref = user ? "/vandaag" : "/register";

  return (
    <div className="lp-root">
      {/* ── NAV ── */}
      <header className="lp-nav">
        <div className="lp-wrap">
          <div className="lp-nav-in">
            <a href="#top" className="lp-brand" data-testid="link-home-brand">
              <div className="lp-brand-pin"><MapPin size={20} /></div>
              <div className="lp-brand-name">Open<b>Regio</b></div>
            </a>

            <nav className="lp-nav-links">
              <a href="#pijlers" className="lp-nav-link">De drie pijlers</a>
              <a href="#woo" className="lp-nav-link">WOO-check</a>
              <a href="#regiobot" className="lp-nav-link">RegioBot</a>
              <a href="#aanbod" className="lp-nav-link">Aanbod</a>
              <Link href="/acties" className="lp-nav-link" data-testid="link-nav-acties">Lokale acties</Link>
            </nav>

            <div className="lp-nav-cta">
              <Link href="/login" className="lp-btn-ghost-nav" data-testid="link-nav-login">Inloggen</Link>
              <Link href="/register" className="lp-btn-orange-nav" data-testid="link-nav-register">
                Word lid <ChevronRight size={14} />
              </Link>
            </div>

            <button className="lp-nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu openen" data-testid="button-mobile-menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className={`lp-mobile-menu${mobileOpen ? " open" : ""}`}>
          <a href="#pijlers" className="lp-nav-link" onClick={() => setMobileOpen(false)}>De drie pijlers</a>
          <a href="#woo" className="lp-nav-link" onClick={() => setMobileOpen(false)}>WOO-check</a>
          <a href="#regiobot" className="lp-nav-link" onClick={() => setMobileOpen(false)}>RegioBot</a>
          <a href="#aanbod" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Aanbod</a>
          <Link href="/acties" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Lokale acties</Link>
          <div className="lp-mobile-cta">
            <Link href="/login" className="lp-btn-ghost-nav" onClick={() => setMobileOpen(false)}>Inloggen</Link>
            <Link href="/register" className="lp-btn-orange-nav" onClick={() => setMobileOpen(false)}>Word lid</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero" id="top">
        <div className="lp-wrap">
          <div className="lp-hero-in">
            {/* Left */}
            <div className="lp-hero-left">
              <div className="lp-hero-tagline-pre">
                <span className="lp-pulse" />
                Gezond ondernemen
              </div>
              <h1 className="lp-hero-title">
                Grip op regels.<br />
                <span className="lp-hl">Meer klanten.</span><br />
                Sterkere lokale verbindingen.
              </h1>
              <p className="lp-hero-desc">
                De praktische toolkit voor ondernemers die hun bedrijf willen beschermen, laten groeien en lokaal sterker willen staan.
              </p>
              <div className="lp-hero-btns">
                <Link href="/register" className="lp-btn-hero-orange" data-testid="link-hero-start">
                  <ArrowRight size={16} /> Word lid
                </Link>
                <a href="#pijlers" className="lp-btn-hero-white">
                  <Play size={14} /> Bekijk de drie pijlers
                </a>
              </div>
              <p className="lp-hero-ncc">
                <Lock size={13} />
                Geen verborgen kosten. Maandelijks opzegbaar.
              </p>
            </div>

            {/* Right — Town illustration */}
            <div className="lp-hero-visual">
              <div className="lp-town-scene">
                <div className="lp-town-buildings">
                  <div className="lp-cloud" style={{ width: 60, height: 22, top: 18, left: 20, boxShadow: "30px 0 0 22px white, -30px 0 0 18px white" }} />
                  <div className="lp-cloud" style={{ width: 40, height: 18, top: 12, right: 40, boxShadow: "22px 0 0 16px white, -18px 0 0 14px white" }} />
                  <div className="lp-tree">
                    <div style={{ width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: "28px solid #2E8B4A" }} />
                    <div style={{ width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: "28px solid #2E8B4A", marginTop: -10 }} />
                    <div style={{ width: 8, height: 14, background: "#8B5E3C", marginTop: -2 }} />
                  </div>
                  <div className="lp-building">
                    <div className="lp-b-sign" style={{ color: "#0A2D6E" }}>BAKKER</div>
                    <div className="lp-b-body" style={{ width: 70, height: 100, background: "#EBF4FD", border: "1.5px solid #BFDBFE", borderRadius: "6px 6px 0 0" }}>
                      <div className="lp-b-awning" style={{ background: "repeating-linear-gradient(90deg,#0A2D6E 0,#0A2D6E 9px,#fff 9px,#fff 18px)" }} />
                      <div className="lp-b-windows">
                        <div className="lp-b-window" style={{ background: "rgba(30,109,181,.2)" }} />
                        <div className="lp-b-window" style={{ background: "rgba(30,109,181,.2)" }} />
                        <div className="lp-b-window" style={{ background: "rgba(30,109,181,.2)" }} />
                        <div className="lp-b-window" style={{ background: "rgba(30,109,181,.2)" }} />
                      </div>
                      <div className="lp-b-door" style={{ width: 22, height: 32, background: "rgba(30,109,181,.25)", borderRadius: "3px 3px 0 0" }} />
                    </div>
                  </div>
                  <div className="lp-building">
                    <div className="lp-b-sign" style={{ color: "#236839" }}>KAPSALON</div>
                    <div className="lp-b-body" style={{ width: 80, height: 120, background: "#EAF6EE", border: "1.5px solid #A7F3D0", borderRadius: "6px 6px 0 0" }}>
                      <div className="lp-b-awning" style={{ background: "repeating-linear-gradient(90deg,#2E8B4A 0,#2E8B4A 10px,#fff 10px,#fff 20px)" }} />
                      <div className="lp-b-windows">
                        <div className="lp-b-window" style={{ background: "rgba(46,139,74,.2)" }} />
                        <div className="lp-b-window" style={{ background: "rgba(46,139,74,.2)" }} />
                        <div className="lp-b-window" style={{ background: "rgba(46,139,74,.2)" }} />
                        <div className="lp-b-window" style={{ background: "rgba(46,139,74,.2)" }} />
                      </div>
                      <div className="lp-b-door" style={{ width: 24, height: 36, background: "rgba(46,139,74,.25)", borderRadius: "3px 3px 0 0" }} />
                    </div>
                  </div>
                  <div className="lp-building">
                    <div className="lp-b-sign" style={{ color: "#C46B08" }}>CAFÉ</div>
                    <div className="lp-b-body" style={{ width: 68, height: 90, background: "#FEF3E2", border: "1.5px solid #FDE68A", borderRadius: "6px 6px 0 0" }}>
                      <div className="lp-b-awning" style={{ background: "repeating-linear-gradient(90deg,#E8820C 0,#E8820C 8px,#fff 8px,#fff 16px)" }} />
                      <div className="lp-b-windows">
                        <div className="lp-b-window" style={{ background: "rgba(232,130,12,.2)" }} />
                        <div className="lp-b-window" style={{ background: "rgba(232,130,12,.2)" }} />
                      </div>
                      <div className="lp-b-door" style={{ width: 20, height: 28, background: "rgba(232,130,12,.3)", borderRadius: "3px 3px 0 0" }} />
                    </div>
                  </div>
                  <div className="lp-building">
                    <div className="lp-church-spire" />
                    <div className="lp-church-body"><div className="lp-church-window" /></div>
                  </div>
                  <div className="lp-tree">
                    <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: "24px solid #2E8B4A" }} />
                    <div style={{ width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderBottom: "24px solid #2E8B4A", marginTop: -8 }} />
                    <div style={{ width: 7, height: 12, background: "#8B5E3C", marginTop: -2 }} />
                  </div>
                </div>
                <div className="lp-ground" />
              </div>
            </div>
          </div>

          {/* Trust row */}
          <div className="lp-hero-trust">
            <div className="lp-trust-item"><Users size={16} style={{ color: "#4ADE80" }} /> Vertrouwen van mens tot mens</div>
            <div className="lp-trust-item"><Award size={16} style={{ color: "#4ADE80" }} /> Vakmanschap is meesterschap</div>
            <div className="lp-trust-item"><MapPin size={16} style={{ color: "#4ADE80" }} /> Sterke ondernemers, sterke regio's</div>
            <div className="lp-trust-item lp-trust-last"><Check size={16} style={{ color: "#4ADE80" }} /> Opgericht door lokale ondernemers</div>
          </div>
        </div>
      </section>

      {/* ── DRIE PIJLERS ── */}
      <section className="lp-pijlers-section" id="pijlers">
        <div className="lp-wrap">
          <div className="lp-pijlers-top">
            <div className="lp-sec-label lp-sl-marine">OpenRegio helpt ondernemers groeien</div>
            <h2 className="lp-sec-title">Met drie krachtige pijlers</h2>
            <p className="lp-sec-sub" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              Van regelgeving begrijpen tot lokaal samenwerken — alles wat jij als ondernemer nodig hebt, op één plek.
            </p>
          </div>
        </div>

        <div className="lp-wrap" style={{ paddingBottom: 56 }}>
          <div className="lp-pijlers-grid">

            {/* PIJLER 1 */}
            <div className="lp-pijler-col lp-pc1">
              <div className="lp-pc-head">
                <div className="lp-pc-num-row">
                  <div className="lp-pc-bignum">1</div>
                  <div>
                    <div className="lp-pc-hname">Grip op Regels</div>
                    <div className="lp-pc-hsub">Voor wie duidelijkheid wil</div>
                  </div>
                </div>
              </div>
              <div className="lp-pc-illus">
                <FileText size={72} className="lp-pc-illus-icon" />
                <div className="lp-pc-illus-center">
                  <div className="lp-pc-illus-main"><Mail size={30} /></div>
                  <div className="lp-pc-illus-badge">Brieven & regels helder uitgelegd</div>
                </div>
              </div>
              <div className="lp-pc-feats">
                {[
                  { icon: <Mail size={13} />, t: "Brief analyseren", s: "Overheidsbrieven direct uitgelegd" },
                  { icon: <Scale size={13} />, t: "Regelcheck", s: "Wat betekent het voor jouw bedrijf?" },
                  { icon: <FileCheck size={13} />, t: "Vergunningen volgen", s: "Status, deadlines, automatische alerts" },
                  { icon: <Info size={13} />, t: "WOO-check door OpenRegio", s: "Stuur je brief op — wij doen de rest" },
                  { icon: <ShieldCheck size={13} />, t: "AVG controle", s: "Jouw privacy en verplichtingen" },
                ].map((f) => (
                  <div key={f.t} className="lp-pc-feat">
                    <div className="lp-pcf-ico">{f.icon}</div>
                    <div><div className="lp-pcf-t">{f.t}</div><div className="lp-pcf-s">{f.s}</div></div>
                  </div>
                ))}
              </div>
              <div className="lp-pc-foot">
                <div className="lp-pc-foot-inner">
                  <div className="lp-pcf-target"><ArrowRight size={14} /></div>
                  <Link href={dashHref} style={{ color: "inherit", textDecoration: "none" }}>Meer over Grip op Regels</Link>
                </div>
              </div>
            </div>

            {/* PIJLER 2 */}
            <div className="lp-pijler-col lp-pc2">
              <div className="lp-pc-head">
                <div className="lp-pc-num-row">
                  <div className="lp-pc-bignum">2</div>
                  <div>
                    <div className="lp-pc-hname">Lokale Zichtbaarheid</div>
                    <div className="lp-pc-hsub">Voor wie beter gevonden wil worden</div>
                  </div>
                </div>
              </div>
              <div className="lp-pc-illus">
                <Search size={72} className="lp-pc-illus-icon" />
                <div className="lp-pc-illus-center">
                  <div className="lp-pc-illus-main"><Globe size={30} /></div>
                  <div className="lp-pc-illus-badge">Beter gevonden door lokale klanten</div>
                </div>
              </div>
              <div className="lp-pc-feats">
                {[
                  { icon: <Globe size={13} />, t: "Website scan", s: "Sterk, snel en klantvriendelijk?" },
                  { icon: <Search size={13} />, t: "Google profiel", s: "Stap voor stap geoptimaliseerd" },
                  { icon: <TrendingUp size={13} />, t: "Vindbaarheid", s: "Google én AI-zoekmachines" },
                  { icon: <LayoutDashboard size={13} />, t: "Online verbeterplan", s: "Techniek, inhoud en uitstraling" },
                  { icon: <Zap size={13} />, t: "AI zoekmachines", s: "Ook gevonden via ChatGPT en Gemini" },
                ].map((f) => (
                  <div key={f.t} className="lp-pc-feat">
                    <div className="lp-pcf-ico">{f.icon}</div>
                    <div><div className="lp-pcf-t">{f.t}</div><div className="lp-pcf-s">{f.s}</div></div>
                  </div>
                ))}
              </div>
              <div className="lp-pc-foot">
                <div className="lp-pc-foot-inner">
                  <div className="lp-pcf-target"><ArrowRight size={14} /></div>
                  <Link href={dashHref} style={{ color: "inherit", textDecoration: "none" }}>Verbeter mijn zichtbaarheid</Link>
                </div>
              </div>
            </div>

            {/* PIJLER 3 */}
            <div className="lp-pijler-col lp-pc3">
              <div className="lp-featured-ribbon">&#9733; Uitgelicht</div>
              <div className="lp-pc-head">
                <div className="lp-pc-num-row">
                  <div className="lp-pc-bignum">3</div>
                  <div>
                    <div className="lp-pc-hname">Lokale Kracht</div>
                    <div className="lp-pc-hsub">Voor wie sterker wil staan</div>
                  </div>
                </div>
              </div>
              <div className="lp-pc-illus">
                <Users size={72} className="lp-pc-illus-icon" />
                <div className="lp-pc-illus-center">
                  <div className="lp-pc-illus-main"><Users size={30} /></div>
                  <div className="lp-pc-illus-badge">Samenwerken maakt je sterker</div>
                </div>
              </div>
              <div className="lp-pc-feats">
                {[
                  { icon: <Users size={13} />, t: "Netwerk", s: "Verbind met ondernemers in jouw buurt" },
                  { icon: <Calendar size={13} />, t: "Lokale acties", s: "Events, workshops en buurtacties" },
                  { icon: <Star size={13} />, t: "Marktplaats", s: "Zoek of bied — direct in de regio" },
                  { icon: <Lightbulb size={13} />, t: "Workshops", s: "Leer van anderen in jouw sector" },
                  { icon: <Handshake size={13} />, t: "Blog", s: "Kennis delen met de regio" },
                ].map((f) => (
                  <div key={f.t} className="lp-pc-feat">
                    <div className="lp-pcf-ico">{f.icon}</div>
                    <div><div className="lp-pcf-t">{f.t}</div><div className="lp-pcf-s">{f.s}</div></div>
                  </div>
                ))}
              </div>
              <div className="lp-pc-foot">
                <div className="lp-pc-foot-inner">
                  <div className="lp-pcf-target"><ArrowRight size={14} /></div>
                  <Link href={dashHref} style={{ color: "inherit", textDecoration: "none" }}>Ontdek lokale kansen</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WOO TRANSPARANTIE ── */}
      <section id="woo" style={{ background: "#0A2D6E", padding: "72px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -60, width: 280, height: 280, background: "rgba(255,255,255,.04)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, background: "rgba(255,255,255,.03)", borderRadius: "50%", pointerEvents: "none" }} />

        <div className="lp-wrap">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>
              <Gavel size={13} style={{ color: "#FDE68A" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A", letterSpacing: "0.07em", textTransform: "uppercase" }}>WOO-transparantie</span>
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: "white", margin: "0 0 12px", lineHeight: 1.25 }}>
              Regels worden teruggedraaid.<br />
              <span style={{ color: "#FDE68A" }}>Wij maken zichtbaar waarom.</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              Soms moet je ineens je terras inleveren, sluit een straat voor verkeer of vervalt een vergunning. De officiële brief geeft zelden de echte reden. <strong style={{ color: "rgba(255,255,255,.85)" }}>Jij stuurt ons de brief. OpenRegio doet de WOO-check</strong> — wij halen de interne documenten, adviezen en e-mails van de gemeente boven tafel.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
            {[
              { step: "1", accent: "#FDE68A", icon: <Mail size={28} style={{ color: "#FDE68A" }} />, title: "Jij stuurt ons de brief", desc: "Ontvang je een brief van de gemeente die je niet begrijpt, of klinkt een besluit niet eerlijk? Stuur hem op." },
              { step: "2", accent: "#6EE7B7", icon: <FileSearch size={28} style={{ color: "#6EE7B7" }} />, title: "OpenRegio doet de WOO-check", desc: "Wij beoordelen de brief en voeren waar nodig een WOO-check uit op interne adviezen en e-mails van de gemeente." },
              { step: "3", accent: "#93C5FD", icon: <Lightbulb size={28} style={{ color: "#93C5FD" }} />, title: "De echte reden komt boven tafel", desc: "Wat de gemeente intern besprak maar niet aan jou vertelde. Jij weet nu wat er werkelijk achter het besluit speelt." },
              { step: "4", accent: "#F9A8D4", icon: <Gavel size={28} style={{ color: "#F9A8D4" }} />, title: "Jij beslist wat je doet", desc: "Bezwaar maken, publiceren of beter begrijpen — de keuze is aan jou. Wij leveren de feiten." },
            ].map((s) => (
              <div key={s.step} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, background: s.accent + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: s.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>Stap {s.step}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.35 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(253,230,138,.25)", borderRadius: 18, padding: "28px 32px", display: "flex", gap: 28, flexWrap: "wrap" as const, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#FDE68A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Voorbeeld — Terrasvergunning</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 10 }}>Je terras moet weg. Maar waarom eigenlijk?</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.7, margin: 0 }}>
                Een horecaondernemer moest zijn terras inleveren na een gemeentebesluit. Via de WOO-check kwamen de interne adviezen boven tafel — de werkelijke reden stond nergens in de officiële documenten. De ondernemer maakte bezwaar en kreeg zijn terras terug.
              </p>
            </div>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#FDE68A", color: "#0A2D6E", fontWeight: 800, fontSize: 13, padding: "12px 22px", borderRadius: 10, textDecoration: "none", flexShrink: 0 }} data-testid="link-woo-cta">
              <Mail size={15} /> Stuur je brief op
            </Link>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD VOORBEELD ── */}
      <section style={{ background: "#f8fafc", padding: "72px 0" }} id="dashboard">
        <div className="lp-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            {/* Links — uitleg */}
            <div>
              <div className="lp-sec-label lp-sl-marine">Wat je krijgt</div>
              <h2 className="lp-sec-title">Direct zien wat er speelt<br />in jouw regio</h2>
              <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, marginBottom: 28 }}>
                Na aanmelding zie je meteen het dagelijkse overzicht: subsidies, samenwerkingen, nieuwe documenten en lokale acties — gefilterd op jouw regio en sector.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                {[
                  { ico: <Bell size={16} style={{ color: "#1E6DB5" }} />, bg: "#EBF4FD", t: "Signalen uit jouw regio", s: "Nieuwe subsidies, regelwijzigingen en kansen" },
                  { ico: <FileText size={16} style={{ color: "#7C3AED" }} />, bg: "#EDE9FE", t: "Documenten klaar voor analyse", s: "Upload een brief of vergunning, ontvang direct uitleg" },
                  { ico: <Users size={16} style={{ color: "#2E8B4A" }} />, bg: "#EAF6EE", t: "Ondernemers zoeken contact", s: "Zie wie er in jouw buurt actief is" },
                ].map((item) => (
                  <div key={item.t} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: item.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.ico}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2942" }}>{item.t}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{item.s}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#0A2D6E", color: "white", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 10, textDecoration: "none", marginTop: 28 }} data-testid="link-dashboard-cta">
                <LayoutDashboard size={15} /> Bekijk het dashboard
              </Link>
            </div>

            {/* Rechts — mockup */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
              {/* Balk bovenin */}
              <div style={{ background: "#0A2D6E", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />
                <div style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>Vandaag in jouw regio</div>
              </div>
              {/* Feed-items */}
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {[
                  { dot: "#1E6DB5", text: "Nieuwe subsidieregeling voor mkb — Noord-Holland", tag: "Subsidie" },
                  { dot: "#2E8B4A", text: "3 ondernemers zoeken samenwerking in Rotterdam", tag: "Netwerk" },
                  { dot: "#7C3AED", text: "Website scan beschikbaar voor jouw bedrijf", tag: "Tool" },
                  { dot: "#E8820C", text: "Nieuwe lokale actie geplaatst in jouw regio", tag: "Actie" },
                  { dot: "#0A2D6E", text: "2 documenten wachten op analyse", tag: "Documenten" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12.5, color: "#334155" }}>{item.text}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: item.dot, background: item.dot + "15", padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" as const }}>{item.tag}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "0 20px 16px", textAlign: "center" as const }}>
                <Link href="/register" style={{ fontSize: 12, color: "#0A2D6E", fontWeight: 700, textDecoration: "none" }}>
                  Aanmelden om alles te zien <ArrowRight size={12} style={{ display: "inline", verticalAlign: -2 }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REGIOBOT ── */}
      <section id="regiobot" style={{ background: "white", padding: "72px 0", borderTop: "1px solid #f1f5f9" }}>
        <div className="lp-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            {/* Links — mockup */}
            <div style={{ background: "#0A2D6E", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(10,45,110,.2)" }}>
              {/* Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, background: "#1E6DB5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={20} style={{ color: "white" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>RegioBot</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>AI-assistent voor ondernemers</div>
                </div>
              </div>
              {/* Upload area */}
              <div style={{ padding: "20px 24px 12px" }}>
                <div style={{ border: "1.5px dashed rgba(255,255,255,.2)", borderRadius: 12, padding: "20px", textAlign: "center" as const, marginBottom: 16 }}>
                  <Upload size={28} style={{ color: "rgba(255,255,255,.4)", marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 4 }}>Upload een document</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Brief · Contract · Vergunning · PDF</div>
                </div>
                {/* Output */}
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {[
                    { ico: <FileText size={13} />, label: "Samenvatting", color: "#FDE68A" },
                    { ico: <ShieldCheck size={13} />, label: "Risico's in kaart", color: "#6EE7B7" },
                    { ico: <Zap size={13} />, label: "Actiepunten", color: "#93C5FD" },
                    { ico: <Mail size={13} />, label: "Voorstelbrief opgesteld", color: "#F9A8D4" },
                  ].map((r) => (
                    <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.06)", borderRadius: 8, padding: "9px 12px" }}>
                      <div style={{ color: r.color }}>{r.ico}</div>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{r.label}</div>
                      <div style={{ marginLeft: "auto", width: 18, height: 18, background: r.color + "33", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={10} style={{ color: r.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "12px 24px 20px" }}>
                <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FDE68A", color: "#0A2D6E", fontWeight: 800, fontSize: 13, padding: "11px", borderRadius: 10, textDecoration: "none" }} data-testid="link-regiobot-cta">
                  <Bot size={15} /> Probeer RegioBot
                </Link>
              </div>
            </div>

            {/* Rechts — uitleg */}
            <div>
              <div className="lp-sec-label lp-sl-marine">RegioBot</div>
              <h2 className="lp-sec-title">Upload een document.<br />Ontvang direct inzicht.</h2>
              <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, marginBottom: 28 }}>
                RegioBot analyseert overheidsbrieven, vergunningen en contracten in gewone taal. Geen juridisch jargon meer — gewoon begrijpen wat er van je verwacht wordt.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                {[
                  { t: "Upload een brief", s: "PDF, foto of tekst — RegioBot leest het" },
                  { t: "Upload een contract", s: "Zit er iets in wat je moet weten? RegioBot signaleert het" },
                  { t: "Upload een vergunning", s: "Wat zijn jouw rechten en verplichtingen?" },
                ].map((item) => (
                  <div key={item.t} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={16} style={{ color: "#2E8B4A", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2942" }}>{item.t}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{item.s}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, padding: "14px 18px", background: "#EAF6EE", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Lightbulb size={16} style={{ color: "#2E8B4A", flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#236839", lineHeight: 1.6 }}>
                  RegioBot is beschikbaar voor Pro-leden. Met een Basis-abonnement kun je alvast kennismaken via de briefanalyse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AANBOD ── */}
      <section style={{ background: "#f0f4fb", padding: "72px 0" }} id="aanbod">
        <div className="lp-wrap">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="lp-sec-label lp-sl-marine" style={{ justifyContent: "center" }}>Lidmaatschap</div>
            <h2 className="lp-sec-title" style={{ textAlign: "center" }}>Kies jouw account</h2>
            <p className="lp-sec-sub" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
              Twee plannen. Helder verschil. Beide maandelijks opzegbaar.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 720, margin: "0 auto 48px" }}>
            {[
              {
                id: "basic", name: "Basis", price: "€14,95", period: "excl. btw / mnd",
                tagline: "Meekijken, profiel aanmaken en lokaal meedoen.",
                color: "#1E6DB5", badge: "BASIS", highlight: false,
                perks: ["Sectorregels bekijken", "Brief analyseren", "Website-scan (basis)", "Bedrijfsprofiel aanmaken", "Netwerk bekijken", "Lokale acties bekijken", "Marktplaats: reageren", "Blog lezen"],
              },
              {
                id: "pro", name: "Pro", price: "€59", period: "excl. btw / mnd",
                tagline: "Alle tools, onbeperkt gebruik en maximale zichtbaarheid.",
                color: "#7C3AED", badge: "PRO", highlight: true,
                perks: ["Alles van Basis", "RegioBot onbeperkt", "Vindbaarheid & SEO-tools", "WOO-bibliotheek", "Document upload", "AI-assistenten", "Netwerk: volledig deelnemen", "Marktplaats: zelf plaatsen"],
              },
            ].map((plan) => (
              <div key={plan.id} data-testid={`card-plan-${plan.id}-home`} style={{ background: "white", borderRadius: 16, border: plan.highlight ? `2px solid ${plan.color}` : "2px solid #e2e8f0", padding: "28px 24px", position: "relative", boxShadow: plan.highlight ? `0 4px 24px ${plan.color}22` : "0 1px 6px rgba(0,0,0,.06)" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "white", fontSize: 10, fontWeight: 900, padding: "3px 16px", borderRadius: 20, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                    MEEST GEKOZEN
                  </div>
                )}
                <div style={{ display: "inline-block", background: plan.color + "15", color: plan.color, fontSize: 10, fontWeight: 900, padding: "3px 12px", borderRadius: 20, letterSpacing: "0.08em", marginBottom: 12 }}>{plan.badge}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f2942", lineHeight: 1, marginBottom: 4 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>{plan.period}</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 18, lineHeight: 1.5 }}>{plan.tagline}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginBottom: 20, width: "fit-content" }}>
                  <Check size={11} /> Maandelijks opzegbaar
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {plan.perks.map((p, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#334155", marginBottom: 7 }}>
                      <Check size={14} style={{ color: plan.color, flexShrink: 0, marginTop: 1 }} />{p}
                    </li>
                  ))}
                </ul>
                <Link href={`/lidmaatschap?plan=${plan.id}`} data-testid={`link-plan-${plan.id}-start`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 24, padding: "11px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, background: plan.color, color: "white", textDecoration: "none" }}>
                  <ArrowRight size={15} /> Start met {plan.name}
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <Lock size={12} /> Maandelijks opzegbaar · Veilige betaling via Mollie
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-top">
            <div>
              <div className="lp-f-brand-name">Open<b>Regio</b></div>
              <div className="lp-f-tag">Grip op regels. Zichtbaarheid die werkt. Samen sterk in jouw regio.</div>
            </div>
            <div>
              <div className="lp-f-head">Platform</div>
              <div className="lp-f-links">
                <a href="#pijlers">Grip op Regels</a>
                <a href="#pijlers">Lokale Zichtbaarheid</a>
                <a href="#pijlers">Lokale Kracht</a>
                <a href="#regiobot">RegioBot</a>
                <a href="#woo">WOO-check</a>
                <Link href="/acties">Lokale acties</Link>
              </div>
            </div>
            <div>
              <div className="lp-f-head">Bedrijf</div>
              <div className="lp-f-links">
                <Link href="/blogs">Over ons</Link>
                <Link href="/blogs">Blog</Link>
                <Link href="/account/affiliate">Affiliate</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </div>
            <div>
              <div className="lp-f-head">Juridisch</div>
              <div className="lp-f-links">
                <Link href="/privacy">Privacybeleid</Link>
                <Link href="/voorwaarden">Voorwaarden</Link>
                <Link href="/cookiebeleid">Cookies</Link>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <div className="lp-f-copy">© 2025 OpenRegio · www.openregio.nl</div>
            <div className="lp-f-slogan">Sterke ondernemers. Sterke regio's.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
