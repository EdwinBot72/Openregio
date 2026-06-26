import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Bell, ChevronRight, ArrowUpRight, Check,
  Mail, FileCheck, Star, Bot,
  BookOpen, TrendingUp, Users, Zap,
  Globe, MapPin, Handshake, Newspaper,
  Shield, Scale, FileText, Lightbulb,
  Briefcase, Building2, Calendar,
} from "lucide-react";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  navy:   "#0b2240",
  green:  "#1a6b3a",
  orange: "#f28a1a",
  purple: "#6d28d9",
  teal:   "#0891b2",
  bg:     "#f4f7fc",
  card:   "#ffffff",
  border: "#dce6f0",
};

// ── Tiny reusable components ──────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

function NavLink({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 14px", borderRadius: 8, background: "#f8fafc", border: `1px solid ${C.border}`, textDecoration: "none", color: "#334155", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
      {label}
      <ChevronRight size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
    </Link>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 18px" }}>
      {children}
    </h2>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VandaagPage() {
  usePageTitle("Vandaag — OpenRegio");
  const { user } = useAuth();

  const isPro = user?.role === "admin" || user?.role === "master"
    || (user as any)?.plan === "pro" || (user as any)?.plan === "coaching";

  const firstName = (user as any)?.firstName?.trim() || user?.email?.split("@")[0] || "ondernemer";

  const { data: notifData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
    staleTime: 60_000,
    retry: false,
  });
  const notifCount = notifData?.count ?? 0;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 24px 64px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── 1. HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.navy }}>
              Goedemiddag, {firstName}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Welkom terug op jouw OpenRegio dashboard.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {notifCount > 0 && (
              <Link href="/vandaag" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#b91c1c", fontWeight: 700, fontSize: 13, padding: "7px 14px", borderRadius: 999, textDecoration: "none" }} data-testid="badge-notifications">
                <Bell size={13} /> {notifCount} melding{notifCount !== 1 ? "en" : ""}
              </Link>
            )}
            {!isPro && (
              <Link href="/lidmaatschap" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.orange, color: "white", fontWeight: 700, fontSize: 13, padding: "8px 18px", borderRadius: 999, textDecoration: "none" }} data-testid="button-upgrade-pro">
                <ArrowUpRight size={14} /> Upgrade naar Pro
              </Link>
            )}
          </div>
        </div>

        {/* ── 2. INTRO BANNER ── */}
        <div style={{ background: C.navy, borderRadius: 16, padding: "28px 32px", marginBottom: 36, color: "white", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -40, width: 200, height: 200, background: "rgba(255,255,255,.04)", borderRadius: "50%" }} />
          <p style={{ margin: "0 0 24px", fontSize: 15, color: "rgba(255,255,255,.85)", lineHeight: 1.7, maxWidth: 680 }}>
            Een platform met praktische tools, kennis en lokale verbindingen. Alles op één plek, voor een sterker bedrijf én een sterkere regio.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {[
              { icon: <BookOpen size={16} />, label: "Begrijpen" },
              { icon: <TrendingUp size={16} />, label: "Verbeteren" },
              { icon: <Users size={16} />, label: "Verbinden" },
              { icon: <Zap size={16} />, label: "Volhouden" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>
                {item.icon} {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. FIVE PILLARS GRID ── */}
        <SectionHeading>De 5 kernpijlers van OpenRegio</SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 40 }}>

          {/* Pijler 1 */}
          <Card>
            <div style={{ background: C.green, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "white", flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>Minder Afhankelijkheid</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>Zelfstandig en veerkrachtig</div>
              </div>
              <Building2 size={20} style={{ color: "rgba(255,255,255,.6)", marginLeft: "auto" }} />
            </div>
            <div style={{ padding: "14px 16px 8px" }}>
              <NavLink href="/groei/profiel" label="Bedrijfsprofiel" color={C.green} />
              <NavLink href="/groei/zichtbaarheid" label="Vindbaarheid verbeteren" color={C.green} />
              <NavLink href="/lokaal-marktplaats" label="Lokale marktplaats" color={C.green} />
              <NavLink href="/agents/secretaresse" label="Secretaresse-agent" color={C.green} />
            </div>
            <div style={{ background: "#f0fdf4", padding: "10px 16px", fontSize: 12, color: "#166534", borderTop: `1px solid ${C.border}` }}>
              Voorbeeld: "Jouw profiel zichtbaar voor 140 ondernemers in Haarlem."
            </div>
          </Card>

          {/* Pijler 2 */}
          <Card>
            <div style={{ background: C.navy, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "white", flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>Lokale Zichtbaarheid</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>Gevonden worden dichtbij</div>
              </div>
              <Globe size={20} style={{ color: "rgba(255,255,255,.6)", marginLeft: "auto" }} />
            </div>
            <div style={{ padding: "14px 16px 8px" }}>
              <NavLink href="/groei/website-check" label="Website scan" color={C.navy} />
              <NavLink href="/groei/profiel" label="Bedrijfsprofiel optimaliseren" color={C.navy} />
              <NavLink href="/groei/zichtbaarheid" label="SEO & vindbaarheid" color={C.navy} />
            </div>
            <div style={{ background: "#eff6ff", padding: "10px 16px", fontSize: 12, color: "#1e40af", borderTop: `1px solid ${C.border}` }}>
              Voorbeeld: "Website scan toont 3 verbeterpunten voor meer klanten."
            </div>
          </Card>

          {/* Pijler 3 */}
          <Card>
            <div style={{ background: C.orange, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "white", flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>Lokale Verbinding</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>Samenwerken in de regio</div>
              </div>
              <Handshake size={20} style={{ color: "rgba(255,255,255,.6)", marginLeft: "auto" }} />
            </div>
            <div style={{ padding: "14px 16px 8px" }}>
              <NavLink href="/lokale-acties" label="Lokale acties & events" color={C.orange} />
              <NavLink href="/network" label="Ondernemersnetwerk" color={C.orange} />
              <NavLink href="/lokaal-marktplaats" label="Marktplaats" color={C.orange} />
            </div>
            <div style={{ background: "#fff7ed", padding: "10px 16px", fontSize: 12, color: "#9a3412", borderTop: `1px solid ${C.border}` }}>
              Voorbeeld: "Bakker zoekt samenwerking met koffiezaak voor lunchconcept."
            </div>
          </Card>

          {/* Pijler 4 */}
          <Card>
            <div style={{ background: C.purple, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "white", flexShrink: 0 }}>4</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>Regels & Gemeente</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>Grip op wet- en regelgeving</div>
              </div>
              <Shield size={20} style={{ color: "rgba(255,255,255,.6)", marginLeft: "auto" }} />
            </div>
            <div style={{ padding: "14px 16px 8px" }}>
              <NavLink href="/regels/documenten" label="Brief analyseren" color={C.purple} />
              <NavLink href="/regels/help" label="Vergunning & regels hulp" color={C.purple} />
              <NavLink href="/regels/sectorregels" label="Sectorregels" color={C.purple} />
              <NavLink href="/regels/ontwikkelingen" label="Wat komt eraan?" color={C.purple} />
            </div>
            <div style={{ background: "#f5f3ff", padding: "10px 16px", fontSize: 12, color: "#5b21b6", borderTop: `1px solid ${C.border}` }}>
              Voorbeeld: "Terrasvergunning verloopt over 14 dagen — actie vereist."
            </div>
          </Card>

          {/* Pijler 5 */}
          <Card>
            <div style={{ background: C.teal, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "white", flexShrink: 0 }}>5</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>Praktisch Ondernemen</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>AI-tools voor dagelijks gebruik</div>
              </div>
              <Briefcase size={20} style={{ color: "rgba(255,255,255,.6)", marginLeft: "auto" }} />
            </div>
            <div style={{ padding: "14px 16px 8px" }}>
              <NavLink href="/agents/secretaresse" label="Secretaresse-agent" color={C.teal} />
              <NavLink href="/agents/contractagent" label="Contractagent" color={C.teal} />
              <NavLink href="/groei/website-check" label="Website check" color={C.teal} />
              <NavLink href="/blogs" label="Blog & kennisbank" color={C.teal} />
            </div>
            <div style={{ background: "#ecfeff", padding: "10px 16px", fontSize: 12, color: "#155e75", borderTop: `1px solid ${C.border}` }}>
              Voorbeeld: "Vergaderingsverslag klaar in 30 seconden via de Secretaresse-agent."
            </div>
          </Card>

        </div>

        {/* ── 4. DASHBOARD FLOW ── */}
        <SectionHeading>Jouw OpenRegio Dashboard</SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { num: "1", label: "BEGRIP", sub: "Regelgeving begrijpen", color: C.purple, bg: "#f5f3ff", href: "/regels", icon: <Scale size={20} style={{ color: C.purple }} /> },
            { num: "2", label: "VERSTERK", sub: "Bedrijfsprofiel versterken", color: C.navy, bg: "#eff6ff", href: "/groei/profiel", icon: <TrendingUp size={20} style={{ color: C.navy }} /> },
            { num: "3", label: "REGIO", sub: "Kansen in jouw regio", color: C.green, bg: "#f0fdf4", href: "/kansen/opdrachten", icon: <MapPin size={20} style={{ color: C.green }} /> },
            { num: "4", label: "SAMEN", sub: "Lokale samenwerking", color: C.orange, bg: "#fff7ed", href: "/network", icon: <Users size={20} style={{ color: C.orange }} /> },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{ textDecoration: "none" }} data-testid={`card-flow-${item.label.toLowerCase()}`}>
              <Card style={{ cursor: "pointer", transition: "box-shadow .15s" }}>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.icon}
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "white" }}>{item.num}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.navy, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{item.sub}</div>
                </div>
                <div style={{ padding: "8px 20px 12px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: item.color }}>
                  Ga naar <ChevronRight size={12} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* ── 5. AI AGENTS ── */}
        <SectionHeading>AI Agents — jouw digitale team</SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Brievenagent", sub: "Overheidsbrieven uitgelegd", color: "#1f5fae", bg: "#eff6ff", href: "/agents/brievenagent", icon: <Mail size={20} style={{ color: "#1f5fae" }} /> },
            { label: "Contractagent", sub: "Contracten doorlichten", color: C.green, bg: "#f0fdf4", href: "/agents/contractagent", icon: <FileCheck size={20} style={{ color: C.green }} /> },
            { label: "Secretaresse", sub: "Taken, e-mails, vergaderingen", color: C.purple, bg: "#f5f3ff", href: "/agents/secretaresse", icon: <Star size={20} style={{ color: C.purple }} /> },
            { label: "RegioBot", sub: "Regelgeving AI-assistent", color: C.orange, bg: "#fff7ed", href: "/regiobot", icon: <Bot size={20} style={{ color: C.orange }} /> },
          ].map((agent) => (
            <Link key={agent.label} href={agent.href} style={{ textDecoration: "none" }} data-testid={`card-agent-${agent.label.toLowerCase().replace(/\s/g, "-")}`}>
              <Card style={{ cursor: "pointer" }}>
                <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: agent.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {agent.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.navy }}>{agent.label}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{agent.sub}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* ── 6. BASIS vs PRO (non-pro only) ── */}
        {!isPro && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* BASIS */}
              <Card>
                <div style={{ padding: "18px 20px 6px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "inline-block", background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 900, padding: "3px 12px", borderRadius: 999, letterSpacing: "0.06em", marginBottom: 8 }}>BASIS</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#64748b", marginBottom: 14 }}>Gratis starten</div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  {["Bedrijfsprofiel aanmaken", "Lokale acties bekijken", "Sectorregels raadplegen", "Netwerk bekijken"].map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155", marginBottom: 8 }}>
                      <Check size={14} style={{ color: "#1d4ed8", flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
              </Card>

              {/* PRO */}
              <Card style={{ border: `2px solid ${C.orange}` }}>
                <div style={{ padding: "18px 20px 6px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "inline-block", background: C.orange + "18", color: C.orange, fontSize: 11, fontWeight: 900, padding: "3px 12px", borderRadius: 999, letterSpacing: "0.06em", marginBottom: 8 }}>PRO</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#64748b", marginBottom: 14 }}>Alle tools ontgrendeld</div>
                </div>
                <div style={{ padding: "14px 20px 10px" }}>
                  {["Document upload & analyse", "Website scan & SEO", "Brievenagent + Contractagent", "RegioBot (onbeperkt)", "Lokale actie aanmaken"].map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155", marginBottom: 8 }}>
                      <Check size={14} style={{ color: C.orange, flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0 20px 18px" }}>
                  <Link href="/lidmaatschap" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.orange, color: "white", fontWeight: 700, fontSize: 14, padding: "11px", borderRadius: 10, textDecoration: "none" }} data-testid="button-upgrade-pro-comparison">
                    <ArrowUpRight size={15} /> Upgrade naar Pro
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── 7. VALUES ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: <Users size={18} style={{ color: C.green }} />, label: "Vertrouwen van mens tot mens", bg: "#f0fdf4" },
            { icon: <Lightbulb size={18} style={{ color: C.orange }} />, label: "Vakmanschap is meesterschap", bg: "#fff7ed" },
            { icon: <MapPin size={18} style={{ color: C.navy }} />, label: "Sterke ondernemers, sterke regio's", bg: "#eff6ff" },
          ].map((val) => (
            <div key={val.label} style={{ background: val.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flexShrink: 0 }}>{val.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, lineHeight: 1.4 }}>{val.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
