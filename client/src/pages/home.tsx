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
          <a href="#pijlers" className="lp-nav-link" onClick={() => setMobileOpen(false)}>De drie pijlers</a>
          <a href="#lokale-kracht" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Lokale kracht</a>
          <a href="#resultaten" className="lp-nav-link" onClick={() => setMobileOpen(false)}>Resultaten</a>
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
            <div className="lp-trust-item lp-trust-last"><Check size={16} style={{ color: "#4ADE80" }} /> 1.200+ ondernemers gebruiken het dagelijks</div>
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

      {/* ── WOO BEWIJS ── */}
      <section className="lp-proof-section" id="resultaten">
        <div className="lp-wrap">
          <div className="lp-sec-label lp-sl-marine">Wat WOO-verzoeken blootleggen</div>
          <h2 className="lp-sec-title">De overheid heeft meer macht dan je denkt.<br />Maar jij hebt rechten.</h2>
          <p className="lp-sec-sub" style={{ maxWidth: 620 }}>
            Via de Wet Open Overheid kun je interne documenten, adviezen en e-mails van de gemeente opvragen. Wat er boven tafel komt, verrast elke keer. Dit zijn patronen die we keer op keer zien.
          </p>
          <div className="lp-proof-grid" style={{ marginTop: 36 }}>

            {/* Casus 1 — Terrasvergunning */}
            <div className="lp-proof-card" style={{ borderTop: "3px solid #0A2D6E" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: "#EBF4FD", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileSearch size={16} style={{ color: "#0A2D6E" }} />
                </div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800, color: "#0A2D6E", letterSpacing: "0.06em", textTransform: "uppercase" }}>Casus — Terrasvergunning</div>
              </div>
              <div className="lp-proof-stat" style={{ color: "#0A2D6E", fontSize: 36 }}>Ongelijke<br />behandeling</div>
              <div className="lp-proof-stat-lbl" style={{ color: "#1E6DB5", marginBottom: 14 }}>Buurman kreeg wél vergunning</div>
              <div className="lp-proof-quote" style={{ fontStyle: "normal", fontSize: 13.5, lineHeight: 1.7 }}>
                Een horecaondernemer werd twee keer afgewezen voor een terrasvergunning. Zijn buurman — zelfde straat, zelfde situatie — had al jaren een terras. Via een WOO-verzoek kwamen de interne adviezen boven tafel. Daaruit bleek dat de ambtenaar in zijn memo expliciet schreef dat het terras "visueel storend" was — een subjectieve afweging die nooit in de officiële afwijzing stond. De ondernemer maakte bezwaar, won, en heeft nu zijn terras.
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "#EBF4FD", borderRadius: 10, fontSize: 12, color: "#0A2D6E", fontWeight: 600, lineHeight: 1.5 }}>
                <Lightbulb size={14} style={{ verticalAlign: -2, marginRight: 5 }} />
                Wat het WOO-verzoek blootlegde: de werkelijke reden voor afwijzing stond nergens in de officiële documenten.
              </div>
            </div>

            {/* Casus 2 — Bestemmingsplan */}
            <div className="lp-proof-card" style={{ borderTop: "3px solid #E8820C" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: "#FEF3E2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 size={16} style={{ color: "#E8820C" }} />
                </div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800, color: "#C46B08", letterSpacing: "0.06em", textTransform: "uppercase" }}>Casus — Bestemmingsplan</div>
              </div>
              <div className="lp-proof-stat" style={{ color: "#E8820C", fontSize: 36 }}>Intern advies<br />verzwegen</div>
              <div className="lp-proof-stat-lbl" style={{ color: "#C46B08", marginBottom: 14 }}>Ambtenaar adviseerde anders</div>
              <div className="lp-proof-quote" style={{ fontStyle: "normal", fontSize: 13.5, lineHeight: 1.7 }}>
                Een winkelier ontdekte dat er naast zijn zaak een AZC gepland stond. Het college had publiekelijk gezegd dat alle belangen "zorgvuldig waren afgewogen". Via een WOO-verzoek op de besluitvormingsdocumenten bleek dat de eigen ambtenaar intern had geschreven dat de locatiekeuze "economisch ongunstig" was voor de omliggende ondernemers — en dat dit advies bewust niet in het raadsvoorstel was opgenomen.
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "#FEF3E2", borderRadius: 10, fontSize: 12, color: "#C46B08", fontWeight: 600, lineHeight: 1.5 }}>
                <Lightbulb size={14} style={{ verticalAlign: -2, marginRight: 5 }} />
                Wat het WOO-verzoek blootlegde: een intern ambtelijk advies dat de gemeenteraad nooit heeft ontvangen.
              </div>
            </div>

            {/* Casus 3 — Handhaving */}
            <div className="lp-proof-card" style={{ borderTop: "3px solid #2E8B4A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: "#EAF6EE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Gavel size={16} style={{ color: "#2E8B4A" }} />
                </div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 800, color: "#236839", letterSpacing: "0.06em", textTransform: "uppercase" }}>Casus — Handhaving</div>
              </div>
              <div className="lp-proof-stat" style={{ color: "#2E8B4A", fontSize: 36 }}>Selectief<br />handhaven</div>
              <div className="lp-proof-stat-lbl" style={{ color: "#236839", marginBottom: 14 }}>Grote speler ongemoeid gelaten</div>
              <div className="lp-proof-quote" style={{ fontStyle: "normal", fontSize: 13.5, lineHeight: 1.7 }}>
                Een zzp'er kreeg een handhavingsbesluit voor een reclamebord dat "niet voldeed aan de welstandsnota". Een grote franchiseketen twee straten verder had identieke borden — al jaren. Via een WOO-verzoek op de handhavingsgeschiedenis bleek dat de gemeente bij de franchiseketen nooit had gehandhaafd, en dat er intern een e-mail was waarin stond dat handhaving bij grote ketens "juridisch complex" was en daarom werd vermeden.
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "#EAF6EE", borderRadius: 10, fontSize: 12, color: "#236839", fontWeight: 600, lineHeight: 1.5 }}>
                <Lightbulb size={14} style={{ verticalAlign: -2, marginRight: 5 }} />
                Wat het WOO-verzoek blootlegde: de gemeente handhaafde bewust selectief, kleine ondernemers als eerste.
              </div>
            </div>

          </div>

          {/* WOO CTA blok */}
          <div style={{ marginTop: 32, background: "#0A2D6E", borderRadius: 20, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" as const }}>
            <div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 900, color: "white", marginBottom: 6 }}>Herken jij dit patroon?</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.6)", fontWeight: 500, maxWidth: 500, lineHeight: 1.6 }}>
                OpenRegio stelt het WOO-verzoek voor jou op — juridisch correct, op jouw naam. Jij hoeft alleen te tekenen. Wat er boven tafel komt, beslis jij wat ermee gebeurt.
              </div>
            </div>
            <Link href="/register" className="lp-btn-off" style={{ whiteSpace: "nowrap", flexShrink: 0 }} data-testid="link-proof-woo-cta">
              <FileSearch size={16} /> WOO-verzoek indienen
            </Link>
          </div>

        </div>
      </section>

      {/* ── AANBOD / OFFER ── */}
      <section className="lp-offer-section" id="aanbod">
        <div className="lp-wrap">
          <div className="lp-offer-in">
            {/* Left */}
            <div>
              <div className="lp-off-eyebrow">Lidmaatschap</div>
              <h2 className="lp-off-title">Een instrument voor wie het serieus neemt.</h2>
              <p className="lp-off-desc">
                OpenRegio is geen app die je downloadt en vergeet. Het is een werkplatform. Je betaalt omdat je er dagelijks gebruik van maakt — en omdat je resultaat verwacht.
              </p>
              <div className="lp-off-guarantee">
                <div className="lp-off-g-ico"><Lock size={20} /></div>
                <div>
                  <div className="lp-off-g-t">Alleen voor ondernemers die het serieus nemen.</div>
                  <div className="lp-off-g-s">OpenRegio is een werkinstrument, geen proefabonnement. Je betaalt omdat je resultaat wil — niet om het een keer te proberen.</div>
                </div>
              </div>
              <Link href="/register" className="lp-btn-off" data-testid="link-offer-start">
                <ArrowRight size={16} /> Aanmelden
              </Link>
              <div className="lp-off-nohype">
                <Lock size={13} /> Maandelijks opzegbaar. Geen vrijblijvendheid.
              </div>
            </div>

            {/* Right — feature stack */}
            <div className="lp-offer-stack">
              {[
                {
                  ico: <Mail size={21} style={{ color: "#7EC8F8" }} />,
                  bg: "rgba(30,109,181,.25)",
                  tag: "Pijler 1",
                  name: "Brief analyseren in 60 seconden",
                  desc: "Upload een overheidsbrief — wij leggen uit wat er staat en wat je moet doen.",
                },
                {
                  ico: <Globe size={21} style={{ color: "#4ADE80" }} />,
                  bg: "rgba(46,139,74,.25)",
                  tag: "Pijler 2",
                  name: "Gevonden worden zonder te betalen",
                  desc: "Website scan, Google-profiel optimalisatie, wekelijkse vindbaarheids-updates.",
                },
                {
                  ico: <Users size={21} style={{ color: "#E8820C" }} />,
                  bg: "rgba(232,130,12,.25)",
                  tag: "Pijler 3",
                  name: "Sterk netwerk in jouw regio",
                  desc: "Verbind, organiseer en verdien €25 per ondernemer die jij aanmeldt.",
                },
                {
                  ico: <Bot size={21} style={{ color: "#7EC8F8" }} />,
                  bg: "rgba(126,200,248,.2)",
                  tag: "24/7 beschikbaar",
                  name: "RegioBot — jouw persoonlijke assistent",
                  desc: "Stel elke vraag over regelgeving, zichtbaarheid of je regio. Dag en nacht.",
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

      {/* ── WAAROM ── */}
      <section className="lp-waarom">
        <div className="lp-wrap">
          <div style={{ textAlign: "center" }}>
            <div className="lp-sec-label lp-sl-marine" style={{ justifyContent: "center" }}>Waarom OpenRegio</div>
            <h2 className="lp-sec-title" style={{ textAlign: "center" }}>Meer overzicht. Minder gedoe.</h2>
          </div>
          <div className="lp-waarom-grid">
            {[
              { ico: <LayoutDashboard size={26} />, bg: "#EBF4FD", ic: "#1E6DB5", title: "Meer overzicht", desc: "Brieven, vergunningen, scores en netwerk — alles in één dashboard" },
              { ico: <Zap size={26} />, bg: "#EAF6EE", ic: "#2E8B4A", title: "Minder gedoe", desc: "Geen jargon, geen zoekwerk — directe actie" },
              { ico: <Wrench size={26} />, bg: "#FEF3E2", ic: "#E8820C", title: "Praktische tools", desc: "Brief analyseren, website scannen, WOO-verzoek — ingebouwd" },
              { ico: <MapPin size={26} />, bg: "#EDE9FE", ic: "#7C3AED", title: "Regionale steun", desc: "Verbonden met ondernemers in jouw eigen buurt" },
              { ico: <Rocket size={26} />, bg: "#EAF6EE", ic: "#2E8B4A", title: "Toekomstbestendig", desc: "AI-coach, WOO-service en nieuwe functies — elke week beter" },
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
              <div className="lp-cta-ti"><Check size={15} style={{ color: "#4ADE80" }} /> 1.200+ ondernemers voor je</div>
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
