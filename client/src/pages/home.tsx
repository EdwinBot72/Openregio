import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  MapPin,
  Rocket,
  Play,
  ShieldCheck,
  TrendingUp,
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
  LayoutDashboard,
  Star,
  Calendar,
  Lightbulb,
  Heart,
  ShoppingBag,
  Mic,
  Building2,
  Target,
  Menu,
  X,
  Handshake,
  Briefcase,
  Stethoscope,
  Cpu,
  ShoppingCart,
  Wrench,
  Coffee,
  CheckCircle,
  Bot,
  ChevronRight,
  Lock,
  Zap,
  FileSearch,
  Gavel,
  Dumbbell,
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
              <div className="lp-brand-pin">
                <MapPin size={20} />
              </div>
              <div className="lp-brand-name">
                Open<b>Regio</b>
              </div>
            </a>

            <nav className="lp-nav-links">
              <a href="#pijlers" className="lp-nav-link">Hoe het werkt</a>
              <a href="#woo" className="lp-nav-link">WOO-check</a>
              <a href="#aanbod" className="lp-nav-link">Aanbod</a>
            </nav>

            <div className="lp-nav-cta">
              <Link href="/login" className="lp-btn-ghost-nav" data-testid="link-nav-login">
                Inloggen
              </Link>
              <Link href="/register" className="lp-btn-orange-nav" data-testid="link-nav-register">
                Abonnement starten <ChevronRight size={14} />
              </Link>
            </div>

            <button
              className="lp-nav-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu openen"
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className={`lp-mobile-menu${mobileOpen ? " open" : ""}`}>
          <a href="#pijlers" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Hoe het werkt</a>
          <a href="#woo" className="lp-nav-link" onClick={() => setMobileOpen(false)}>WOO-check</a>
          <a href="#aanbod" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Aanbod</a>
          <div className="lp-mobile-cta">
            <Link href="/login" className="lp-btn-ghost-nav" onClick={() => setMobileOpen(false)}>Inloggen</Link>
            <Link href="/register" className="lp-btn-orange-nav" onClick={() => setMobileOpen(false)}>Abonnement starten</Link>
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
                De praktische toolkit voor lokale ondernemers
              </div>
              <h1 className="lp-hero-title">
                Grip op regels.<br />
                <span className="lp-hl">Zichtbaarheid</span> die werkt.<br />
                Samen sterk.
              </h1>
              <div className="lp-hero-tagline">Sterke ondernemers. Sterke regio's.</div>
              <p className="lp-hero-desc">
                Gemeentes hebben meer bevoegdheden dan ondernemers weten. Besluiten worden genomen zonder transparantie. OpenRegio maakt dat zichtbaar — en geeft jou de instrumenten om er iets mee te doen.
              </p>
              <div className="lp-hero-btns">
                <Link href="/register" className="lp-btn-hero-orange" data-testid="link-hero-start">
                  <ArrowRight size={16} /> Aanmelden
                </Link>
                <a href="#pijlers" className="lp-btn-hero-white">
                  <Play size={14} /> Hoe het werkt
                </a>
              </div>
              <p className="lp-hero-ncc">
                <Lock size={13} />
                Voor serieuze ondernemers. Geen vrijblijvendheid.
              </p>
            </div>

            {/* Right — Town illustration */}
            <div className="lp-hero-visual">
              <div className="lp-town-scene">
                <div className="lp-town-buildings">
                  {/* Clouds */}
                  <div className="lp-cloud" style={{ width: 60, height: 22, top: 18, left: 20, boxShadow: "30px 0 0 22px white, -30px 0 0 18px white" }} />
                  <div className="lp-cloud" style={{ width: 40, height: 18, top: 12, right: 40, boxShadow: "22px 0 0 16px white, -18px 0 0 14px white" }} />

                  {/* Tree left */}
                  <div className="lp-tree">
                    <div style={{ width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: "28px solid #2E8B4A" }} />
                    <div style={{ width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: "28px solid #2E8B4A", marginTop: -10 }} />
                    <div style={{ width: 8, height: 14, background: "#8B5E3C", marginTop: -2 }} />
                  </div>

                  {/* BAKKER */}
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

                  {/* KAPSALON */}
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

                  {/* CAFÉ */}
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

                  {/* Kerk / toren */}
                  <div className="lp-building">
                    <div className="lp-church-spire" />
                    <div className="lp-church-body">
                      <div className="lp-church-window" />
                    </div>
                  </div>

                  {/* Tree right */}
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

      {/* ── HERKEN JE DIT? ── */}
      <div style={{ background: "#fff8f0", borderTop: "1px solid #fde68a", borderBottom: "1px solid #fde68a", padding: "40px 0" }}>
        <div className="lp-wrap">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800, color: "#C46B08", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Herken je dit?</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f2942", margin: 0 }}>Regels veranderen. Besluiten worden genomen.<br /><span style={{ color: "#E8820C" }}>Maar jij hoort het als laatste.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { ico: "🍺", bg: "#EBF4FD", border: "#BFDBFE", title: "Je terras moet ineens weg", desc: "Gemeente herziet een vergunning, maar de echte reden staat nergens. Via WOO haal je de interne adviezen boven tafel." },
              { ico: "📄", bg: "#FEF3E2", border: "#FDE68A", title: "Je krijgt een brief die je niet begrijpt", desc: "Juridisch taalgebruik, verwijzingen naar artikelnummers. OpenRegio legt uit wat er van jou verwacht wordt." },
              { ico: "⚖️", bg: "#EAF6EE", border: "#A7F3D0", title: "Jij wordt gehandhaafd, je buurman niet", desc: "Selectief handhaven is vaker regel dan uitzondering. WOO legt bloot of de gemeente consistent optreedt." },
              { ico: "📍", bg: "#EDE9FE", border: "#DDD6FE", title: "Nieuwe regel geldt ook voor jou", desc: "Een nieuw bestemmingsplan of maatregel raakt jouw bedrijf. Begrijp tijdig wat de impact is — en wat je kunt doen." },
            ].map((s) => (
              <div key={s.title} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: "18px 16px" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.ico}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f2942", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PIJLERS ── */}
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
                  { icon: <Mail size={13} />, t: "Brieven begrijpen", s: "Overheidsbrieven helder uitgelegd" },
                  { icon: <Scale size={13} />, t: "Regels uitleggen", s: "Wat betekent het voor jouw bedrijf?" },
                  { icon: <FileCheck size={13} />, t: "Vergunningen volgen", s: "Status, deadlines, automatische alerts" },
                  { icon: <Info size={13} />, t: "WOO-check door OpenRegio", s: "Stuur je brief op — wij doen de rest" },
                  { icon: <ArrowRight size={13} />, t: "Praktische vervolgstappen", s: "Wat kun je doen en wanneer?" },
                ].map((f) => (
                  <div key={f.t} className="lp-pc-feat">
                    <div className="lp-pcf-ico">{f.icon}</div>
                    <div><div className="lp-pcf-t">{f.t}</div><div className="lp-pcf-s">{f.s}</div></div>
                  </div>
                ))}
              </div>
              <div className="lp-pc-foot">
                <div className="lp-pc-foot-inner">
                  <div className="lp-pcf-target"><Target size={14} /></div>
                  <p>Weet wat er speelt en wat je moet doen</p>
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
                  { icon: <Globe size={13} />, t: "Website check", s: "Sterk, snel en klantvriendelijk?" },
                  { icon: <Search size={13} />, t: "Lokale vindbaarheid", s: "Google én AI-zoekmachines" },
                  { icon: <Star size={13} />, t: "Google-profiel optimaliseren", s: "Stap voor stap, in 15 minuten" },
                  { icon: <LayoutDashboard size={13} />, t: "Online basis op orde", s: "Techniek, inhoud en uitstraling" },
                  { icon: <TrendingUp size={13} />, t: "Minder afhankelijkheid", s: "Minder betalen aan advertenties" },
                ].map((f) => (
                  <div key={f.t} className="lp-pc-feat">
                    <div className="lp-pcf-ico">{f.icon}</div>
                    <div><div className="lp-pcf-t">{f.t}</div><div className="lp-pcf-s">{f.s}</div></div>
                  </div>
                ))}
              </div>
              <div className="lp-pc-foot">
                <div className="lp-pc-foot-inner">
                  <div className="lp-pcf-target"><Target size={14} /></div>
                  <p>Zorg dat klanten je lokaal blijven vinden</p>
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
                  { icon: <Users size={13} />, t: "Samenwerken", s: "Verbind met ondernemers in jouw buurt" },
                  { icon: <Calendar size={13} />, t: "Lokale acties organiseren", s: "Events, workshops en buurtacties" },
                  { icon: <Lightbulb size={13} />, t: "Personeel & kennis delen", s: "Leer van anderen in jouw sector" },
                  { icon: <Heart size={13} />, t: "Klantenbinding", s: "Meer terugkerende klanten" },
                  { icon: <Star size={13} />, t: "Elkaar versterken", s: "Samen de regio aantrekkelijker maken" },
                ].map((f) => (
                  <div key={f.t} className="lp-pc-feat">
                    <div className="lp-pcf-ico">{f.icon}</div>
                    <div><div className="lp-pcf-t">{f.t}</div><div className="lp-pcf-s">{f.s}</div></div>
                  </div>
                ))}
              </div>
              <div className="lp-pc-foot">
                <div className="lp-pc-foot-inner">
                  <div className="lp-pcf-target"><Target size={14} /></div>
                  <p>Samen maak je de regio sterker</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WOO TRANSPARANTIE SECTIE ── */}
      <section id="woo" style={{ background: "#0A2D6E", padding: "72px 0", position: "relative", overflow: "hidden" }}>
        {/* Decoratieve achtergrond-blokken */}
        <div style={{ position: "absolute", top: -40, right: -60, width: 280, height: 280, background: "rgba(255,255,255,.04)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, background: "rgba(255,255,255,.03)", borderRadius: "50%", pointerEvents: "none" }} />

        <div className="lp-wrap">
          {/* Koptekst */}
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

          {/* Scenario-illustratie: stap voor stap */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
            {[
              {
                step: "1",
                accent: "#FDE68A",
                icon: <Mail size={28} style={{ color: "#FDE68A" }} />,
                title: "Jij stuurt ons de brief",
                desc: "Ontvang je een brief van de gemeente die je niet begrijpt, of klinkt een besluit niet eerlijk? Stuur hem op naar OpenRegio.",
              },
              {
                step: "2",
                accent: "#6EE7B7",
                icon: <FileSearch size={28} style={{ color: "#6EE7B7" }} />,
                title: "OpenRegio doet de WOO-check",
                desc: "Wij beoordelen de brief en voeren waar nodig een WOO-check uit op de interne adviezen, memo's en e-mails van de gemeente.",
              },
              {
                step: "3",
                accent: "#93C5FD",
                icon: <Lightbulb size={28} style={{ color: "#93C5FD" }} />,
                title: "De echte reden komt boven tafel",
                desc: "Wat de gemeente intern besprak maar niet aan jou vertelde. Jij weet nu wat er werkelijk speelt achter het officiële besluit.",
              },
              {
                step: "4",
                accent: "#F9A8D4",
                icon: <Gavel size={28} style={{ color: "#F9A8D4" }} />,
                title: "Jij beslist wat je doet",
                desc: "Bezwaar maken, publiceren of gewoon beter begrijpen — de keuze is aan jou. Wij leveren de feiten, jij bepaalt de volgende stap.",
              },
            ].map((s) => (
              <div key={s.step} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: "24px 20px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, background: s.accent + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: s.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>Stap {s.step}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.35 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Concreet voorbeeld — terras */}
          <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(253,230,138,.25)", borderRadius: 18, padding: "28px 32px", display: "flex", gap: 28, flexWrap: "wrap" as const, alignItems: "flex-start" }}>
            {/* Mini town-illustratie */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                {/* Café gebouw */}
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#FDE68A", marginBottom: 2, letterSpacing: "0.05em" }}>CAFÉ</div>
                  <div style={{ width: 54, height: 70, background: "#1E3D7A", border: "1.5px solid #2E5DA0", borderRadius: "5px 5px 0 0", position: "relative", display: "flex", flexDirection: "column" as const, alignItems: "center", paddingTop: 6 }}>
                    <div style={{ width: "100%", height: 8, background: "repeating-linear-gradient(90deg,#E8820C 0,#E8820C 6px,rgba(255,255,255,.15) 6px,rgba(255,255,255,.15) 12px)", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 5 }}>
                      <div style={{ width: 14, height: 14, background: "rgba(232,130,12,.3)", borderRadius: 2 }} />
                      <div style={{ width: 14, height: 14, background: "rgba(232,130,12,.3)", borderRadius: 2 }} />
                    </div>
                    <div style={{ width: 18, height: 24, background: "rgba(232,130,12,.25)", borderRadius: "2px 2px 0 0", marginTop: "auto" }} />
                  </div>
                </div>
                {/* Terras */}
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
                  <div style={{ fontSize: 16 }}>☂</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <div style={{ width: 16, height: 12, background: "#2E5DA0", borderRadius: 3 }} />
                    <div style={{ width: 16, height: 12, background: "#2E5DA0", borderRadius: 3 }} />
                  </div>
                  <div style={{ width: 52, height: 4, background: "#1A3D6E", borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ width: 110, height: 6, background: "#1A3D6E", borderRadius: 2 }} />
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 4, fontStyle: "italic" }}>Terras teruggedraaid</div>
            </div>

            {/* Tekst */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#FDE68A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Voorbeeld — Terrasvergunning</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 10, lineHeight: 1.35 }}>Je terras moet weg. Maar waarom eigenlijk?</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.7, margin: "0 0 16px" }}>
                Een horecaondernemer moest zijn terras inleveren na een gemeentebesluit. De officiële brief noemde "verkeersveiligheid". Via een WOO-verzoek kwamen de interne adviezen boven tafel — waaruit bleek dat de werkelijke reden een subjectieve beoordeling van een ambtenaar was die nooit openbaar was gemaakt. De ondernemer maakte bezwaar en kreeg zijn terras terug.
              </p>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#FDE68A", color: "#0A2D6E", fontWeight: 800, fontSize: 13, padding: "10px 18px", borderRadius: 10, textDecoration: "none" }} data-testid="link-woo-transparantie-cta">
                <Mail size={15} /> Stuur je brief op
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ── ACCOUNTVERGELIJKING ── */}
      <section style={{ background: "#f0f4fb", padding: "72px 0" }} id="aanbod">
        <div className="lp-wrap">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="lp-sec-label lp-sl-marine" style={{ justifyContent: "center" }}>Lidmaatschap</div>
            <h2 className="lp-sec-title" style={{ textAlign: "center" }}>Kies jouw account</h2>
            <p className="lp-sec-sub" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
              Twee plannen. Helder verschil. Beide maandelijks opzegbaar.
            </p>
          </div>

          {/* Plankaarten */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 720, margin: "0 auto 48px" }}>
            {[
              {
                id: "basis", name: "Basis", price: "€14,95", period: "excl. btw / mnd",
                tagline: "Meekijken, profiel aanmaken en lokaal meedoen.",
                color: "#1E6DB5", badge: "BASIS",
                highlight: false,
                perks: [
                  "Sectorregels bekijken",
                  "Brief analyseren",
                  "Website-scan (basis)",
                  "Bedrijfsprofiel aanmaken",
                  "Netwerk bekijken",
                  "Lokale acties plaatsen",
                  "Marktplaats: reageren",
                  "Blog lezen",
                ],
              },
              {
                id: "pro", name: "Pro", price: "€59", period: "excl. btw / mnd",
                tagline: "Alle tools, onbeperkt gebruik en maximale zichtbaarheid.",
                color: "#7C3AED", badge: "PRO",
                highlight: true,
                perks: [
                  "Alles van Basis",
                  "Wat komt eraan? — volledig",
                  "Vindbaarheid & SEO-tools",
                  "RegioBot onbeperkt",
                  "WOO-bibliotheek",
                  "Netwerk: volledig deelnemen",
                  "Marktplaats: zelf plaatsen",
                  "Prioriteit ondersteuning",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.id}
                data-testid={`card-plan-${plan.id}-home`}
                style={{
                  background: "white",
                  borderRadius: 16,
                  border: plan.highlight ? `2px solid ${plan.color}` : "2px solid #e2e8f0",
                  padding: "28px 24px",
                  position: "relative",
                  boxShadow: plan.highlight ? `0 4px 24px ${plan.color}22` : "0 1px 6px rgba(0,0,0,.06)",
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: plan.color, color: "white", fontSize: 10, fontWeight: 900,
                    padding: "3px 16px", borderRadius: 20, letterSpacing: "0.1em", whiteSpace: "nowrap",
                  }}>
                    MEEST GEKOZEN
                  </div>
                )}
                <div style={{
                  display: "inline-block", background: plan.color + "15", color: plan.color,
                  fontSize: 10, fontWeight: 900, padding: "3px 12px", borderRadius: 20,
                  letterSpacing: "0.08em", marginBottom: 12,
                }}>
                  {plan.badge}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f2942", lineHeight: 1, marginBottom: 4 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>{plan.period}</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 18, lineHeight: 1.5 }}>{plan.tagline}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginBottom: 20, width: "fit-content" }}>
                  <Check size={11} /> Maandelijks opzegbaar
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {plan.perks.map((p, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#334155", marginBottom: 7 }}>
                      <Check size={14} style={{ color: plan.color, flexShrink: 0, marginTop: 1 }} />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/lidmaatschap?plan=${plan.id}`}
                  data-testid={`link-plan-${plan.id}-start`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    marginTop: 24, padding: "11px 0", borderRadius: 10, fontWeight: 700, fontSize: 14,
                    background: plan.color, color: "white", textDecoration: "none",
                  }}
                >
                  <ArrowRight size={15} /> Start met {plan.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Vergelijkingstabel */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", maxWidth: 720, margin: "0 auto", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f2942", margin: 0 }}>Wat zit er precies in?</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12, width: "50%" }}>Functie</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", color: "#1E6DB5", fontWeight: 800, fontSize: 12 }}>Basis</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", color: "#7C3AED", fontWeight: 800, fontSize: 12 }}>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Sectorregels",        basis: true,  pro: true,  basisLabel: "Bekijken",        proLabel: "Bekijken" },
                    { label: "Wat komt eraan?",     basis: false, pro: true,  basisLabel: "Teaser",          proLabel: "Volledig" },
                    { label: "Brief analyseren",    basis: true,  pro: true,  basisLabel: "Volledig",        proLabel: "Volledig" },
                    { label: "Website-scan",        basis: true,  pro: true,  basisLabel: "Basis scan",      proLabel: "Volledig" },
                    { label: "Vindbaarheid",        basis: false, pro: true,  basisLabel: "—",               proLabel: "Volledig" },
                    { label: "Bedrijfsprofiel",     basis: true,  pro: true,  basisLabel: "Aanmaken",        proLabel: "Uitgebreid" },
                    { label: "Netwerk",             basis: true,  pro: true,  basisLabel: "Alleen bekijken", proLabel: "Volledig" },
                    { label: "Lokale acties",       basis: true,  pro: true,  basisLabel: "Plaatsen",        proLabel: "Plaatsen" },
                    { label: "Marktplaats",         basis: true,  pro: true,  basisLabel: "Reageren",        proLabel: "Plaatsen" },
                    { label: "Blog",                basis: true,  pro: true,  basisLabel: "Lezen",           proLabel: "Lezen" },
                    { label: "RegioBot",            basis: false, pro: true,  basisLabel: "—",               proLabel: "Onbeperkt" },
                    { label: "WOO-bibliotheek",     basis: false, pro: true,  basisLabel: "—",               proLabel: "Volledig" },
                  ].map((row, i) => (
                    <tr key={row.label} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafbfd" }}>
                      <td style={{ padding: "9px 16px", color: "#334155", fontWeight: 500 }}>{row.label}</td>
                      <td style={{ padding: "9px 12px", textAlign: "center" }}>
                        {row.basis
                          ? <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }}>{row.basisLabel}</span>
                          : <span style={{ color: "#9333ea", fontSize: 12, fontWeight: 600 }}>Pro nodig</span>
                        }
                      </td>
                      <td style={{ padding: "9px 12px", textAlign: "center" }}>
                        <span style={{ color: "#7C3AED", fontSize: 12, fontWeight: 700 }}>{row.proLabel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <Lock size={12} /> Maandelijks opzegbaar · Veilige betaling via Mollie
            </div>
          </div>
        </div>
      </section>

      {/* ── DOELGROEPEN ── */}
      <section className="lp-dg-section">
        <div className="lp-wrap">
          <div style={{ textAlign: "center", marginBottom: 0 }}>
            <div className="lp-sec-label lp-sl-marine" style={{ justifyContent: "center" }}>Voor wie</div>
            <h2 className="lp-sec-title" style={{ textAlign: "center" }}>Voor elke lokale ondernemer</h2>
            <p className="lp-sec-sub" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>Of je nu een bakker, loodgieter of fysiotherapeut bent.</p>
          </div>
          <div className="lp-dg-grid">
            {[
              { icon: <Coffee size={22} />, name: "Horeca" },
              { icon: <ShoppingCart size={22} />, name: "Winkels" },
              { icon: <Wrench size={22} />, name: "Vakmensen" },
              { icon: <Briefcase size={22} />, name: "Dienstverleners" },
              { icon: <Stethoscope size={22} />, name: "Zorg" },
              { icon: <Dumbbell size={22} />, name: "Sport" },
              { icon: <Handshake size={22} />, name: "ZZP & MKB" },
            ].map((d) => (
              <div key={d.name} className="lp-dg-item" data-testid={`item-sector-${d.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}`}>
                <div className="lp-dg-ico">{d.icon}</div>
                <div className="lp-dg-name">{d.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA BANNER ── */}
      <section className="lp-cta-banner">
        <div className="lp-wrap">
          <div className="lp-cta-inner">
            <div className="lp-cta-tag"><span className="lp-pulse" /> Aanmelden</div>
            <h2 className="lp-cta-title">Voor ondernemers die weten wat ze willen.</h2>
            <p className="lp-cta-sub">
              Geen vrijblijvendheid. Geen proefperiodes. Gewoon een platform dat werkt.
            </p>
            <div className="lp-cta-btns">
              <Link href="/register" className="lp-btn-cta-orange" data-testid="link-cta-register">
                <ArrowRight size={16} /> Nu aanmelden
              </Link>
              <Link href="/lidmaatschap" className="lp-btn-cta-ghost" data-testid="link-cta-lidmaatschap">
                <Info size={16} /> Meer informatie
              </Link>
            </div>
            <div className="lp-cta-trust">
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> AVG-compliant</div>
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> Opgericht door lokale ondernemers</div>
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> Maandelijks opzegbaar</div>
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> Veilig en privacyvriendelijk</div>
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
              <div className="lp-f-tag">
                Grip op regels. Zichtbaarheid die werkt. Samen sterk in jouw regio.
              </div>
            </div>
            <div>
              <div className="lp-f-head">Platform</div>
              <div className="lp-f-links">
                <a href="#pijlers">Grip op Regels</a>
                <a href="#pijlers">Lokale Zichtbaarheid</a>
                <a href="#lokale-kracht">Lokale Kracht</a>
                <Link href="/regels/woo">RegioBot</Link>
                <Link href="/regels/woo">WOO-verzoek</Link>
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
