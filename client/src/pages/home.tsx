import { useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  MapPin,
  Users,
  Mail,
  FileCheck,
  Star,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Bell,
  Briefcase,
  ShieldCheck,
  Megaphone,
  Heart,
  ClipboardCheck,
  Compass,
  CheckCircle2,
} from "lucide-react";

const BLAUW = "#15233b";
const ORANJE = "#e8772e";
const FF = "'Barlow', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
// Compacte display-koppen (zip-huisstijl): groot, in hoofdletters.
const DISP = "'Barlow Condensed', 'Barlow', sans-serif";
const disp = (extra: CSSProperties = {}): CSSProperties => ({ fontFamily: DISP, textTransform: "uppercase", letterSpacing: ".01em", ...extra });

export default function HomePage() {
  usePageTitle("OpenRegio — Grip op regels. Kracht in de regio.");
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ fontFamily: FF, background: "#faf9f5", margin: 0, padding: 0 }}>

      {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16 }}>

            {/* Logo */}
            <Link href="/">
              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: ORANJE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <div style={disp({ fontSize: 22, fontWeight: 700, color: BLAUW, lineHeight: 1, letterSpacing: ".02em" })}>OpenRegio</div>
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="or-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <a href="#platform" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>Platform</a>
              <a href="#hulp" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>Hulp voor ondernemers</a>
              <a href="#pricing" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>Lidmaatschap</a>
              <Link href="/acties" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>Acties</Link>
              <Link href="/blogs" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>Blogs</Link>
            </nav>

            {/* Desktop buttons */}
            <div className="or-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {user ? (
                <Link href="/vandaag">
                  <button style={{ padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: ORANJE, color: "#fff", border: "none", cursor: "pointer" }}>
                    Dashboard →
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button style={{ padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: "transparent", color: BLAUW, border: `2px solid ${BLAUW}`, cursor: "pointer" }}>
                      Inloggen
                    </button>
                  </Link>
                  <Link href="/register">
                    <button style={{ padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: ORANJE, color: "#fff", border: "none", cursor: "pointer" }}>
                      Aanmelden
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="or-nav-mobile"
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}
              data-testid="button-mobile-menu"
            >
              {mobileOpen
                ? <X style={{ width: 24, height: 24, color: BLAUW }} />
                : <Menu style={{ width: 24, height: 24, color: BLAUW }} />}
            </button>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div style={{ padding: "12px 0 16px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 8 }}>
              {[["#platform", "Platform"], ["#hulp", "Hulp voor ondernemers"], ["#pricing", "Lidmaatschap"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: "#475569", textDecoration: "none", padding: "8px 4px" }}>{label}</a>
              ))}
              <Link href="/acties" onClick={() => setMobileOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: "#475569", textDecoration: "none", padding: "8px 4px" }}>Acties</Link>
              <Link href="/blogs" onClick={() => setMobileOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: "#475569", textDecoration: "none", padding: "8px 4px" }}>Blogs</Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                <Link href="/login">
                  <button onClick={() => setMobileOpen(false)} style={{ width: "100%", padding: "10px 16px", borderRadius: 8, fontSize: 15, fontWeight: 600, background: "transparent", color: BLAUW, border: `2px solid ${BLAUW}`, cursor: "pointer", textAlign: "left" }}>
                    Inloggen
                  </button>
                </Link>
                <Link href="/register">
                  <button onClick={() => setMobileOpen(false)} style={{ width: "100%", padding: "10px 16px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: ORANJE, color: "#fff", border: "none", cursor: "pointer", textAlign: "left" }}>
                    Aanmelden
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── HERO — donkerblauw blok (zip-huisstijl) ───────────────────────── */}
      <section id="platform" style={{ background: `linear-gradient(160deg, ${BLAUW} 0%, #1d3050 100%)`, padding: "clamp(56px,8vw,104px) 24px" }}>
        <div className="or-herowrap" style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 44, alignItems: "center" }}>
          <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, padding: "6px 14px", marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ORANJE }} />
            <span style={disp({ fontSize: 12.5, fontWeight: 600, letterSpacing: ".08em", color: "rgba(255,255,255,0.9)" })}>Alles begint dichtbij</span>
          </div>
          <h1 style={disp({ fontSize: "clamp(38px,6vw,76px)", fontWeight: 700, color: "#fff", lineHeight: 0.98, margin: "0 0 18px", letterSpacing: ".005em", maxWidth: "17ch" })}>
            Alles wat jouw regio <span style={{ color: ORANJE }}>te bieden heeft.</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: "0 0 24px", maxWidth: "54ch" }}>
            Koop lokaal. Ontdek workshops. Vind ondernemers. Werk samen. En krijg hulp als ondernemen ingewikkeld wordt.
          </p>
          <form action="/doe-en-leer" style={{ display: "flex", gap: 10, maxWidth: 520, flexWrap: "wrap" }}>
            <input name="q" placeholder="Wat zoek je? Bijv. workshop pizza bakken, fietsenmaker…" style={{ flex: "1 1 240px", padding: "14px 16px", borderRadius: 10, border: "none", fontSize: 15, outline: "none", fontFamily: "inherit" }} />
            <button type="submit" style={disp({ padding: "14px 26px", borderRadius: 10, fontSize: 15, fontWeight: 700, letterSpacing: ".03em", background: ORANJE, color: "#fff", border: "none", cursor: "pointer" })}>Zoeken</button>
          </form>
          </div>
          <div className="or-hero-img" style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
            <img src="/images/workshops/ws1.jpg" alt="Lokale bakkerij in jouw regio" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 340 }} />
          </div>
        </div>
      </section>

      {/* ── KORTE INTRO ───────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h1 style={disp({ fontSize: "clamp(30px,4vw,46px)", fontWeight: 700, color: BLAUW, lineHeight: 1.05, margin: "0 0 18px" })}>
            OpenRegio helpt lokale ondernemers vooruit.
          </h1>
          <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.85, margin: 0 }}>
            Wij nemen wet- en regelgeving onder de loep, helpen bij gezond ondernemen en zorgen dat ondernemers sterker op de kaart staan in hun eigen regio. Praktisch, duidelijk en gericht op wat nú nodig is.
          </p>
        </div>
      </section>

      {/* ── ONTDEK LOKAAL — vier ingangen (2.0) ───────────────────────────── */}
      <section id="ontdek" style={{ background: "#faf9f5", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={disp({ fontSize: 12, fontWeight: 600, color: ORANJE, letterSpacing: ".14em", marginBottom: 10 })}>Ontdek lokaal</div>
            <h2 style={disp({ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 700, color: BLAUW, lineHeight: 1.05, margin: 0 })}>Waar wil je beginnen?</h2>
          </div>
          <div className="or-ingangen-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { emoji: "🛍", titel: "Koop lokaal", tekst: "Producten van ondernemers uit jouw buurt.", href: "/koop-lokaal" },
              { emoji: "🎓", titel: "Doe & leer", tekst: "Workshops en activiteiten door lokale ondernemers.", href: "/doe-en-leer" },
              { emoji: "🔧", titel: "Vind een ondernemer", tekst: "Vind diensten en vakmensen dichtbij.", href: "/lokaal-marktplaats" },
              { emoji: "🤝", titel: "Ondernemersmarktplaats", tekst: "Zoeken, aanbieden en samenwerken.", href: "/regiocrew" },
            ].map((i) => (
              <Link key={i.titel} href={i.href}>
                <div style={{ background: "#fff", border: "1px solid #e6e2d6", borderRadius: 14, padding: "26px 22px", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 34, marginBottom: 12 }}>{i.emoji}</div>
                  <div style={disp({ fontSize: 20, fontWeight: 700, color: BLAUW, textTransform: "uppercase", lineHeight: 1.05, marginBottom: 8 })}>{i.titel}</div>
                  <p style={{ fontSize: 14, color: "#5a6680", lineHeight: 1.6, margin: 0, flexGrow: 1 }}>{i.tekst}</p>
                  <div style={{ marginTop: 14, color: ORANJE, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>Bekijken <ArrowRight style={{ width: 15, height: 15 }} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DE DRIE PIJLERS (zip-huisstijl) ───────────────────────────────── */}
      <section id="hulp" style={{ background: "#faf9f5", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={disp({ fontSize: 12, fontWeight: 600, color: ORANJE, letterSpacing: ".14em", marginBottom: 10 })}>De drie pijlers</div>
            <h2 style={disp({ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 700, color: BLAUW, lineHeight: 1.05, margin: 0 })}>Waar OpenRegio mee helpt</h2>
          </div>
          <div className="or-pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { num: "01", kleur: BLAUW, naam: "Grip op regels", sub: "Voor ondernemers die duidelijkheid willen.", items: ["Brieven begrijpen", "Regels uitleggen", "Vergunningen volgen", "Informatie opvragen", "Praktische vervolgstappen"], kort: "Weet wat er speelt en wat je moet doen." },
              { num: "02", kleur: "#3c4860", naam: "Lokale zichtbaarheid", sub: "Voor ondernemers die beter gevonden willen worden.", items: ["Website-check", "Lokale vindbaarheid", "Google-bedrijfsprofiel", "Online basis op orde", "Minder afhankelijk van platforms"], kort: "Zorg dat klanten je lokaal blijven vinden." },
              { num: "03", kleur: ORANJE, naam: "Lokale kracht", sub: "Voor ondernemers die sterker willen staan in hun regio.", items: ["Samenwerken", "Lokale acties organiseren", "Personeel & kennis delen", "Klantenbinding versterken", "Elkaar versterken"], kort: "Samen maak je de regio sterker." },
            ].map((p) => (
              <div key={p.num} style={{ background: "#fff", border: "1px solid #e6e2d6", borderRadius: 14, padding: "26px 24px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={disp({ width: 42, height: 42, borderRadius: 10, background: p.kleur, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700 })}>{p.num}</div>
                  <div style={disp({ fontSize: 22, fontWeight: 700, color: BLAUW, lineHeight: 1 })}>{p.naam}</div>
                </div>
                <p style={{ fontSize: 14, color: "#5a6680", margin: "0 0 16px", lineHeight: 1.55 }}>{p.sub}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
                  {p.items.map((it) => (
                    <div key={it} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: "#334155" }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: ORANJE, flexShrink: 0 }} /> {it}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "auto", borderTop: "1px solid #f0ede4", paddingTop: 14, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={disp({ fontSize: 10.5, fontWeight: 700, color: ORANJE, letterSpacing: ".1em", background: "#fbeee2", padding: "3px 7px", borderRadius: 5, flexShrink: 0 })}>Kort</span>
                  <span style={{ fontSize: 13.5, color: "#15233b", fontWeight: 600, lineHeight: 1.4 }}>{p.kort}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USP CHECKLIST ─────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "56px 24px" }}>
        <div className="or-usp-grid" style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px 32px" }}>
          {[
            "Praktische hulp voor lokale ondernemers",
            "Regelgeving helder uitgelegd",
            "Meer grip op kansen en risico's",
            "Sterker zichtbaar in de regio",
            "Betrokken en lokaal gericht",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#334155", fontWeight: 600 }}>
              <CheckCircle2 style={{ width: 18, height: 18, color: ORANJE, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ── MANIFEST ──────────────────────────────────────────────────────── */}
      <section style={{ background: BLAUW, padding: "80px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ width: 44, height: 4, background: ORANJE, borderRadius: 2, margin: "0 auto 32px" }} />
          <h2 style={disp({ fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.1, textAlign: "center", margin: "0 0 40px" })}>
            Als ondernemer ben je zichtbaar voor het systeem.<br />
            <span style={{ color: ORANJE }}>OpenRegio maakt het systeem zichtbaar voor jou.</span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 620, margin: "0 auto" }}>
            <p style={{ fontSize: 17, color: "#e2e8f0", lineHeight: 1.75, margin: 0, textAlign: "center" }}>
              Iedere ondernemer krijgt te maken met regels, heffingen, vergunningen, controles, verplichtingen en besluiten. Vaak wordt verwacht dat je gewoon meebeweegt, betaalt of voldoet. Maar als ondernemer mag je ook vragen stellen: waar komt deze regel vandaan, wie heeft dit besloten, welke grondslag wordt gebruikt en geldt dit echt voor mijn onderneming?
            </p>
            <p style={{ fontSize: 17, color: "#e2e8f0", lineHeight: 1.75, margin: 0, textAlign: "center" }}>
              OpenRegio helpt lokale ondernemers om wetten, regels en besluiten zichtbaar en begrijpelijk te maken. Door samen de juiste vragen te stellen en waar nodig Woo-documenten op te vragen, brengen we boven tafel wat normaal verspreid zit in verordeningen, beleidsstukken, mandaatregisters, besluiten en gemeentelijke systemen.
            </p>
          </div>

          <p style={{ fontSize: 19, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.6, margin: "40px 0 0" }}>
            OpenRegio is er om ondernemers te helpen begrijpen, controleren en vooruitkijken.<br />
            <span style={{ color: ORANJE }}>Samen maken we regels open. Samen staan we sterker.</span>
          </p>
        </div>
      </section>

      {/* ── AGENTS / TOOLS (rewritten, no "AI" language) ─────────────────── */}
      <section style={{ background: "#f8f7f4", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ORANJE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              Praktische hulp
            </div>
            <h2 style={disp({ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, color: BLAUW, lineHeight: 1.05, margin: "0 0 14px" })}>
              Hulp waar je echt iets aan hebt
            </h2>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, margin: "0 auto", maxWidth: 520 }}>
              Onze hulpmiddelen nemen het zware denkwerk uit handen, zodat jij sneller en met minder gedoe verder kunt.
            </p>
          </div>

          <div className="or-agents-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              {
                Icon: Mail, color: "#1d4ed8", bg: "#eff6ff",
                title: "Brievenhulp",
                sub: "Brieven van de overheid begrijpen",
                body: "Upload een brief van de gemeente of belastingdienst. Wij leggen uit wat het betekent, welke actie nodig is en wat je rechten zijn.",
                tag: "Brief analyse",
              },
              {
                Icon: FileCheck, color: "#16a34a", bg: "#f0fdf4",
                title: "Contracthulp",
                sub: "Contracten checken en opstellen",
                body: "Laat contracten doorlichten op risico's, onduidelijkheden en ontbrekende clausules. Of laat een nieuw contract opstellen op maat.",
                tag: "Pro feature",
              },
              {
                Icon: Star, color: "#7c3aed", bg: "#f5f3ff",
                title: "Secretariële hulp",
                sub: "Administratie en communicatie",
                body: "Van het opstellen van offertes tot het plannen van afspraken en het schrijven van professionele e-mails — altijd paraat.",
                tag: "Pro feature",
              },
            ].map(({ Icon, color, bg, title, sub, body, tag }) => (
              <div key={title} style={{ background: "#fff", borderRadius: 12, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 22, height: 22, color }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: BLAUW, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{sub}</div>
                </div>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0, flexGrow: 1 }}>{body}</p>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "4px 10px", borderRadius: 20 }}>{tag}</span>
                  <ChevronRight style={{ width: 16, height: 16, color: "#94a3b8" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK NAVY SECTION ─────────────────────────────────────────────── */}
      <section style={{ background: BLAUW, padding: "72px 24px" }}>
        <div className="or-bottom-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "35fr 40fr 25fr", gap: 48, alignItems: "start" }}>

          {/* Left */}
          <div>
            <h2 style={disp({ fontSize: "clamp(26px,3vw,38px)", fontWeight: 700, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" })}>
              JOUW BEDRIJF.<br />JOUW REGIO.<br />ONZE TOEKOMST.
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.6 }}>
              We staan voor dezelfde uitdagingen:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 20 }}>
              {["Regeldruk", "Personeel", "Zichtbaarheid", "Kosten", "Verandering"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#fff" }}>
                  <span style={{ color: ORANJE, fontWeight: 900, fontSize: 16 }}>✓</span> {item}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
              Maar we hoeven het niet alleen op te lossen.
            </p>
          </div>

          {/* Middle */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 22px" }}>
              DIT KRIJG JE BIJ OPENREGIO
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
              {["Grip op regels", "Praktische tools", "Persoonlijke ondersteuning", "Regio updates", "Netwerk & kennisdeling", "Lokale zichtbaarheid"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#e2e8f0" }}>
                  <ChevronRight style={{ width: 14, height: 14, color: ORANJE, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right CTA card */}
          <div style={{ background: ORANJE, borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", textTransform: "uppercase", margin: 0 }}>SLUIT JE AAN</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.92)", margin: 0, lineHeight: 1.6 }}>
              Bouw mee aan een netwerk waar je op kunt rekenen.
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", margin: 0, fontStyle: "italic" }}>
              Vertrouw in elkaar. Bereik meer samen.
            </p>
            <Link href="/register">
              <button style={{ width: "100%", padding: "12px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "#fff", color: ORANJE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                Aanmelden <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA-SECTIE ────────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={disp({ fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: BLAUW, lineHeight: 1.1, margin: "0 0 10px" })}>
            OpenRegio helpt de lokale ondernemer in moeilijke tijden.
          </h2>
          <p style={{ fontSize: 17, color: ORANJE, fontWeight: 700, margin: "0 0 32px" }}>
            Duidelijk. Praktisch. Lokaal betrokken.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/register">
              <button style={{ padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: ORANJE, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                Word lid <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </Link>
            <a href="#pricing">
              <button style={{ padding: "12px 26px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "transparent", color: BLAUW, border: `2px solid ${BLAUW}`, cursor: "pointer" }}>
                Ontdek de mogelijkheden
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: "#f8f7f4", padding: "72px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ORANJE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              Transparante prijzen
            </div>
            <h2 style={disp({ fontSize: "clamp(30px,4vw,46px)", fontWeight: 700, color: BLAUW, margin: "0 0 14px" })}>
              KIES JE LIDMAATSCHAP
            </h2>
            <p style={{ fontSize: 15, color: "#475569", margin: 0, lineHeight: 1.7 }}>
              Start gratis. Upgrade wanneer je meer wilt.
            </p>
          </div>

          <div className="or-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Basis */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px", border: "2px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: BLAUW }}>Basis</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Voor ondernemers die willen starten</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: BLAUW }}>€12,95</span>
                <span style={{ fontSize: 14, color: "#64748b" }}>/maand</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Regio updates", "Gemeentepublicaties", "Kansen in je regio", "Basis netwerk", "Lokale marktplaats", "Brief analyse (beperkt)"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" }}>
                    <span style={{ color: "#10b981", fontWeight: 700, fontSize: 15 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button style={{ width: "100%", padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "transparent", color: BLAUW, border: `2px solid ${BLAUW}`, cursor: "pointer", marginTop: "auto" }}>
                  Basis starten
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div style={{ background: BLAUW, borderRadius: 14, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 16, right: 16, background: ORANJE, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>
                POPULAIR
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Pro</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Alles wat een ondernemer nodig heeft</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>€24</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>/maand</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Alles van Basis", "RegioBot (onbeperkt)", "Volledige toegang tot alle hulpmiddelen", "WOO-verzoeken", "Woo dossiers", "Lokale acties aanmaken", "Prioriteitsondersteuning"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#e2e8f0" }}>
                    <span style={{ color: ORANJE, fontWeight: 700, fontSize: 15 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button style={{ width: "100%", padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: ORANJE, color: "#fff", border: "none", cursor: "pointer", marginTop: "auto" }}>
                  Pro starten
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER BAR ────────────────────────────────────────────────────── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #dce6f0", padding: "20px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 0 }}>
            {[
              { Icon: Users, text: "Van mens tot mens." },
              { Icon: Heart, text: "Vakmanschap is meesterschap." },
              { Icon: MapPin, text: "Lokaal geworteld. Samen vooruit." },
            ].map(({ Icon, text }, i) => (
              <div key={text} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 18, background: "#dce6f0", margin: "0 22px" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                  <Icon style={{ width: 14, height: 14, color: ORANJE }} />
                  {text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            © {new Date().getFullYear()} OpenRegio · Alle rechten voorbehouden
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE ────────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 960px) {
          .or-hero { min-height: 360px !important; }
          .or-pillars-grid { grid-template-columns: 1fr !important; }
          .or-ingangen-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .or-herowrap { grid-template-columns: 1fr !important; }
          .or-hero-img { max-width: 460px; }
          .or-rebel-grid { grid-template-columns: 1fr !important; }
          .or-welniet-grid { grid-template-columns: 1fr !important; }
          .or-agents-grid { grid-template-columns: 1fr !important; }
          .or-bottom-grid { grid-template-columns: 1fr !important; }
          .or-pricing-grid { grid-template-columns: 1fr !important; }
          .or-usp-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .or-hero { min-height: 300px !important; }
          .or-hero-ctas button { font-size: 14px !important; padding: 11px 20px !important; }
          .or-usp-grid { grid-template-columns: 1fr !important; }
          .or-nav-desktop { display: none !important; }
          .or-nav-mobile { display: block !important; }
        }
        @media (min-width: 601px) {
          .or-nav-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
