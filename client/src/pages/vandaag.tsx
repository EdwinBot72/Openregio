import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "wouter";
import {
  Globe, FileText, Users, ShieldAlert, Wrench, ArrowRight,
  Bell, TrendingUp, MapPin, Euro, Bot, Mail, FileCheck, Star,
  ChevronRight, Megaphone, BookOpen, Building2, Briefcase,
  Link2, Store, Search, CalendarDays, Handshake, ShieldCheck,
  Lightbulb, BarChart2, Zap,
} from "lucide-react";

const BLAUW  = "#0b2240";
const GROEN  = "#1a6b3a";
const ORANJE = "#f28a1a";
const PAARS  = "#6d28d9";
const TEAL   = "#0891b2";
const BG     = "#f4f7fc";
const BORDER = "#dce6f0";

const PIJLERS = [
  {
    num: "1",
    title: "Minder Afhankelijkheid",
    color: GROEN,
    bg: "#eaf6ee",
    border: "#b6e2c4",
    Icon: Link2,
    items: [
      { label: "Minder platformkosten",       href: "/groei/profiel" },
      { label: "Eigen klantenkring opbouwen", href: "/groei/zichtbaarheid" },
      { label: "Directe omzetkanalen",        href: "/lokaal-marktplaats" },
      { label: "Continuïteit bij storingen",  href: "/agents/secretaresse" },
    ],
    voorbeeld: "Een pizzeria krijgt meer directe bestellingen via de eigen website in plaats van via bezorgplatforms.",
  },
  {
    num: "2",
    title: "Lokale Zichtbaarheid",
    color: BLAUW,
    bg: "#eef2f9",
    border: "#c5d5ea",
    Icon: Search,
    items: [
      { label: "Website scan",            href: "/groei/website-check" },
      { label: "Google Bedrijfsprofiel",  href: "/groei/profiel" },
      { label: "Lokale SEO",             href: "/groei/zichtbaarheid" },
      { label: "Vindbaarheid verbeteren", href: "/groei/zichtbaarheid" },
    ],
    voorbeeld: "Een nagelstudio verschijnt hoger in Google en krijgt meer lokale klanten zonder extra advertenties.",
  },
  {
    num: "3",
    title: "Lokale Verbinding",
    color: ORANJE,
    bg: "#fff8ef",
    border: "#fde6c8",
    Icon: Handshake,
    items: [
      { label: "Events & workshops", href: "/lokale-acties" },
      { label: "Buurtacties",        href: "/lokale-acties" },
      { label: "Netwerk opbouwen",   href: "/network" },
      { label: "Marktplaats",        href: "/lokaal-marktplaats" },
    ],
    voorbeeld: "Een bakker organiseert een workshop brood bakken en verbindt zich met de buurt.",
  },
  {
    num: "4",
    title: "Regels & Gemeente",
    color: PAARS,
    bg: "#f3e8ff",
    border: "#d8b4fe",
    Icon: ShieldAlert,
    items: [
      { label: "Brief analyseren",      href: "/regels/documenten" },
      { label: "Vergunningen checken",  href: "/regels/help" },
      { label: "Sectorregels",          href: "/regels/sectorregels" },
      { label: "Wat komt eraan?",       href: "/regels/ontwikkelingen" },
    ],
    voorbeeld: "Een ondernemer ontvangt een brief, begrijpt deze met OpenRegio en neemt de juiste vervolgstap.",
  },
  {
    num: "5",
    title: "Praktisch Ondernemen",
    color: TEAL,
    bg: "#ecfeff",
    border: "#a5f3fc",
    Icon: Wrench,
    items: [
      { label: "Personeel vinden & binden",  href: "/agents/secretaresse" },
      { label: "Kosten beheersen",           href: "/agents/contractagent" },
      { label: "Basischecks uitvoeren",      href: "/groei/website-check" },
      { label: "Kennisdeling & inspiratie",  href: "/blogs" },
    ],
    voorbeeld: "Een fitnesscoach verlaagt kosten, vindt lokaal personeel en bouwt een stabiel bedrijf.",
  },
];

const FLOW = [
  { num: "1", label: "BEGRIP",   sub: "Begrijp je situatie",    color: PAARS,  href: "/regels" },
  { num: "2", label: "VERSTERK", sub: "Versterk je bedrijf",    color: BLAUW,  href: "/groei/profiel" },
  { num: "3", label: "REGIO",    sub: "Pak kansen in je regio", color: GROEN,  href: "/kansen/opdrachten" },
  { num: "4", label: "SAMEN",    sub: "Werk samen & groei",     color: ORANJE, href: "/network" },
];

const AGENTS = [
  { label: "Brievenagent",  sub: "Analyseer brieven & besluiten",   color: BLAUW,  Icon: Mail,         href: "/agents/brievenagent" },
  { label: "Contractagent", sub: "Check contracten & voorwaarden",  color: GROEN,  Icon: FileCheck,    href: "/agents/contractagent" },
  { label: "Secretaresse",  sub: "Plan, organiseer en deel mee",    color: PAARS,  Icon: CalendarDays, href: "/agents/secretaresse" },
  { label: "RegioBot",      sub: "Vraag alles over je regio",       color: ORANJE, Icon: Bot,          href: "/regiobot" },
];

