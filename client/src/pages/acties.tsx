import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays, MapPin, Users, Search, ArrowRight, Clock, Building2, ChevronRight, ExternalLink,
} from "lucide-react";
import type { LokaleActie } from "@shared/schema";
import { LOKALE_ACTIE_DOELGROEPEN } from "@shared/schema";
import { LokaleActiesMap } from "@/components/LokaleActiesMap";

const DOELGROEP_LABELS: Record<string, string> = {
  iedereen: "Iedereen",
  buurtbewoners: "Buurtbewoners",
  ouderen: "Ouderen",
  studenten: "Studenten",
  gezinnen: "Gezinnen",
  ondernemers: "Ondernemers",
  kinderen: "Kinderen",
};

function formatDatumKort(d: string | Date | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "d MMM", { locale: nl });
}

function formatDatum(d: string | Date | null | undefined) {
  if (!d) return "Doorlopend";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "EEEE d MMMM yyyy 'om' HH:mm", { locale: nl });
}

export default function ActiesPage() {
  usePageTitle("Lokale acties in jouw regio — OpenRegio");

  const [zoek, setZoek] = useState("");
  const [filterRegio, setFilterRegio] = useState("");
  const [filterDoelgroep, setFilterDoelgroep] = useState("alle");

  const { data: acties = [], isLoading } = useQuery<LokaleActie[]>({
    queryKey: ["/api/lokale-acties/public"],
  });

  const gefilterd = useMemo(() => {
    const filtered = acties.filter((a) => {
      const matchDoel = filterDoelgroep === "alle" || a.doelgroep === filterDoelgroep;
      const matchRegio = filterRegio.trim() === "" || a.regio.toLowerCase().includes(filterRegio.toLowerCase());
      const matchZoek = zoek.trim() === "" ||
        a.titel.toLowerCase().includes(zoek.toLowerCase()) ||
        a.beschrijving.toLowerCase().includes(zoek.toLowerCase()) ||
        a.locatie.toLowerCase().includes(zoek.toLowerCase());
      return matchDoel && matchRegio && matchZoek;
    });
    const FAR = Number.POSITIVE_INFINITY;
    return [...filtered].sort((a, b) => {
      const ta = a.datum ? new Date(a.datum).getTime() : FAR;
      const tb = b.datum ? new Date(b.datum).getTime() : FAR;
      return ta - tb;
    });
  }, [acties, filterDoelgroep, filterRegio, zoek]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* ── Top-nav ── */}
      <header style={{ background: "#0A2D6E", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }} data-testid="link-logo">
            <span style={{ fontWeight: 900, fontSize: 18, color: "white" }}>Open</span>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#60a5fa" }}>Regio</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login">
              <Button variant="ghost" size="sm" style={{ color: "rgba(255,255,255,.8)" }} data-testid="link-nav-login">
                Inloggen
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" style={{ background: "#E8820C", color: "white", border: "none" }} data-testid="link-nav-register">
                Word lid
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg, #0A2D6E 0%, #1E6DB5 100%)", padding: "52px 24px 44px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.12)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "rgba(255,255,255,.85)", marginBottom: 20 }}>
            <CalendarDays size={13} /> Actuele evenementen en initiatieven
          </div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: "white", margin: "0 0 14px", lineHeight: 1.2 }}>
            Lokale acties in jouw regio
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.78)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Ontdek evenementen, buurtinitiatieven en ondernemersacties bij jou in de buurt — georganiseerd door lokale Pro-leden.
          </p>

          {/* Zoekbalk prominent */}
          <div style={{ display: "flex", gap: 8, maxWidth: 560, margin: "0 auto", flexWrap: "wrap" as const }}>
            <div style={{ flex: 1, position: "relative" as const, minWidth: 200 }}>
              <Search size={16} style={{ position: "absolute" as const, left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" as const }} />
              <input
                type="text"
                placeholder="Zoek gemeente, stad of regio..."
                value={filterRegio}
                onChange={(e) => setFilterRegio(e.target.value)}
                style={{ width: "100%", padding: "11px 12px 11px 38px", borderRadius: 10, border: "none", fontSize: 14, background: "white", boxSizing: "border-box" as const }}
                data-testid="input-zoek-regio"
              />
            </div>
            <button
              onClick={() => setFilterRegio(filterRegio)}
              style={{ padding: "11px 22px", background: "#E8820C", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              data-testid="button-zoek"
            >
              Zoeken
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters + lijst ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 64px" }}>
        {!isLoading && gefilterd.length > 0 && <LokaleActiesMap acties={gefilterd} />}

        {/* Extra filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" as const }}>
          <div style={{ position: "relative" as const, flex: 1, minWidth: 180 }}>
            <Search size={15} style={{ position: "absolute" as const, left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" as const }} />
            <Input
              placeholder="Zoek op titel of locatie..."
              value={zoek}
              onChange={(e) => setZoek(e.target.value)}
              className="pl-8"
              data-testid="input-zoek-tekst"
            />
          </div>
          <Select value={filterDoelgroep} onValueChange={setFilterDoelgroep}>
            <SelectTrigger className="w-52" data-testid="select-doelgroep">
              <SelectValue placeholder="Alle doelgroepen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle doelgroepen</SelectItem>
              {LOKALE_ACTIE_DOELGROEPEN.map((d) => (
                <SelectItem key={d} value={d}>{DOELGROEP_LABELS[d]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teller */}
        {!isLoading && (
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }} data-testid="text-teller">
            {gefilterd.length === 0
              ? "Geen acties gevonden"
              : `${gefilterd.length} ${gefilterd.length === 1 ? "actie" : "acties"} gevonden`}
            {filterRegio && ` in "${filterRegio}"`}
          </p>
        )}

        {/* Skeletons */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : gefilterd.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", color: "#94a3b8" }} data-testid="empty-state">
            <CalendarDays size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Geen acties gevonden</p>
            <p style={{ fontSize: 14 }}>
              {acties.length === 0
                ? "Er zijn nog geen lokale acties geplaatst."
                : "Probeer een andere regio of doelgroep."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }} data-testid="lijst-acties">
            {gefilterd.map((actie) => (
              <Link key={actie.id} href={`/acties/${actie.id}`} style={{ textDecoration: "none", color: "inherit" }} data-testid={`link-actie-${actie.id}`}>
                <Card className="hover-elevate h-full" data-testid={`card-actie-${actie.id}`} style={{ cursor: "pointer" }}>
                  <CardContent className="p-4 h-full" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                      <Badge variant="secondary">
                        <Users className="mr-1 h-3 w-3" />
                        {DOELGROEP_LABELS[actie.doelgroep] ?? actie.doelgroep}
                      </Badge>
                      {actie.datum && (
                        <Badge variant="outline">
                          <CalendarDays className="mr-1 h-3 w-3" />
                          {formatDatumKort(actie.datum)}
                        </Badge>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }} data-testid={`text-titel-${actie.id}`}>
                        {actie.titel}
                      </p>
                      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {actie.beschrijving}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#94a3b8" }}>
                      {actie.datum && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} />
                          <span>{formatDatum(actie.datum)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <MapPin size={12} />
                        <span>{actie.locatie} — {actie.regio}</span>
                      </div>
                      {actie.bedrijfsnaam && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Building2 size={12} />
                          <span>{actie.bedrijfsnaam}</span>
                        </div>
                      )}
                      {actie.externeLink && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <ExternalLink size={12} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                            {actie.externeLink.replace(/^https?:\/\//, "")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 12, color: "#0A2D6E", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        Bekijk details <ArrowRight size={13} />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* CTA voor ondernemers */}
        <div style={{ marginTop: 56, background: "linear-gradient(135deg, #0A2D6E, #1E6DB5)", borderRadius: 16, padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" as const }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 18, color: "white", marginBottom: 8 }}>
              Organiseer je zelf een lokale actie?
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)", maxWidth: 480 }}>
              Als Pro-lid van OpenRegio kun je evenementen en initiatieven plaatsen die zichtbaar zijn voor iedereen in jouw regio.
            </p>
          </div>
          <Link href="/register" data-testid="link-cta-register">
            <Button style={{ background: "#E8820C", color: "white", border: "none", fontWeight: 700, padding: "10px 22px" }}>
              Word Pro-lid <ChevronRight size={16} style={{ marginLeft: 4 }} />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#0f172a", padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#64748b", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>OpenRegio</Link>
          <Link href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: "#64748b", textDecoration: "none" }}>Voorwaarden</Link>
          <Link href="/login" style={{ color: "#64748b", textDecoration: "none" }}>Inloggen</Link>
        </div>
        <p style={{ fontSize: 12, color: "#475569", marginTop: 12 }}>© 2025 OpenRegio · Sterke ondernemers. Sterke regio's.</p>
      </footer>
    </div>
  );
}
