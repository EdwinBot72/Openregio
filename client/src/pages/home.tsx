import { useState } from "react";
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

const BLAUW = "#0b2240";
const ORANJE = "#f28a1a";
const FF = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function HomePage() {
  usePageTitle("OpenRegio — Grip op regels. Kracht in de regio.");
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ fontFamily: FF, background: "#f8f7f4", margin: 0, padding: 0 }}>

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
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: ORANJE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: BLAUW, lineHeight: 1 }}>OpenRegio</div>
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

      {/* ── HERO — full-width photo with left-aligned text ───────────────── */}
      <section id="platform" className="or-hero" style={{ position: "relative", minHeight: 620, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${BLAUW} 0%, #1a3a5c 100%)`, zIndex: -1 }} />
        <img
          src="/images/hero-entrepreneur.jpg"
          alt="Lokale ondernemer"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block", position: "absolute", inset: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Dark wash on the left so light text stays readable over the photo */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,34,64,0.92) 0%, rgba(11,34,64,0.72) 42%, rgba(11,34,64,0.15) 68%, rgba(11,34,64,0) 85%)" }} />

        <div className="or-hero-content" style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "0 24px" }}>
          <div className="or-hero-text" style={{ maxWidth: 460 }}>
            <div style={{ width: 40, height: 4, background: ORANJE, borderRadius: 2, margin: "0 0 20px" }} />
            <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.2, margin: "0 0 16px" }}>
              Regels en kansen<br />zichtbaar in jouw regio.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.88)", lineHeight: 1.6, margin: "0 0 28px", maxWidth: 400 }}>
              Vanuit de onderneming én de mens daarachter — met inzicht, workshops en praktische ondersteuning.
            </p>
            <a href="#pricing">
              <button style={{ padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: ORANJE, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                Bekijk lidmaatschap <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── KORTE INTRO ───────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: BLAUW, lineHeight: 1.3, margin: "0 0 18px" }}>
            OpenRegio helpt lokale ondernemers vooruit.
          </h1>
          <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.85, margin: 0 }}>
            Wij nemen wet- en regelgeving onder de loep, helpen bij gezond ondernemen en zorgen dat ondernemers sterker op de kaart staan in hun eigen regio. Praktisch, duidelijk en gericht op wat nú nodig is.
          </p>
        </div>
      </section>

      {/* ── 3 PIJLERS ─────────────────────────────────────────────────────── */}
      <section id="hulp" style={{ background: "#f8f7f4", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="or-pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {[
              {
                Icon: ClipboardCheck,
                title: "Regelgeving onder de loep",
                body: "Wij helpen ondernemers om scherper te kijken naar regels, besluiten en verplichtingen die invloed hebben op hun bedrijf. Wat betekent een regel echt in de praktijk? Wat geldt wel, wat geldt niet, en waar liggen aandachtspunten?",
              },
              {
                Icon: ShieldCheck,
                title: "Gezond ondernemen",
                body: "OpenRegio helpt ondernemers om grip te houden op hun bedrijf. Van praktische vragen en risico's tot kansen, structuur en continuïteit: wij helpen overzicht creëren in lastige tijden.",
              },
              {
                Icon: Compass,
                title: "Zichtbaar in jouw regio",
                body: "Wij helpen lokale ondernemers om beter op de kaart te staan in hun eigen regio. Denk aan zichtbaarheid, positionering, lokale vindbaarheid en aansluiting bij kansen in de omgeving.",
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} style={{ background: "#fff", borderRadius: 12, padding: "32px 26px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: BLAUW, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon style={{ width: 24, height: 24, color: ORANJE }} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: BLAUW, marginBottom: 12 }}>{title}</div>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, margin: 0 }}>{body}</p>
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
          <h2 style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1.4, textAlign: "center", margin: "0 0 40px" }}>
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
            <h2 style={{ fontSize: 30, fontWeight: 900, color: BLAUW, margin: "0 0 14px" }}>
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
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2, textTransform: "uppercase", margin: "0 0 20px" }}>
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
          <h2 style={{ fontSize: 26, fontWeight: 900, color: BLAUW, lineHeight: 1.35, margin: "0 0 10px" }}>
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
            <h2 style={{ fontSize: 34, fontWeight: 900, color: BLAUW, margin: "0 0 14px", textTransform: "uppercase" }}>
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