export default function VandaagPage() {
  usePageTitle("Vandaag — OpenRegio");
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "coaching"
    || user?.role === "admin" || user?.role === "master";
  const naam = (user as any)?.businessName
    || user?.email?.split("@")[0]
    || "ondernemer";

  return (
    <div style={{ background: BG, minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: BLAUW }}>
              Goedendag, {naam}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Welkom bij jouw OpenRegio overzicht
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              aria-label="Meldingen"
              data-testid="button-notifications"
            >
              <Bell style={{ width: 17, height: 17, color: "#64748b" }} />
            </button>
            {!isPro && (
              <Link href="/account/instellingen">
                <button
                  style={{ height: 38, paddingLeft: 16, paddingRight: 16, borderRadius: 10, border: "none", background: ORANJE, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  data-testid="button-upgrade-pro"
                >
                  Upgrade naar Pro
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Donkerblauwe banner ── */}
        <div style={{ background: BLAUW, borderRadius: 16, padding: "24px 28px", marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 900, color: "#fff" }}>
            Wat is OpenRegio?
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.72)", maxWidth: 620, lineHeight: 1.65 }}>
            Een platform met praktische tools, kennis en lokale verbindingen — zodat je minder afhankelijk bent van grote platformen en sterker staat in je regio.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {[
              { Icon: BookOpen,    label: "Begrijpen",  sub: "Regels en brieven" },
              { Icon: TrendingUp,  label: "Verbeteren", sub: "Profiel en zichtbaarheid" },
              { Icon: Users,       label: "Verbinden",  sub: "Netwerk en samenwerking" },
              { Icon: ShieldCheck, label: "Volhouden",  sub: "Continuïteit en groei" },
            ].map(({ Icon, label, sub }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 15px", display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 17, height: 17, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.58)" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sectielabel ── */}
        <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          De 5 kernpijlers van OpenRegio
        </p>

        {/* ── Pijler-grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 40 }}>
          {PIJLERS.map((p) => (
            <div
              key={p.num}
              style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", display: "flex", flexDirection: "column" }}
              data-testid={`card-pijler-${p.num}`}
            >
              {/* Kaart-header */}
              <div style={{ background: p.bg, borderBottom: `1px solid ${p.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <p.Icon style={{ width: 20, height: 20, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: "0.07em", textTransform: "uppercase" }}>Pijler {p.num}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{p.title}</div>
                </div>
              </div>

              {/* Links */}
              <div style={{ padding: "10px 0", flex: 1 }}>
                {p.items.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <div
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 20px", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = p.bg; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{item.label}</span>
                      <ChevronRight style={{ width: 14, height: 14, color: p.color, flexShrink: 0 }} />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Voorbeeld-footer */}
              <div style={{ background: p.bg, borderTop: `1px solid ${p.border}`, padding: "12px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: p.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Voorbeeld</div>
                <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.55 }}>{p.voorbeeld}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Dashboard flow ── */}
        <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Jouw OpenRegio Dashboard
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 40 }}>
          {FLOW.map((f) => (
            <Link key={f.label} href={f.href}>
              <div
                style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                data-testid={`card-flow-${f.label.toLowerCase()}`}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{f.num}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.sub}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── AI Agents ── */}
        <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          AI Agents — jouw digitale team
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 40 }}>
          {AGENTS.map((a) => (
            <Link key={a.label} href={a.href}>
              <div
                style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                data-testid={`card-agent-${a.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <a.Icon style={{ width: 20, height: 20, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.sub}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Basis vs Pro (alleen voor niet-Pro leden) ── */}
        {!isPro && (
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: 40 }}>
            <div style={{ background: BLAUW, padding: "16px 24px" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>Basis vs Pro</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Kies het plan dat bij jou past</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {/* Basis */}
              <div style={{ padding: "20px 24px", borderRight: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 14 }}>BASIS — gratis</div>
                {[
                  "Regio-inzicht inzien",
                  "Brief analyse (beperkt)",
                  "RegioBot (beperkt)",
                  "Bedrijfsprofiel (basis)",
                  "WOO-uitleg lezen",
                  "Samenwerken meedoen",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                    <div style={{ width: 17, height: 17, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: "#64748b", fontWeight: 900, lineHeight: 1 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#475569" }}>{item}</span>
                  </div>
                ))}
              </div>
              {/* Pro */}
              <div style={{ padding: "20px 24px", background: "#fafbff" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: BLAUW, marginBottom: 14 }}>PRO</div>
                {[
                  "Alles van Basis",
                  "Brief analyse (volledig)",
                  "RegioBot (onbeperkt)",
                  "WOO-verzoek maken",
                  "WOO dossiers beheren",
                  "Bedrijfsprofiel uitgebreid",
                  "Website onderhoud",
                  "Lokale acties starten",
                  "Alle AI agents",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                    <div style={{ width: 17, height: 17, borderRadius: "50%", background: BLAUW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 900, lineHeight: 1 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#334155" }}>{item}</span>
                  </div>
                ))}
                <Link href="/account/instellingen">
                  <button
                    style={{ marginTop: 16, width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: ORANJE, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    data-testid="button-upgrade-pro-comparison"
                  >
                    Upgrade naar Pro →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Brand values ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { Icon: Users,      text: "Vertrouwen van mens tot mens" },
            { Icon: Star,       text: "Vakmanschap is meesterschap" },
            { Icon: MapPin,     text: "Sterke ondernemers, sterke regio's" },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 16, height: 16, color: BLAUW }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{text}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
