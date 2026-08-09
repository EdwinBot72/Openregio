import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "wouter";
import {
  ArrowRight, Mail, Bot, ShieldCheck, ChevronRight,
  CalendarDays, Store, Megaphone, Search, Inbox,
} from "lucide-react";

const BLAUW = "#0b2240";
const ORANJE = "#f28a1a";
const GROEN = "#1a6b3a";

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

type FeedItem = { id: string; kind: "actie" | "deal" | "nieuws"; title: string; sub: string; date?: string; href: string };

const ICONS = { actie: CalendarDays, deal: Store, nieuws: Megaphone } as const;

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

  const card = { background: "#fff", border: "1px solid #e6ebf1", borderRadius: 16, boxShadow: "0 1px 2px rgba(11,34,64,.04)" } as const;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px clamp(16px,3vw,36px) 64px" }}>
      {/* Kop */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: BLAUW, letterSpacing: "-.02em" }}>Goedemorgen, {naam}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b", textTransform: "capitalize" }}>{nu}</p>
        </div>
        <Link href="/basischeck">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: GROEN, background: "rgba(26,107,58,.1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>
            <ShieldCheck style={{ width: 15, height: 15 }} /> Weerbaar 4/4
          </span>
        </Link>
      </div>

      {/* Thesis-hero */}
      <div style={{ background: BLAUW, borderRadius: 20, padding: "clamp(24px,4vw,38px)", position: "relative", overflow: "hidden", marginBottom: 22 }}>
        <div style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: ORANJE }}>OpenRegio · vandaag</div>
        <p style={{ margin: "14px 0 2px", fontSize: "clamp(16px,2vw,19px)", color: "rgba(255,255,255,.7)", fontWeight: 600 }}>Als ondernemer ben je zichtbaar voor het systeem.</p>
        <h2 style={{ margin: 0, fontSize: "clamp(22px,3.4vw,34px)", color: "#fff", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1.2, maxWidth: "20ch" }}>
          Wij maken het systeem <span style={{ color: ORANJE }}>zichtbaar voor jou.</span>
        </h2>
        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/agents/brievenagent">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: ORANJE, color: "#fff", border: "none", borderRadius: 10, padding: "11px 17px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              <Mail style={{ width: 16, height: 16 }} /> Analyseer een brief
            </button>
          </Link>
          <Link href="/regiobot">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.28)", borderRadius: 10, padding: "11px 17px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              <Bot style={{ width: 16, height: 16 }} /> Vraag het RegioBot
            </button>
          </Link>
        </div>
      </div>

      {/* Twee kolommen: feed + snel */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 18 }} className="or-cols">
        {/* Feed */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #eef2f6" }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: BLAUW }}>Vandaag in jouw regio</span>
            <Link href="/kansen/opdrachten"><span style={{ fontSize: 13, fontWeight: 700, color: ORANJE, cursor: "pointer" }}>Alles bekijken</span></Link>
          </div>

          {laden && (
            <div style={{ padding: "24px 20px", color: "#94a3b8", fontSize: 14 }}>Signalen ophalen…</div>
          )}

          {!laden && feed.length === 0 && (
            <div style={{ padding: "34px 20px", textAlign: "center" }}>
              <Inbox style={{ width: 30, height: 30, color: "#cbd5e1", margin: "0 auto 10px" }} />
              <p style={{ margin: 0, fontWeight: 700, color: BLAUW, fontSize: 15 }}>Nog niets nieuws in jouw regio</p>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13.5 }}>Zodra er iets speelt — een gemeentebesluit, een deal of een actie — zie je het hier als eerste.</p>
            </div>
          )}

          {!laden && feed.map((it) => {
            const Icon = ICONS[it.kind];
            return (
              <Link key={it.id} href={it.href}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(242,138,26,.12)", color: ORANJE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 19, height: 19 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", marginTop: 2 }}>{it.sub}{it.date ? ` · ${geleden(it.date)}` : ""}</div>
                  </div>
                  <ChevronRight style={{ width: 18, height: 18, color: "#cbd5e1", flexShrink: 0 }} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Snel handelen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: BLAUW, marginBottom: 14 }}>Snel handelen</div>
            {[
              { Icon: Mail, label: "Brievenagent", sub: "Brief of besluit begrijpen", href: "/agents/brievenagent" },
              { Icon: Search, label: "Regels onder de loep", sub: "Waar komt deze regel vandaan?", href: "/regels/check" },
              { Icon: Bot, label: "RegioBot", sub: "Vraag alles over je regio", href: "/regiobot" },
            ].map((q) => (
              <Link key={q.label} href={q.href}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid #f1f5f9", cursor: "pointer" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(11,34,64,.06)", color: BLAUW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <q.Icon style={{ width: 17, height: 17 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{q.label}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{q.sub}</div>
                  </div>
                  <ArrowRight style={{ width: 16, height: 16, color: ORANJE, flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>

          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(26,107,58,.12)", color: GROEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck style={{ width: 18, height: 18 }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: BLAUW }}>Je staat sterk</span>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "#64748b", lineHeight: 1.5 }}>Blijven draaien als systemen haperen — publiek zichtbaar als bewijs.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Cash", "Bonnen", "Offline", "Noodstroom"].map((b) => (
                <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: GROEN, background: "rgba(26,107,58,.1)", padding: "7px 12px", borderRadius: 999 }}>
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
