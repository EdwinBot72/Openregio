import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "wouter";
import {
  ArrowRight, Mail, Bot, ShieldCheck, ChevronRight,
  CalendarDays, Store, Megaphone, Search, Inbox,
} from "lucide-react";

// Rustige, heldere ontwerptaal. Kleuren alleen als accent.
const BLAUW = "#0b2240";
const ORANJE = "#f28a1a";
const GROEN = "#1a6b3a";
const INK = "#1f2937";
const MUTED = "#6b7280";
const LIJN = "#e9edf2";
const PAPER = "#ffffff";

function fetchJson({ queryKey }: { queryKey: readonly unknown[] }) {
  return fetch(queryKey[0] as string, { credentials: "include" }).then((r) => (r.ok ? r.json() : []));
}

function geleden(d?: string): string {
  if (!d) return "";
  const t = new Date(d).getTime();
  if (isNaN(t)) return "";
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "zojuist";
  if (m < 60) return `${m} min geleden`;
  const u = Math.floor(m / 60);
  if (u < 24) return `${u} uur geleden`;
  const dg = Math.floor(u / 24);
  return `${dg} dag${dg > 1 ? "en" : ""} geleden`;
}

function groet(): string {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

type FeedItem = { id: string; kind: "actie" | "deal" | "nieuws"; title: string; sub: string; date?: string; href: string };

const ICONS = { actie: CalendarDays, deal: Store, nieuws: Megaphone } as const;

const card = {
  background: PAPER,
  border: `1px solid ${LIJN}`,
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(11,34,64,.05)",
} as const;

export default function VandaagPage() {
  usePageTitle("Vandaag — OpenRegio");
  const { user } = useAuth();

  const acties = useQuery({ queryKey: ["/api/lokale-acties/public"], queryFn: fetchJson, staleTime: 60000 });
  const deals = useQuery({ queryKey: ["/api/regio-deals"], queryFn: fetchJson, staleTime: 60000 });
  const news = useQuery({ queryKey: ["/api/news/latest"], queryFn: fetchJson, staleTime: 60000 });

  const feed: FeedItem[] = [
    ...(((acties.data as any[]) || []).map((a): FeedItem => ({ id: "a" + a.id, kind: "actie", title: a.titel, sub: `Lokale actie · ${a.regio || "jouw regio"}`, date: a.datum || a.createdAt, href: "/vandaag" }))),
    ...(((deals.data as any[]) || []).map((d): FeedItem => ({ id: "d" + d.id, kind: "deal", title: d.title, sub: `Regio-deal · ${d.provider || "lokaal"}`, date: d.createdAt, href: "/kansen/opdrachten" }))),
    ...(((news.data as any[]) || []).map((n): FeedItem => ({ id: "n" + n.id, kind: "nieuws", title: n.title, sub: "Update in je regio", date: n.publishedAt || n.createdAt, href: n.slug ? `/blogs/${n.slug}` : "/vandaag" }))),
  ]
    .sort((x, y) => new Date(y.date || 0).getTime() - new Date(x.date || 0).getTime())
    .slice(0, 6);

  const laden = acties.isLoading || deals.isLoading || news.isLoading;
  const naam = (user?.firstName as string) || "ondernemer";
  const nu = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px clamp(16px,3vw,36px) 72px" }}>
      {/* Begroeting */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: INK, letterSpacing: "-.01em" }}>{groet()}, {naam}</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14.5, color: MUTED, textTransform: "capitalize" }}>{nu}</p>
        </div>
        <Link href="/basischeck">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: GROEN, background: "rgba(26,107,58,.09)", padding: "8px 14px", borderRadius: 999, cursor: "pointer" }}>
            <ShieldCheck style={{ width: 15, height: 15 }} /> Weerbaar 4/4
          </span>
        </Link>
      </div>

      {/* Rustig hero-kaartje: de belofte, licht en met ruimte */}
      <div style={{ ...card, padding: "clamp(24px,3.5vw,34px)", marginBottom: 28, background: "linear-gradient(180deg,#f7f9fc 0%,#ffffff 100%)" }}>
        <p style={{ margin: 0, fontSize: 14.5, color: MUTED, fontWeight: 500 }}>Als ondernemer ben je zichtbaar voor het systeem.</p>
        <h2 style={{ margin: "8px 0 0", fontSize: "clamp(21px,2.8vw,29px)", color: BLAUW, fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.25, maxWidth: "22ch" }}>
          Wij maken het systeem <span style={{ color: ORANJE }}>zichtbaar voor jou.</span>
        </h2>
        <p style={{ margin: "14px 0 0", fontSize: 15, color: INK, lineHeight: 1.6, maxWidth: "52ch" }}>
          Rustig begrijpen wat er speelt, wat mag en wat je kunt doen — in gewone taal. Waar wil je vandaag mee beginnen?
        </p>
        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/agents/brievenagent">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: ORANJE, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 14.5, fontWeight: 600, cursor: "pointer" }}>
              <Mail style={{ width: 16, height: 16 }} /> Analyseer een brief
            </button>
          </Link>
          <Link href="/regiobot">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: BLAUW, border: `1px solid ${LIJN}`, borderRadius: 10, padding: "11px 18px", fontSize: 14.5, fontWeight: 600, cursor: "pointer" }}>
              <Bot style={{ width: 16, height: 16 }} /> Vraag het RegioBot
            </button>
          </Link>
        </div>
      </div>

      {/* Feed + zijkolom */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 22 }} className="or-cols">
        {/* Feed */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${LIJN}` }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>Vandaag in jouw regio</span>
            <Link href="/kansen/opdrachten"><span style={{ fontSize: 13.5, fontWeight: 600, color: ORANJE, cursor: "pointer" }}>Alles bekijken</span></Link>
          </div>

          {laden && (
            <div style={{ padding: "28px 22px", color: MUTED, fontSize: 14.5 }}>Signalen ophalen…</div>
          )}

          {!laden && feed.length === 0 && (
            <div style={{ padding: "40px 22px", textAlign: "center" }}>
              <Inbox style={{ width: 30, height: 30, color: "#cbd5e1", margin: "0 auto 12px" }} />
              <p style={{ margin: 0, fontWeight: 700, color: INK, fontSize: 15.5 }}>Nog niets nieuws in jouw regio</p>
              <p style={{ margin: "6px auto 0", color: MUTED, fontSize: 14, lineHeight: 1.6, maxWidth: "40ch" }}>Zodra er iets speelt — een gemeentebesluit, een deal of een actie — zie je het hier als eerste.</p>
            </div>
          )}

          {!laden && feed.map((it) => {
            const Icon = ICONS[it.kind];
            return (
              <Link key={it.id} href={it.href}>
                <div style={{ display: "flex", alignItems: "center", gap: 15, padding: "16px 22px", borderBottom: `1px solid ${LIJN}`, cursor: "pointer" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(242,138,26,.1)", color: ORANJE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 19, height: 19 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
                    <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{it.sub}{it.date ? ` · ${geleden(it.date)}` : ""}</div>
                  </div>
                  <ChevronRight style={{ width: 18, height: 18, color: "#cbd5e1", flexShrink: 0 }} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Zijkolom */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ ...card, padding: 22 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: INK, marginBottom: 6 }}>Snel handelen</div>
            {[
              { Icon: Mail, label: "Brievenagent", sub: "Brief of besluit begrijpen", href: "/agents/brievenagent" },
              { Icon: Search, label: "Regels onder de loep", sub: "Waar komt deze regel vandaan?", href: "/regels/check" },
              { Icon: Bot, label: "RegioBot", sub: "Vraag alles over je regio", href: "/regiobot" },
            ].map((q) => (
              <Link key={q.label} href={q.href}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderTop: `1px solid ${LIJN}`, cursor: "pointer" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(11,34,64,.05)", color: BLAUW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <q.Icon style={{ width: 17, height: 17 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{q.label}</div>
                    <div style={{ fontSize: 13, color: MUTED }}>{q.sub}</div>
                  </div>
                  <ArrowRight style={{ width: 16, height: 16, color: ORANJE, flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>

          <div style={{ ...card, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(26,107,58,.1)", color: GROEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck style={{ width: 18, height: 18 }} />
              </div>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: INK }}>Je staat sterk</span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Blijven draaien als systemen haperen — publiek zichtbaar als bewijs.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Cash", "Bonnen", "Offline", "Noodstroom"].map((b) => (
                <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: GROEN, background: "rgba(26,107,58,.09)", padding: "7px 12px", borderRadius: 999 }}>
                  <ShieldCheck style={{ width: 13, height: 13 }} /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 860px){ .or-cols{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
