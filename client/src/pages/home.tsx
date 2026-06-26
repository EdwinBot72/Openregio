import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Handshake,
  Users,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Heart,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashHref = user ? "/vandaag" : "/register";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#f8f7f4" }}>

      {/* ─── STICKY NAV ─────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Logo */}
            <Link href="/">
              <div style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0b2240", lineHeight: 1 }}>
                  Open<span style={{ color: "#f28a1a" }}>Regio</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
                  Grip op regels. Kracht in de regio.
                </div>
              </div>
            </Link>

            {/* Desktop nav buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="or-nav-desktop">
              {user ? (
                <Link href="/vandaag">
                  <button style={{
                    padding: "9px 22px", borderRadius: 8, fontSize: 14, fontWeight: 700,
                    background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer",
                  }}>
                    Dashboard →
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button style={{
                      padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                      background: "transparent", color: "#0b2240", border: "2px solid #0b2240", cursor: "pointer",
                    }}>
                      Inloggen
                    </button>
                  </Link>
                  <Link href="/register">
                    <button style={{
                      padding: "9px 22px", borderRadius: 8, fontSize: 14, fontWeight: 700,
                      background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer",
                    }}>
                      Aanmelden
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}
              className="or-nav-mobile"
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X style={{ width: 24, height: 24, color: "#0b2240" }} /> : <Menu style={{ width: 24, height: 24, color: "#0b2240" }} />}
            </button>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div style={{ padding: "12px 0 16px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/login">
                <button onClick={() => setMobileOpen(false)} style={{
                  width: "100%", padding: "10px 16px", borderRadius: 8, fontSize: 15, fontWeight: 600,
                  background: "transparent", color: "#0b2240", border: "2px solid #0b2240", cursor: "pointer", textAlign: "left",
                }}>
                  Inloggen
                </button>
              </Link>
              <Link href="/register">
                <button onClick={() => setMobileOpen(false)} style={{
                  width: "100%", padding: "10px 16px", borderRadius: 8, fontSize: 15, fontWeight: 700,
                  background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer", textAlign: "left",
                }}>
                  Aanmelden
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "#f8f7f4", minHeight: 520 }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          display: "grid", gridTemplateColumns: "60fr 40fr", minHeight: 520,
          alignItems: "stretch",
        }} className="or-hero-grid">
          {/* Left column */}
          <div style={{ padding: "64px 48px 64px 0", display: "flex", flexDirection: "column", justifyContent: "center" }} className="or-hero-left">
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f28a1a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
              OpenRegio — Platform voor lokale ondernemers
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 900, color: "#0b2240", lineHeight: 1.1, margin: "0 0 8px", textTransform: "uppercase" }}>
              VERTROUW IN ELKAAR.
            </h1>
            <h1 style={{ fontSize: 52, fontWeight: 900, color: "#f28a1a", lineHeight: 1.1, margin: "0 0 24px", textTransform: "uppercase" }}>
              SAMEN STAAN WE STERKER.
            </h1>

            <div style={{ width: 80, height: 3, background: "#f28a1a", borderRadius: 2, marginBottom: 24 }} />

            <p style={{ fontSize: 18, fontWeight: 600, color: "#0b2240", margin: "0 0 14px", lineHeight: 1.5 }}>
              Lokale ondernemers die elkaar kennen, begrijpen en versterken.
            </p>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 480 }}>
              OpenRegio is het platform waar ondernemers elkaar vinden, kennis delen en samen grip krijgen op regels, kansen en zichtbaarheid in de regio.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href={dashHref}>
                <button style={{
                  padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700,
                  background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  Gratis aanmelden <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </Link>
              <a href="#meer">
                <button style={{
                  padding: "12px 26px", borderRadius: 8, fontSize: 15, fontWeight: 700,
                  background: "transparent", color: "#0b2240", border: "2px solid #0b2240", cursor: "pointer",
                }}>
                  Meer ontdekken
                </button>
              </a>
            </div>
          </div>

          {/* Right column — image */}
          <div style={{ position: "relative", minHeight: 480, background: "#0b2240", overflow: "hidden" }} className="or-hero-right">
            <img
              src="/images/hero.png"
              alt="Lokale ondernemers"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {/* Angled overlay */}
            <div style={{
              position: "absolute", bottom: 0, right: 0, left: "-10%",
              background: "rgba(11,34,64,0.88)",
              padding: "22px 28px 22px 36px",
              clipPath: "polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }}>
              <p style={{ margin: 0, fontSize: 14, fontStyle: "italic", color: "#fff", lineHeight: 1.6, fontWeight: 500 }}>
                "Vertrouwen ontstaat door contact.<br />Groei ontstaat door samenwerking."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 VALUE BLOCKS ─────────────────────────────────────────────────── */}
      <section id="meer" style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32,
        }} className="or-values-grid">

          {/* Block 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Handshake style={{ width: 24, height: 24, color: "#fff" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              PERSOONLIJK CONTACT
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
              Echte gesprekken. Echte mensen.{" "}
              <span style={{ color: "#f28a1a", fontWeight: 700 }}>Echte relaties.</span>
            </div>
          </div>

          {/* Block 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users style={{ width: 24, height: 24, color: "#fff" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ELKAAR VERSTERKEN
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
              Kennis delen. Ervaring benutten.{" "}
              <span style={{ color: "#f28a1a", fontWeight: 700 }}>Samen verder komen.</span>
            </div>
          </div>

          {/* Block 3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldCheck style={{ width: 24, height: 24, color: "#fff" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              OP ELKAAR BOUWEN
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
              Afspraak is afspraak. Duidelijk en eerlijk.{" "}
              <span style={{ color: "#f28a1a", fontWeight: 700 }}>Dat geeft rust.</span>
            </div>
          </div>

          {/* Block 4 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrendingUp style={{ width: 24, height: 24, color: "#fff" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              SAMEN GROEIEN
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
              Sterke bedrijven. Sterke regio's.{" "}
              <span style={{ color: "#f28a1a", fontWeight: 700 }}>Sterkere toekomst.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DARK BOTTOM SECTION ────────────────────────────────────────────── */}
      <section style={{ background: "#0b2240", padding: "72px 24px" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "grid", gridTemplateColumns: "35fr 40fr 25fr", gap: 40, alignItems: "start",
        }} className="or-bottom-grid">

          {/* Left — manifesto */}
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2, textTransform: "uppercase", margin: "0 0 20px" }}>
              JOUW BEDRIJF.<br />JOUW REGIO.<br />ONZE TOEKOMST.
            </h2>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.6 }}>
              We staan voor dezelfde uitdagingen:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 20 }}>
              {["Regeldruk", "Personeel", "Zichtbaarheid", "Kosten", "Verandering"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#fff" }}>
                  <span style={{ color: "#f28a1a", fontWeight: 900, fontSize: 16 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
              Maar we hoeven het niet alleen op te lossen.
            </p>
          </div>

          {/* Middle — what you get */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 22px" }}>
              DIT KRIJG JE BIJ OPENREGIO
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
              {[
                "Grip op regels",
                "Praktische tools",
                "Ondersteuning",
                "Regio updates",
                "Netwerk & kennisdeling",
                "Lokale zichtbaarheid",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#e2e8f0" }}>
                  <ChevronRight style={{ width: 15, height: 15, color: "#f28a1a", flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — CTA card */}
          <div style={{
            background: "#f28a1a", borderRadius: 12, padding: 28,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", textTransform: "uppercase", margin: 0, lineHeight: 1.2 }}>
              SLUIT JE AAN
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: 1.6 }}>
              Bouw mee aan een netwerk waar je op kunt rekenen.
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
              Vertrouw in elkaar. Bereik meer samen.
            </p>
            <Link href="/register">
              <button style={{
                width: "100%", padding: "12px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700,
                background: "#fff", color: "#f28a1a", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 4,
              }}>
                Aanmelden — gratis starten <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER BAR ─────────────────────────────────────────────────────── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #dce6f0", padding: "20px 24px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, flexWrap: "wrap",
        }}>
          {[
            { icon: <Users style={{ width: 15, height: 15, color: "#f28a1a" }} />, text: "Van mens tot mens." },
            { icon: <Heart style={{ width: 15, height: 15, color: "#f28a1a" }} />, text: "Vakmanschap is meesterschap." },
            { icon: <MapPin style={{ width: 15, height: 15, color: "#f28a1a" }} />, text: "Lokaal geworteld. Samen vooruit." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div style={{ width: 1, height: 20, background: "#dce6f0", margin: "0 24px" }} />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                {item.icon}
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </footer>

      {/* ─── RESPONSIVE STYLES ──────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .or-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .or-hero-left {
            padding: 48px 0 32px !important;
          }
          .or-hero-right {
            min-height: 300px !important;
          }
          .or-values-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .or-bottom-grid {
            grid-template-columns: 1fr !important;
          }
          h1 {
            font-size: 36px !important;
          }
        }
        @media (max-width: 600px) {
          .or-values-grid {
            grid-template-columns: 1fr !important;
          }
          .or-nav-desktop {
            display: none !important;
          }
          .or-nav-mobile {
            display: block !important;
          }
        }
        @media (min-width: 601px) {
          .or-nav-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
