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
  Brain,
  Megaphone,
  Heart,
} from "lucide-react";

const BLAUW = "#0b2240";
const ORANJE = "#f28a1a";
const FF = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function HomePage() {
  usePageTitle("OpenRegio — Grip op regels. Kracht in de regio.");
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dashHref = user ? "/vandaag" : "/register";

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
              <a href="#features" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>Platform</a>
              <a href="#agents" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>AI Agents</a>
              <a href="#pricing" style={{ fontSize: 14, fontWeight: 600, color: "#475569", textDecoration: "none" }}>Lidmaatschap</a>
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
              {[["#features", "Platform"], ["#agents", "AI Agents"], ["#pricing", "Lidmaatschap"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: "#475569", textDecoration: "none", padding: "8px 4px" }}>{label}</a>
              ))}
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

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section id="features" style={{ background: "#f8f7f4", padding: "0 0 0 0" }}>
        {/* Top: headline + photo */}
        <div className="or-hero-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "45fr 55fr", minHeight: 500, alignItems: "stretch" }}>

          {/* Left — photo */}
          <div className="or-hero-right" style={{ position: "relative", minHeight: 460, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${BLAUW} 0%, #1a3a5c 100%)`, zIndex: -1 }} />
            <img
              src="/images/hero-entrepreneur.jpg"
              alt="Lokale ondernemer"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block", position: "absolute", inset: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {/* Brush-stroke quote — bleeds past right boundary */}
            <div style={{
              position: "absolute", bottom: 40, left: 0, right: -24,
              background: "rgba(11,34,64,0.92)",
              padding: "16px 36px 16px 28px",
              borderRadius: "10px 0 0 10px",
            }}>
              <p style={{ margin: 0, fontSize: 16, fontStyle: "italic", color: "#fff", lineHeight: 1.55, fontWeight: 600, textAlign: "right" }}>
                Samen weet je meer dan alleen.
              </p>
            </div>
          </div>

          {/* Right — text */}
          <div className="or-hero-left" style={{ padding: "60px 24px 48px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href={dashHref}>
                <button style={{ padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: ORANJE, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  Gratis aanmelden <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </Link>
              <a href="#pricing">
                <button style={{ padding: "12px 26px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "transparent", color: BLAUW, border: `2px solid ${BLAUW}`, cursor: "pointer" }}>
                  Bekijk lidmaatschap
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom: 6 feature blocks */}
        <div style={{ background: "#fff", padding: "52px 24px 60px" }}>
          <div className="or-features-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "36px 48px" }}>
            {[
              {
                Icon: Bell,
                title: "REGIO UPDATES",
                body: "Blijf ",
                accent: "op de hoogte",
                body2: " van belangrijke ontwikkelingen, regels en initiatieven in jouw regio.",
              },
              {
                Icon: Briefcase,
                title: "PRAKTISCHE TOOLS",
                body: "Direct toepasbare templates, checklists en stappenplannen die je ",
                accent: "tijd besparen",
                body2: " en verder helpen.",
              },
              {
                Icon: Brain,
                title: "AI ONDERSTEUNING",
                body: "Slimme AI-tools die je helpen informatie te vinden, teksten te verbeteren en ",
                accent: "sneller",
                body2: " beslissingen te nemen.",
              },
              {
                Icon: Users,
                title: "NETWERK",
                body: "",
                accent: "Verbind",
                body2: " met ondernemers, experts en partners in de regio en leer van elkaar.",
              },
              {
                Icon: MapPin,
                title: "LOKALE KANSEN",
                body: "Ontdek samenwerkingen, projecten en ",
                accent: "kansen",
                body2: " die passen bij jouw bedrijf en ambities.",
              },
              {
                Icon: Megaphone,
                title: "ZICHTBAARHEID",
                body: "Laat zien wie je bent en wat je doet. Vergroot je ",
                accent: "zichtbaarheid",
                body2: " bij collega's, partners en klanten.",
              },
            ].map(({ Icon, title, body, accent, body2 }) => (
              <div key={title} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: BLAUW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 22, height: 22, color: ORANJE }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: BLAUW, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.75 }}>
                    {body}<span style={{ color: ORANJE, fontWeight: 700 }}>{accent}</span>{body2}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI AGENTS SECTION ─────────────────────────────────────────────── */}
      <section id="agents" style={{ background: "#f8f7f4", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ORANJE, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
              Slimme hulp voor ondernemers
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: BLAUW, margin: "0 0 14px", textTransform: "uppercase" }}>
              AI AGENTS VOOR JOU
            </h2>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, margin: "0 auto", maxWidth: 520 }}>
              Laat AI het zware denkwerk doen. Onze gespecialiseerde agents helpen je sneller, beter en met minder gedoe.
            </p>
          </div>

          <div className="or-agents-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              {
                Icon: Mail, color: "#1d4ed8", bg: "#eff6ff",
                title: "Brievenagent",
                sub: "Brieven van de overheid begrijpen",
                body: "Upload een brief van de gemeente of belastingdienst. De agent legt uit wat het betekent, welke actie nodig is en wat je rechten zijn.",
                tag: "Brief analyse",
              },
              {
                Icon: FileCheck, color: "#16a34a", bg: "#f0fdf4",
                title: "Contractagent",
                sub: "Contracten checken en opstellen",
                body: "Laat contracten doorlichten op risico's, onduidelijkheden en ontbrekende clausules. Of laat een nieuw contract opstellen op maat.",
                tag: "Pro feature",
              },
              {
                Icon: Star, color: "#7c3aed", bg: "#f5f3ff",
                title: "Secretaresse-agent",
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
              {["Grip op regels", "Praktische tools", "AI ondersteuning", "Regio updates", "Netwerk & kennisdeling", "Lokale zichtbaarheid"].map((item) => (
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
                Aanmelden — gratis starten <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
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
                <span style={{ fontSize: 40, fontWeight: 900, color: BLAUW }}>€14,95</span>
                <span style={{ fontSize: 14, color: "#64748b" }}>/maand</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Regio updates", "Gemeentepublicaties", "Subsidieoverzicht", "Basis netwerk", "Lokale marktplaats", "Brief analyse (beperkt)"].map((f) => (
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
                <span style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>€59</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>/maand</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Alles van Basis", "RegioBot (onbeperkt)", "AI Agents toegang", "WOO-verzoeken", "Woo dossiers", "Lokale acties aanmaken", "Prioriteitsondersteuning"].map((f) => (
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
          .or-hero-grid { grid-template-columns: 1fr !important; }
          .or-hero-left { padding: 48px 24px 32px !important; }
          .or-hero-right { min-height: 300px !important; }
          .or-values-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .or-agents-grid { grid-template-columns: 1fr !important; }
          .or-bottom-grid { grid-template-columns: 1fr !important; }
          .or-pricing-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .or-values-grid { grid-template-columns: 1fr !important; }
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
