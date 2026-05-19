import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  MapPin,
  Rocket,
  Play,
  ShieldCheck,
  Clock,
  TrendingUp,
  Euro,
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
              <a href="#pijlers" className="lp-nav-link">De drie pijlers</a>
              <a href="#lokale-kracht" className="lp-nav-link">Lokale kracht</a>
              <a href="#resultaten" className="lp-nav-link">Resultaten</a>
              <a href="#aanbod" className="lp-nav-link">Aanbod</a>
            </nav>

            <div className="lp-nav-cta">
              <Link href="/login" className="lp-btn-ghost-nav" data-testid="link-nav-login">
                Inloggen
              </Link>
              <Link href="/register" className="lp-btn-orange-nav" data-testid="link-nav-register">
                Gratis starten <ChevronRight size={14} />
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
          <a href="#pijlers" className="lp-nav-link" onClick={() => setMobileOpen(false)}>De drie pijlers</a>
          <a href="#lokale-kracht" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Lokale kracht</a>
          <a href="#resultaten" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Resultaten</a>
          <a href="#aanbod" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Aanbod</a>
          <div className="lp-mobile-cta">
            <Link href="/login" className="lp-btn-ghost-nav" onClick={() => setMobileOpen(false)}>Inloggen</Link>
            <Link href="/register" className="lp-btn-orange-nav" onClick={() => setMobileOpen(false)}>Gratis starten</Link>
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
                OpenRegio is jouw partner voor grip op regelgeving, lokale zichtbaarheid en regionale samenwerking. Alles op één plek — zodat jij je kunt richten op wat je het liefst doet.
              </p>
              <div className="lp-hero-btns">
                <Link href="/register" className="lp-btn-hero-orange" data-testid="link-hero-start">
                  <Rocket size={16} /> Gratis beginnen
                </Link>
                <a href="#pijlers" className="lp-btn-hero-white">
                  <Play size={14} /> Hoe het werkt
                </a>
              </div>
              <p className="lp-hero-ncc">
                <ShieldCheck size={13} />
                Geen creditcard nodig. Gratis basisaccount altijd beschikbaar.
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
            <div className="lp-trust-item lp-trust-last"><Check size={16} style={{ color: "#4ADE80" }} /> 1.200+ actieve ondernemers</div>
          </div>
        </div>
      </section>

      {/* ── WAARDE STRIP ── */}
      <div className="lp-waarde-strip">
        <div className="lp-wrap">
          <div className="lp-waarde-in">
            <div className="lp-ws-item">
              <div className="lp-ws-ico" style={{ background: "#EBF4FD" }}><Clock size={19} style={{ color: "#1E6DB5" }} /></div>
              <div><div className="lp-ws-val">8 uur</div><div className="lp-ws-lbl">bespaard per week</div></div>
            </div>
            <div className="lp-ws-item">
              <div className="lp-ws-ico" style={{ background: "#D1FAE5" }}><TrendingUp size={19} style={{ color: "#2E8B4A" }} /></div>
              <div><div className="lp-ws-val">+2 pos.</div><div className="lp-ws-lbl">hoger in Google Maps</div></div>
            </div>
            <div className="lp-ws-item">
              <div className="lp-ws-ico" style={{ background: "#FEF3C7" }}><Euro size={19} style={{ color: "#E8820C" }} /></div>
              <div><div className="lp-ws-val">€25</div><div className="lp-ws-lbl">per referral verdiend</div></div>
            </div>
            <div className="lp-ws-item">
              <div className="lp-ws-ico" style={{ background: "#EDE9FE" }}><Mail size={19} style={{ color: "#7C3AED" }} /></div>
              <div><div className="lp-ws-val">60 sec</div><div className="lp-ws-lbl">brief geanalyseerd</div></div>
            </div>
            <div className="lp-ws-item">
              <div className="lp-ws-ico" style={{ background: "#D1FAE5" }}><Users size={19} style={{ color: "#2E8B4A" }} /></div>
              <div><div className="lp-ws-val">1.200+</div><div className="lp-ws-lbl">lokale ondernemers</div></div>
            </div>
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
                  <div className="lp-pc-illus-badge">Brief in 60 sec uitgelegd</div>
                </div>
              </div>
              <div className="lp-pc-feats">
                {[
                  { icon: <Mail size={13} />, t: "Brieven begrijpen", s: "Overheidsbrieven helder uitgelegd" },
                  { icon: <Scale size={13} />, t: "Regels uitleggen", s: "Wat betekent het voor jouw bedrijf?" },
                  { icon: <FileCheck size={13} />, t: "Vergunningen volgen", s: "Status, deadlines, automatische alerts" },
                  { icon: <Info size={13} />, t: "WOO-verzoek indienen", s: "Wij stellen het op, jij tekent" },
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
                  <div className="lp-pc-illus-badge">Gemiddeld +2 posities in Maps</div>
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
                  <div className="lp-pc-illus-badge">€25 per referral verdiend</div>
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

      {/* ── LOKALE KRACHT SPOTLIGHT ── */}
      <section className="lp-lk-section" id="lokale-kracht">
        <div className="lp-wrap">
          <div className="lp-lk-in">
            {/* Left */}
            <div>
              <div className="lp-lk-badge"><Star size={13} /> Pijler 3 — uitgelicht</div>
              <h2 className="lp-lk-title">Samen sta je <span className="lp-lk-accent">sterker</span> dan alleen</h2>
              <p className="lp-lk-desc">
                Grote ketens winnen niet omdat ze beter zijn — ze winnen omdat ze georganiseerd zijn. OpenRegio geeft lokale ondernemers dezelfde kracht, zonder de keten-nadelen.
              </p>
              <div className="lp-lk-feats">
                {[
                  { icon: <MapPin size={19} />, t: "Ondernemers bij jou in de buurt", s: "Zie wie actief is in jouw regio, maak contact, werk samen" },
                  { icon: <Calendar size={19} />, t: "Lokale acties die klanten trekken", s: "Koopzondag, workshop of buurtactie — wij helpen promoten" },
                  { icon: <Euro size={19} />, t: "€25 per referral, geen limiet", s: "Verwijs een collega — zodra die Pro-lid wordt, ontvang jij €25" },
                ].map((f) => (
                  <div key={f.t} className="lp-lk-feat">
                    <div className="lp-lk-feat-ico">{f.icon}</div>
                    <div><div className="lp-lk-feat-t">{f.t}</div><div className="lp-lk-feat-s">{f.s}</div></div>
                  </div>
                ))}
              </div>
              <Link href={dashHref} className="lp-btn-lk" data-testid="link-lk-cta">
                <Users size={16} /> Bekijk jouw regio
              </Link>
            </div>

            {/* Right — mock cards */}
            <div className="lp-lk-visual">
              <div className="lp-lk-people-card">
                <div className="lp-lkp-head">
                  <div className="lp-lkp-title">Ondernemers in Rotterdam-Noord</div>
                  <div className="lp-lkp-count">24 actief</div>
                </div>
                {[
                  { init: "MV", bg: "#D1FAE5", fg: "#065F46", name: "Marianne Visser", type: "Schildersbedrijf", tag: "Nieuw" as const },
                  { init: "PH", bg: "#DBEAFE", fg: "#1E40AF", name: "Peter Hoekstra", type: "Loodgieter", tag: "Nieuw" as const },
                  { init: "SD", bg: "#FEF3C7", fg: "#92400E", name: "Sara de Boer", type: "Kapsalon", dist: "0.8 km" },
                  { init: "TK", bg: "#EDE9FE", fg: "#5B21B6", name: "Tom Koster", type: "Elektricien", dist: "3.1 km" },
                ].map((p) => (
                  <div key={p.name} className="lp-people-row">
                    <div className="lp-pav" style={{ background: p.bg, color: p.fg }}>{p.init}</div>
                    <div className="lp-p-info">
                      <div className="lp-p-name">{p.name}</div>
                      <div className="lp-p-type">{p.type}</div>
                    </div>
                    {p.tag && <div className="lp-p-tag-new">{p.tag}</div>}
                    {p.dist && <div className="lp-p-dist"><MapPin size={13} style={{ color: "#E8820C" }} />{p.dist}</div>}
                  </div>
                ))}
              </div>

              <div className="lp-akties-card">
                <div className="lp-ak-head"><Calendar size={16} /> Acties in jouw regio</div>
                {[
                  { icon: <ShoppingBag size={14} />, name: "Koopzondag Rotterdam-Noord", meta: "1 jun · gratis", badge: "Open" },
                  { icon: <Mic size={14} />, name: "Workshop: Google profiel", meta: "28 mei · online", badge: "12 plekken" },
                  { icon: <Building2 size={14} />, name: "Maandelijks ondernemersoverleg", meta: "5 jun · café", badge: "Open" },
                ].map((a) => (
                  <div key={a.name} className="lp-ak-row">
                    <div className="lp-ak-ico">{a.icon}</div>
                    <div className="lp-ak-name">{a.name}</div>
                    <div className="lp-ak-meta">{a.meta}</div>
                    <div className="lp-ak-badge">{a.badge}</div>
                  </div>
                ))}
              </div>

              <div className="lp-referral-pill">
                <div className="lp-rp-num">€25</div>
                <div>
                  <div className="lp-rp-t">Per geslaagde referral</div>
                  <div className="lp-rp-s">Maandelijks uitbetaald. Geen maximum. Geen gedoe.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTATEN / PROOF ── */}
      <section className="lp-proof-section" id="resultaten">
        <div className="lp-wrap">
          <div className="lp-sec-label lp-sl-marine">Resultaten</div>
          <h2 className="lp-sec-title">Wat andere lokale ondernemers zeggen</h2>
          <p className="lp-sec-sub" style={{ maxWidth: 500 }}>Geen superlatieven. Gewoon wat er werkelijk veranderde.</p>
          <div className="lp-proof-grid">
            {[
              {
                stat: "€800",
                statColor: "#0A2D6E",
                lbl: "Boete vermeden",
                lblColor: "#1E6DB5",
                quote: "Ik had een brief van de gemeente die ik niet begreep. OpenRegio legde in 60 seconden uit wat er stond en wat ik moest doen. Vorig jaar had dezelfde situatie me €800 gekost.",
                av: "JD", avBg: "#EBF4FD", avFg: "#0A2D6E",
                name: "Jan de Vries", role: "Bakkerij, Rotterdam",
              },
              {
                stat: "+2 pos.",
                statColor: "#2E8B4A",
                lbl: "In Google Maps na 30 dagen",
                lblColor: "#2E8B4A",
                quote: "Mijn Google-profiel was leeg. OpenRegio leidde me stap voor stap door alles. Na 30 dagen stond ik twee plekken hoger — zonder advertenties.",
                av: "SB", avBg: "#EAF6EE", avFg: "#236839",
                name: "Sara de Boer", role: "Kapsalon, Utrecht",
              },
              {
                stat: "8 uur",
                statColor: "#E8820C",
                lbl: "Per week bespaard",
                lblColor: "#E8820C",
                quote: "Ik moest eerder overal zelf uitzoeken wat ik moest doen met vergunningen en gemeentebrieven. Nu heb ik OpenRegio — dat scheelt me minstens een werkdag per week.",
                av: "PH", avBg: "#FEF3E2", avFg: "#C46B08",
                name: "Peter Hoekstra", role: "Loodgieter, Amsterdam",
              },
            ].map((c) => (
              <div key={c.name} className="lp-proof-card">
                <div className="lp-proof-stat" style={{ color: c.statColor }}>{c.stat}</div>
                <div className="lp-proof-stat-lbl" style={{ color: c.lblColor }}>{c.lbl}</div>
                <div className="lp-proof-quote">{c.quote}</div>
                <div className="lp-proof-who">
                  <div className="lp-proof-av" style={{ background: c.avBg, color: c.avFg }}>{c.av}</div>
                  <div>
                    <div className="lp-proof-name">{c.name}</div>
                    <div className="lp-proof-role">{c.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AANBOD / OFFER ── */}
      <section className="lp-offer-section" id="aanbod">
        <div className="lp-wrap">
          <div className="lp-offer-in">
            {/* Left */}
            <div>
              <div className="lp-off-eyebrow">Start vandaag</div>
              <h2 className="lp-off-title">Gratis basis,<br />altijd beschikbaar.</h2>
              <p className="lp-off-desc">
                Geen creditcard. Geen verplichting. Direct toegang tot de tools die jij als ondernemer nodig hebt — en upgrade wanneer je meer wilt.
              </p>
              <div className="lp-off-guarantee">
                <div className="lp-off-g-ico"><ShieldCheck size={20} /></div>
                <div>
                  <div className="lp-off-g-t">30 dagen tevredenheidsgarantie</div>
                  <div className="lp-off-g-s">Niet tevreden? Je krijgt je geld terug, geen vragen gesteld. Pro-abonnement, geen verplichting.</div>
                </div>
              </div>
              <Link href="/register" className="lp-btn-off" data-testid="link-offer-start">
                Gratis beginnen <ArrowRight size={16} />
              </Link>
              <div className="lp-off-nohype">
                <ShieldCheck size={13} /> Geen creditcard nodig · Direct aan de slag
              </div>
            </div>

            {/* Right — feature stack */}
            <div className="lp-offer-stack">
              {[
                {
                  ico: <Mail size={21} style={{ color: "#7EC8F8" }} />,
                  bg: "rgba(30,109,181,.3)",
                  tag: "Pijler 1",
                  name: "Grip op Regels",
                  desc: "Brief analyse, regelgeving uitleg, vergunningsbeheer en WOO-verzoeken",
                },
                {
                  ico: <Globe size={21} style={{ color: "#4ADE80" }} />,
                  bg: "rgba(46,139,74,.3)",
                  tag: "Pijler 2",
                  name: "Lokale Zichtbaarheid",
                  desc: "Website check, Google profiel, SEO en AI-vindbaarheid verbeteren",
                },
                {
                  ico: <Users size={21} style={{ color: "#FCD34D" }} />,
                  bg: "rgba(232,130,12,.3)",
                  tag: "Pijler 3",
                  name: "Lokale Kracht",
                  desc: "Samenwerken, lokale acties organiseren, kennisdelen en referrals",
                },
                {
                  ico: <Bot size={21} style={{ color: "#C4B5FD" }} />,
                  bg: "rgba(124,58,237,.3)",
                  tag: "Bonus — Pro",
                  name: "RegioBot",
                  desc: "AI-assistent voor WOO-verzoeken en overheidsdocumenten (Pro-exclusief)",
                },
              ].map((item) => (
                <div key={item.name} className="lp-offer-item">
                  <div className="lp-oi-ico" style={{ background: item.bg }}>{item.ico}</div>
                  <div>
                    <div className="lp-oi-tag">{item.tag}</div>
                    <div className="lp-oi-name">{item.name}</div>
                    <div className="lp-oi-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOELGROEPEN ── */}
      <section className="lp-dg-section">
        <div className="lp-wrap">
          <div className="lp-sec-label lp-sl-marine">Voor wie?</div>
          <h2 className="lp-sec-title">Elke lokale ondernemer</h2>
          <p className="lp-sec-sub">Van bakker tot bouwvakker — OpenRegio is er voor jou.</p>
          <div className="lp-dg-grid">
            {[
              { icon: <Coffee size={22} />, name: "Horeca" },
              { icon: <ShoppingCart size={22} />, name: "Winkels" },
              { icon: <Wrench size={22} />, name: "Vakmensen" },
              { icon: <Briefcase size={22} />, name: "Diensten" },
              { icon: <Stethoscope size={22} />, name: "Zorg" },
              { icon: <Cpu size={22} />, name: "IT & Tech" },
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

      {/* ── WAAROM ── */}
      <section className="lp-waarom">
        <div className="lp-wrap">
          <div className="lp-sec-label lp-sl-marine" style={{ justifyContent: "center" }}>Waarom OpenRegio?</div>
          <h2 className="lp-sec-title" style={{ textAlign: "center" }}>Vijf goede redenen</h2>
          <div className="lp-waarom-grid">
            {[
              { ico: <CheckCircle size={26} />, bg: "#EBF4FD", ic: "#1E6DB5", title: "Meer overzicht", desc: "Alles op één plek: regels, zichtbaarheid en samenwerking." },
              { ico: <ShieldCheck size={26} />, bg: "#EAF6EE", ic: "#2E8B4A", title: "Minder gedoe", desc: "Complexe zaken simpel gemaakt voor lokale ondernemers." },
              { ico: <Lightbulb size={26} />, bg: "#FEF3E2", ic: "#E8820C", title: "Praktische tools", desc: "AI-tools die écht helpen, geen hype, maar resultaat." },
              { ico: <Handshake size={26} />, bg: "#EBF4FD", ic: "#1E6DB5", title: "Regionale steun", desc: "Verbinding met ondernemers die dezelfde uitdagingen kennen." },
              { ico: <TrendingUp size={26} />, bg: "#EAF6EE", ic: "#2E8B4A", title: "Toekomstbestendig", desc: "Coöperatief model — winst gaat terug naar leden." },
            ].map((w) => (
              <div key={w.title} className="lp-w-item">
                <div className="lp-w-ico" style={{ background: w.bg, color: w.ic }}>{w.ico}</div>
                <div className="lp-w-title">{w.title}</div>
                <div className="lp-w-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="lp-cta-banner">
        <div className="lp-wrap">
          <div className="lp-cta-inner">
            <div className="lp-cta-tag"><span className="lp-pulse" /> Klaar om te starten?</div>
            <h2 className="lp-cta-title">Jouw regio heeft jou nodig</h2>
            <p className="lp-cta-sub">
              Sluit je aan bij 1.200+ lokale ondernemers die al grip hebben op regels, zichtbaar zijn in hun regio en samenwerken.
            </p>
            <div className="lp-cta-btns">
              <Link href="/register" className="lp-btn-cta-orange" data-testid="link-cta-register">
                <Rocket size={16} /> Gratis beginnen
              </Link>
              <Link href="/lidmaatschap" className="lp-btn-cta-ghost" data-testid="link-cta-lidmaatschap">
                Bekijk lidmaatschappen
              </Link>
            </div>
            <div className="lp-cta-trust">
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> Geen creditcard</div>
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> Direct aan de slag</div>
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> Maandelijks opzegbaar</div>
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
                Jouw partner voor grip op regelgeving, lokale zichtbaarheid en regionale samenwerking. Alles op één plek.
              </div>
            </div>
            <div>
              <div className="lp-f-head">Platform</div>
              <div className="lp-f-links">
                <Link href="/lidmaatschap">Lidmaatschap</Link>
                <Link href="/basischeck">Lokale Check</Link>
                <Link href="/blogs">Blog</Link>
                <Link href="/koop-lokaal">Koop Lokaal</Link>
              </div>
            </div>
            <div>
              <div className="lp-f-head">Gemeenschap</div>
              <div className="lp-f-links">
                <Link href="/lokale-acties">Lokale acties</Link>
                <Link href="/network">Netwerk</Link>
                <a href="#pijlers">De drie pijlers</a>
              </div>
            </div>
            <div>
              <div className="lp-f-head">Info</div>
              <div className="lp-f-links">
                <Link href="/privacy">Privacy</Link>
                <Link href="/voorwaarden">Voorwaarden</Link>
                <Link href="/disclaimer">Disclaimer</Link>
                <Link href="/cookiebeleid">Cookies</Link>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <div className="lp-f-copy">© 2026 OpenRegio. Alle rechten voorbehouden.</div>
            <div className="lp-f-slogan">Sterke ondernemers. Sterke regio's.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
