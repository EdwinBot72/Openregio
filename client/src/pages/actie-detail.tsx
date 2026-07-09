import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, parseApiError } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays, MapPin, Users, ExternalLink, Mail, Clock, Building2,
  ArrowLeft, Share2, Copy, CheckCircle2, ChevronRight, BellRing,
} from "lucide-react";
import { SiFacebook, SiX, SiLinkedin, SiWhatsapp } from "react-icons/si";
import type { LokaleActie } from "@shared/schema";

const DOELGROEP_LABELS: Record<string, string> = {
  iedereen: "Iedereen",
  buurtbewoners: "Buurtbewoners",
  ouderen: "Ouderen",
  studenten: "Studenten",
  gezinnen: "Gezinnen",
  ondernemers: "Ondernemers",
  kinderen: "Kinderen",
};

function formatDatum(d: string | Date | null | undefined) {
  if (!d) return "Doorlopend";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "EEEE d MMMM yyyy 'om' HH:mm", { locale: nl });
}

function truncate(text: string, max = 200) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function useOpenGraphMeta(actie: LokaleActie | undefined) {
  useEffect(() => {
    if (!actie) return;
    const url = window.location.href;
    const title = `${actie.titel} — Lokale actie in ${actie.regio} | OpenRegio`;
    const desc = truncate(actie.beschrijving, 200);

    const tags: HTMLMetaElement[] = [];
    tags.push(setMeta(`meta[name="description"]`, "name", "description", desc));
    tags.push(setMeta(`meta[property="og:title"]`, "property", "og:title", title));
    tags.push(setMeta(`meta[property="og:description"]`, "property", "og:description", desc));
    tags.push(setMeta(`meta[property="og:type"]`, "property", "og:type", "article"));
    tags.push(setMeta(`meta[property="og:url"]`, "property", "og:url", url));
    tags.push(setMeta(`meta[property="og:site_name"]`, "property", "og:site_name", "OpenRegio"));
    tags.push(setMeta(`meta[name="twitter:card"]`, "name", "twitter:card", "summary"));
    tags.push(setMeta(`meta[name="twitter:title"]`, "name", "twitter:title", title));
    tags.push(setMeta(`meta[name="twitter:description"]`, "name", "twitter:description", desc));

    return () => {
      const descEl = document.head.querySelector<HTMLMetaElement>(`meta[name="description"]`);
      if (descEl) descEl.setAttribute("content", "");
    };
  }, [actie]);
}

