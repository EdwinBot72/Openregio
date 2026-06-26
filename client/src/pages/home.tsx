import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Handshake,
  Users,
  TrendingUp,
  MapPin,
  Heart,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  Bell,
  Briefcase,
  Bot,
  Eye,
  CheckCircle2,
  Rocket,
} from "lucide-react";

import hero01 from "@assets/openregio_foto_netjes_01_1782505862527.png";
import foto02 from "@assets/openregio_foto_netjes_02_1782505862527.png";
import foto03 from "@assets/openregio_foto_netjes_03_1782505862527.png";
import foto05 from "@assets/openregio_foto_netjes_05_1782505862527.png";
import foto06 from "@assets/openregio_foto_netjes_06_1782505862527.png";
import foto07 from "@assets/openregio_foto_netjes_07_1782505862527.png";
import foto09 from "@assets/openregio_foto_netjes_09_1782505862527.png";
import foto12 from "@assets/openregio_foto_netjes_12_1782505862527.png";
import foto15 from "@assets/openregio_foto_netjes_15_1782505862527.png";
import foto17 from "@assets/openregio_foto_netjes_17_1782505862527.png";

const FF = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function HomePage() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dashHref = user ? "/vandaag" : "/register";

  return (
    <div style={{ fontFamily: FF, background: "#f8f7f4", margin: 0, padding: 0 }}>

      {/* ─── STICKY NAV ────────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
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

            <div className="or-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {user ? (
                <Link href="/vandaag">
                  <button style={{ padding: "9px 22px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer" }}>
                    Dashboard →
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button style={{ padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: "transparent", color: "#0b2240", border: "2px solid #0b2240", cursor: "pointer" }}>
                      Inloggen
                    </button>
                  </Link>
                  <Link href="/register">
                    <button style={{ padding: "9px 22px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer" }}>
                      Aanmelden
                    </button>
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="or-nav-mobile" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }} data-testid="button-mobile-menu">
              {mobileOpen ? <X style={{ width: 24, height: 24, color: "#0b2240" }} /> : <Menu style={{ width: 24, height: 24, color: "#0b2240" }} />}
            </button>
          </div>

          {mobileOpen && (
            <div style={{ padding: "12px 0 16px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/login">
                <button onClick={() => setMobileOpen(false)} style={{ width: "100%", padding: "10px 16px", borderRadius: 8, fontSize: 15, fontWeight: 600, background: "transparent", color: "#0b2240", border: "2px solid #0b2240", cursor: "pointer", textAlign: "left" }}>
                  Inloggen
                </button>
              </Link>
              <Link href="/register">
                <button onClick={() => setMobileOpen(false)} style={{ width: "100%", padding: "10px 16px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer", textAlign: "left" }}>
                  Aanmelden
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ background: "#f8f7f4" }}>
        <div className="or-hero-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "58fr 42fr", minHeight: 540, alignItems: "stretch" }}>
          {/* Left */}
          <div className="or-hero-left" style={{ padding: "60px 48px 60px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f28a1a", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
              OpenRegio — Platform voor lokale ondernemers
            </div>
            <h1 style={{ fontSize: 54, fontWeight: 900, color: "#0b2240", lineHeight: 1.05, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
              VERTROUWEN
            </h1>
            <h1 style={{ fontSize: 54, fontWeight: 900, color: "#0b2240", lineHeight: 1.05, margin: "0 0 4px", textTransform: "uppercase" }}>
              WERKT.
            </h1>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: "#f28a1a", lineHeight: 1.1, margin: "0 0 6px", textTransform: "uppercase" }}>
              SAMEN KOM JE VERDER.
            </h1>
            <div style={{ width: 80, height: 3, background: "#f28a1a", borderRadius: 2, margin: "18px 0 22px" }} />
            <p style={{ fontSize: 18, fontWeight: 600, color: "#0b2240", margin: "0 0 12px", lineHeight: 1.5 }}>
              Lokale ondernemers die elkaar kennen, begrijpen en versterken.
            </p>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, margin: "0 0 34px", maxWidth: 470 }}>
              OpenRegio is het platform waar ondernemers elkaar vinden, kennis delen en samen grip krijgen op regels, kansen en zichtbaarheid in de regio.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href={dashHref}>
                <button style={{ padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "#f28a1a", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  Gratis aanmelden <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </Link>
              <a href="#features">
                <button style={{ padding: "12px 26px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "transparent", color: "#0b2240", border: "2px solid #0b2240", cursor: "pointer" }}>
                  Meer ontdekken
                </button>
              </a>
            </div>
          </div>

          {/* Right — real photo */}
          <div className="or-hero-right" style={{ position: "relative", minHeight: 480, overflow: "hidden" }}>
            <img src={hero01} alt="Lokale ondernemers" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }} />
            {/* Quote overlay — brush stroke style */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(11,34,64,0.87)", padding: "22px 28px 24px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 15, fontStyle: "italic", color: "#fff", lineHeight: 1.6, fontWeight: 500 }}>
                "Via OpenRegio vonden we sneller de juiste mensen en kregen we direct meer grip."
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#f28a1a", fontWeight: 700, letterSpacing: "0.04em" }}>
                — Lokaal ondernemer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3 VALUE BLOCKS ────────────────────────────────────────────────── */}
      <section id="features" style={{ background: "#fff", padding: "64px 24px" }}>
        <div className="or-values-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Handshake style={{ width: 26, height: 26, color: "#fff" }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.07em" }}>CONTACT</div>
            <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
              Vind en praat met{" "}
              <span style={{ color: "#f28a1a", fontWeight: 700 }}>lokale</span>{" "}
              ondernemers die bij je passen.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: 26, height: 26, color: "#fff" }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.07em" }}>SAMENWERKING</div>
            <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
              Deel kennis, ervaringen en uitdagingen.{" "}
              <span style={{ color: "#f28a1a", fontWeight: 700 }}>Samen</span>{" "}
              sta je sterker.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp style={{ width: 26, height: 26, color: "#fff" }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.07em" }}>GROEI</div>
            <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
              Krijg grip op regels en ontdek{" "}
              <span style={{ color: "#f28a1a", fontWeight: 700 }}>kansen</span>{" "}
              om te groeien.
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIT KRIJG JE BIJ OPENREGIO ────────────────────────────────────── */}
      <section style={{ background: "#f8f7f4", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div className="or-features-header" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start", marginBottom: 52 }}>
            <div>
              <h2 style={{ fontSize: 40, fontWeight: 900, color: "#0b2240", textTransform: "uppercase", lineHeight: 1.1, margin: "0 0 8px" }}>
                DIT KRIJG JE BIJ OPENREGIO
              </h2>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: "#f28a1a", textTransform: "uppercase", margin: "0 0 20px" }}>
                TOOLS, NETWERK EN ZICHTBAARHEID.
              </h3>
              <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, margin: 0 }}>
                Als lid van OpenRegio krijg je toegang tot <strong style={{ color: "#0b2240" }}>kennis, mensen en middelen</strong> die je verder helpen. Alles wat je nodig hebt om <strong style={{ color: "#0b2240" }}>grip</strong> te houden op regels, <strong style={{ color: "#0b2240" }}>kansen</strong> te benutten en samen te <strong style={{ color: "#0b2240" }}>groeien</strong> in jouw regio.
              </p>
            </div>
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 240 }}>
              <img src={foto06} alt="Samen werken" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(11,34,64,0.88)", borderRadius: 8, padding: "10px 16px" }}>
                <p style={{ margin: 0, fontSize: 16, fontStyle: "italic", color: "#fff", fontWeight: 600 }}>Samen weet je meer dan alleen.</p>
              </div>
            </div>
          </div>

          {/* 6 feature cards */}
          <div className="or-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { icon: <Bell style={{ width: 22, height: 22, color: "#f28a1a" }} />, title: "REGIO UPDATES", body: "Blijf ", accent: "op de hoogte", rest: " van belangrijke ontwikkelingen, regels en initiatieven in jouw regio." },
              { icon: <Briefcase style={{ width: 22, height: 22, color: "#f28a1a" }} />, title: "PRAKTISCHE TOOLS", body: "Direct toepasbare templates, checklists en stappenplannen die je ", accent: "tijd besparen", rest: " en verder helpen." },
              { icon: <Bot style={{ width: 22, height: 22, color: "#f28a1a" }} />, title: "AI ONDERSTEUNING", body: "Slimme AI-tools die je helpen informatie te vinden, teksten te verbeteren en ", accent: "sneller", rest: " beslissingen te nemen." },
              { icon: <Users style={{ width: 22, height: 22, color: "#f28a1a" }} />, title: "NETWERK", body: "", accent: "Verbind", rest: " met ondernemers, experts en partners in de regio en leer van elkaar." },
              { icon: <MapPin style={{ width: 22, height: 22, color: "#f28a1a" }} />, title: "LOKALE KANSEN", body: "Ontdek samenwerkingen, projecten en ", accent: "kansen", rest: " die passen bij jouw bedrijf en ambities." },
              { icon: <Eye style={{ width: 22, height: 22, color: "#f28a1a" }} />, title: "ZICHTBAARHEID", body: "Laat zien wie je bent en wat je doet. Vergroot je ", accent: "zichtbaarheid", rest: " bij collega's, partners en klanten." },
            ].map((f) => (
              <div key={f.title} style={{ background: "#fff", borderRadius: 10, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#0b2240", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                  {f.body}<span style={{ color: "#f28a1a", fontWeight: 700 }}>{f.accent}</span>{f.rest}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PHOTO MOSAIC ──────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "0" }}>
        <div className="or-mosaic" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", height: 220 }}>
          {[foto02, foto03, foto07, foto09, foto17].map((src, i) => (
            <div key={i} style={{ overflow: "hidden", position: "relative" }}>
              <img src={src} alt="Lokale ondernemer" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOUW MEE — ORANGE CTA BAR ─────────────────────────────────────── */}
      <section style={{ background: "#f28a1a", padding: "40px 24px" }}>
        <div className="or-cta-bar" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MapPin style={{ width: 28, height: 28, color: "#fff" }} />
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: "#fff", textTransform: "uppercase", margin: 0, letterSpacing: "-0.01em" }}>
              BOUW MEE AAN DE REGIO
            </h2>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 15, color: "rgba(255,255,255,0.95)", lineHeight: 1.6 }}>
              Sluit je aan bij het netwerk van ondernemers die elkaar verder helpen.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.85)", fontStyle: "italic" }}>
              Voor elkaar. Met elkaar. <strong style={{ color: "#fff" }}>Sterker samen.</strong>
            </p>
          </div>
          <Link href="/register">
            <button style={{ padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 700, background: "#fff", color: "#f28a1a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              Aanmelden — gratis <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </Link>
        </div>
      </section>

      {/* ─── DARK MANIFESTO SECTION ────────────────────────────────────────── */}
      <section style={{ background: "#0b2240", padding: "72px 24px" }}>
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
                  <span style={{ color: "#f28a1a", fontWeight: 900, fontSize: 16 }}>✓</span> {item}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
              Maar we hoeven het niet alleen op te lossen.
            </p>
          </div>

          {/* Middle */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 22px" }}>
              DIT KRIJG JE BIJ OPENREGIO
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
              {["Grip op regels", "Praktische tools", "AI ondersteuning", "Regio updates", "Netwerk & kennisdeling", "Lokale zichtbaarheid"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#e2e8f0" }}>
                  <ChevronRight style={{ width: 15, height: 15, color: "#f28a1a", flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right CTA card */}
          <div style={{ background: "#f28a1a", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", textTransform: "uppercase", margin: 0 }}>SLUIT JE AAN</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.92)", margin: 0, lineHeight: 1.6 }}>
              Bouw mee aan een netwerk waar je op kunt rekenen.
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", margin: 0, fontStyle: "italic" }}>
              Vertrouw in elkaar. Bereik meer samen.
            </p>
            <Link href="/register">
              <button style={{ width: "100%", padding: "12px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "#fff", color: "#f28a1a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                Aanmelden — gratis starten <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── VALUES STRIP ──────────────────────────────────────────────────── */}
      <section style={{ background: "#0b2240", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0 }}>
          {[
            { icon: <Users style={{ width: 15, height: 15, color: "#f28a1a" }} />, label: "LOKAAL", text: "We focussen op wat er speelt in ", accent: "jouw regio." },
            { icon: <CheckCircle2 style={{ width: 15, height: 15, color: "#f28a1a" }} />, label: "DUIDELIJK", text: "Geen ingewikkeld gedoe, maar ", accent: "heldere", rest: " informatie en praktische hulp." },
            { icon: <Rocket style={{ width: 15, height: 15, color: "#f28a1a" }} />, label: "ACTIEGERICHT", text: "We zetten kennis om in actie, zodat jij ", accent: "vooruit", rest: " kunt." },
          ].map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.12)", margin: "0 28px" }} />}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ marginTop: 2 }}>{v.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.08em", marginBottom: 3 }}>{v.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                    {v.text}<span style={{ color: "#f28a1a", fontWeight: 600 }}>{v.accent}</span>{v.rest}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER BAR ────────────────────────────────────────────────────── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #dce6f0", padding: "20px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0 }}>
          {[
            { icon: <Users style={{ width: 14, height: 14, color: "#f28a1a" }} />, text: "Van mens tot mens." },
            { icon: <Heart style={{ width: 14, height: 14, color: "#f28a1a" }} />, text: "Vakmanschap is meesterschap." },
            { icon: <MapPin style={{ width: 14, height: 14, color: "#f28a1a" }} />, text: "Lokaal geworteld. Samen vooruit." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 20, background: "#dce6f0", margin: "0 24px" }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                {item.icon}{item.text}
              </div>
            </div>
          ))}
        </div>
      </footer>

      {/* ─── RESPONSIVE ────────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 960px) {
          .or-hero-grid { grid-template-columns: 1fr !important; }
          .or-hero-left { padding: 48px 24px 32px !important; }
          .or-hero-right { min-height: 320px !important; }
          .or-values-grid { grid-template-columns: 1fr !important; }
          .or-features-header { grid-template-columns: 1fr !important; }
          .or-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .or-bottom-grid { grid-template-columns: 1fr !important; }
          .or-cta-bar { grid-template-columns: 1fr !important; gap: 20px !important; }
          .or-mosaic { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .or-features-grid { grid-template-columns: 1fr !important; }
          .or-mosaic { grid-template-columns: repeat(2, 1fr) !important; height: 160px !important; }
          h1 { font-size: 36px !important; }
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