export default function ActieDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderSent, setReminderSent] = useState(false);

  const { data: actie, isLoading, isError } = useQuery<LokaleActie>({
    queryKey: ["/api/lokale-acties/public", params.id],
    queryFn: () =>
      fetch(`/api/lokale-acties/public/${params.id}`).then((r) => {
        if (!r.ok) throw new Error("Niet gevonden");
        return r.json();
      }),
    enabled: !!params.id,
    retry: false,
  });

  const reminderMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", `/api/lokale-acties/public/${params.id}/interesse`, { email });
      return res.json();
    },
    onSuccess: () => {
      setReminderSent(true);
      toast({ title: "Bevestigd", description: "We sturen je een herinnering met de details van deze actie." });
    },
    onError: (err: any) => {
      toast({
        title: "Kon herinnering niet instellen",
        description: parseApiError(err, "Controleer je e-mailadres en probeer het opnieuw."),
        variant: "destructive",
      });
    },
  });

  function handleReminderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reminderEmail.trim()) return;
    reminderMutation.mutate(reminderEmail.trim());
  }

  usePageTitle(actie ? `${actie.titel} — OpenRegio` : "Lokale actie");
  useOpenGraphMeta(actie);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = actie
    ? encodeURIComponent(`${actie.titel} — lokale actie in ${actie.regio}`)
    : "";
  const shareUrlEncoded = encodeURIComponent(shareUrl);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link gekopieerd", description: "Deel de link met je netwerk." });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Kon niet kopiëren", variant: "destructive" });
    }
  }

  async function handleNativeShare() {
    if (!actie) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: actie.titel, text: actie.beschrijving.slice(0, 200), url: shareUrl });
        return;
      } catch { /* user cancelled */ }
    }
    await copyLink();
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <NavBar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !actie) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <NavBar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", textAlign: "center" }} data-testid="page-error">
          <CalendarDays size={40} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Lokale actie niet gevonden</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
            Deze actie bestaat niet meer of is inmiddels verlopen.
          </p>
          <Link href="/acties">
            <Button variant="outline" data-testid="button-terug">
              <ArrowLeft className="mr-2 h-4 w-4" /> Bekijk alle acties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const mapsQuery = encodeURIComponent(`${actie.locatie}, ${actie.regio}, Nederland`);
  const mapsLink = `https://www.openstreetmap.org/search?query=${mapsQuery}`;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }} data-testid="page-actie-detail">
      <NavBar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 64px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Terug-link */}
        <div>
          <Link href="/acties">
            <Button variant="ghost" size="sm" data-testid="link-terug">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Alle lokale acties
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            <Badge variant="secondary" data-testid="badge-doelgroep">
              <Users className="mr-1 h-3 w-3" />
              {DOELGROEP_LABELS[actie.doelgroep] ?? actie.doelgroep}
            </Badge>
            {actie.datum && (
              <Badge variant="outline" data-testid="badge-datum">
                <CalendarDays className="mr-1 h-3 w-3" />
                {format(new Date(actie.datum), "d MMM yyyy", { locale: nl })}
              </Badge>
            )}
          </div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, lineHeight: 1.2, margin: 0 }} data-testid="text-titel">
            {actie.titel}
          </h1>
          {actie.bedrijfsnaam && (
            <p style={{ fontSize: 14, color: "#64748b" }} data-testid="text-bedrijfsnaam">
              Georganiseerd door <strong>{actie.bedrijfsnaam}</strong>
            </p>
          )}
        </div>

        {/* Beschrijving + details */}
        <Card>
          <CardContent className="p-5" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line" }} data-testid="text-beschrijving">
              {actie.beschrijving}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, fontSize: 14, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
              {actie.datum && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Clock size={16} style={{ color: "#94a3b8", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Wanneer</div>
                    <div style={{ color: "#64748b" }} data-testid="text-wanneer">{formatDatum(actie.datum)}</div>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <MapPin size={16} style={{ color: "#94a3b8", marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Locatie</div>
                  <div style={{ color: "#64748b" }} data-testid="text-locatie">{actie.locatie} — {actie.regio}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Users size={16} style={{ color: "#94a3b8", marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Doelgroep</div>
                  <div style={{ color: "#64748b" }}>{DOELGROEP_LABELS[actie.doelgroep] ?? actie.doelgroep}</div>
                </div>
              </div>
              {actie.bedrijfsnaam && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Building2 size={16} style={{ color: "#94a3b8", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Organisator</div>
                    <div style={{ color: "#64748b" }}>{actie.bedrijfsnaam}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Locatie-link */}
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer noopener"
          style={{ textDecoration: "none" }}
          data-testid="link-kaart"
        >
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <MapPin size={16} style={{ color: "#1E6DB5", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{actie.locatie}</span>
                  <span style={{ color: "#94a3b8" }}>— {actie.regio}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" as const }}>
                  Open in kaart <ExternalLink size={12} />
                </div>
              </div>
            </CardContent>
          </Card>
        </a>

        {/* Herinnering per e-mail */}
        <Card data-testid="card-herinnering">
          <CardContent className="p-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BellRing size={16} style={{ color: "#1E6DB5" }} />
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>Stuur mij een herinnering</p>
            </div>
            {reminderSent ? (
              <p style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }} data-testid="text-herinnering-bevestigd">
                <CheckCircle2 className="h-4 w-4" style={{ color: "#16a34a" }} />
                We hebben je een e-mail gestuurd met de details van deze actie.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "#64748b" }}>
                  Vul je e-mailadres in en ontvang de datum en locatie van deze actie in je inbox.
                </p>
                <form
                  onSubmit={handleReminderSubmit}
                  style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}
                >
                  <Input
                    type="email"
                    required
                    placeholder="jouw@email.nl"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="max-w-xs"
                    data-testid="input-herinnering-email"
                  />
                  <Button
                    type="submit"
                    size="default"
                    disabled={reminderMutation.isPending}
                    data-testid="button-herinnering-versturen"
                  >
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    {reminderMutation.isPending ? "Versturen…" : "Herinner mij"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        {(actie.externeLink || actie.contactEmail) && (
          <Card data-testid="card-contact">
            <CardContent className="p-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Contact &amp; meer informatie</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {actie.externeLink && (
                  <a href={actie.externeLink} target="_blank" rel="noreferrer noopener" data-testid="link-extern">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Meer informatie
                    </Button>
                  </a>
                )}
                {actie.contactEmail && (
                  <a href={`mailto:${actie.contactEmail}`} data-testid="link-email">
                    <Button size="sm" variant="outline">
                      <Mail className="mr-1.5 h-3.5 w-3.5" /> Contact opnemen
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social sharing */}
        <Card data-testid="card-delen">
          <CardContent className="p-5" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Deel deze actie</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>
                Help mee om deze actie bekend te maken in de regio.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {/* Native share / kopieer */}
              <Button size="sm" onClick={handleNativeShare} data-testid="button-delen">
                {copied ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <Share2 className="mr-1.5 h-3.5 w-3.5" />}
                {copied ? "Gekopieerd" : "Delen"}
              </Button>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${shareText}%20${shareUrlEncoded}`}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="link-delen-whatsapp"
              >
                <Button size="sm" variant="outline" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SiWhatsapp size={14} style={{ color: "#25D366" }} /> WhatsApp
                </Button>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="link-delen-facebook"
              >
                <Button size="sm" variant="outline" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SiFacebook size={14} style={{ color: "#1877F2" }} /> Facebook
                </Button>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrlEncoded}`}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="link-delen-x"
              >
                <Button size="sm" variant="outline" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SiX size={13} /> X
                </Button>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEncoded}`}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="link-delen-linkedin"
              >
                <Button size="sm" variant="outline" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SiLinkedin size={14} style={{ color: "#0A66C2" }} /> LinkedIn
                </Button>
              </a>

              {/* Kopieer link */}
              <Button
                size="sm"
                variant="outline"
                onClick={copyLink}
                data-testid="button-kopieer-link"
              >
                {copied ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                {copied ? "Gekopieerd" : "Kopieer link"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA voor bezoekers */}
        <div style={{ background: "linear-gradient(135deg, #0A2D6E, #1E6DB5)", borderRadius: 14, padding: "28px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" as const }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: "white", marginBottom: 6 }}>
              Wil je ook acties plaatsen in jouw regio?
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>
              Word Pro-lid van OpenRegio en bereik iedereen in jouw gemeente.
            </p>
          </div>
          <Link href="/register" data-testid="link-cta-register">
            <Button style={{ background: "#E8820C", color: "white", border: "none", fontWeight: 700 }}>
              Word lid <ChevronRight size={15} style={{ marginLeft: 4 }} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#0f172a", padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#64748b", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>OpenRegio</Link>
          <Link href="/acties" style={{ color: "#64748b", textDecoration: "none" }}>Lokale acties</Link>
          <Link href="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</Link>
          <Link href="/login" style={{ color: "#64748b", textDecoration: "none" }}>Inloggen</Link>
        </div>
        <p style={{ fontSize: 12, color: "#475569", marginTop: 12 }}>© 2025 OpenRegio · Sterke ondernemers. Sterke regio's.</p>
      </footer>
    </div>
  );
}

function NavBar() {
  return (
    <header style={{ background: "#0A2D6E", padding: "0 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }} data-testid="link-logo">
          <span style={{ fontWeight: 900, fontSize: 18, color: "white" }}>Open</span>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#60a5fa" }}>Regio</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/acties">
            <Button variant="ghost" size="sm" style={{ color: "rgba(255,255,255,.8)" }}>
              Alle acties
            </Button>
          </Link>
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
  );
}
