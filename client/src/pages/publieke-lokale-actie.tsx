import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays, MapPin, Users, ExternalLink, Mail, Clock, Building2,
  Share2, Copy, CheckCircle2, LogIn,
} from "lucide-react";
import type { LokaleActie } from "@shared/schema";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; lat: number; lng: number }
  | { status: "error" };

function MiniKaart({
  locatie,
  regio,
  mapsLink,
}: {
  locatie: string;
  regio: string;
  mapsLink: string;
}) {
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    setGeo({ status: "loading" });
    fetch(
      `/api/geocode?locatie=${encodeURIComponent(locatie)}&regio=${encodeURIComponent(regio)}`,
    )
      .then((r) => {
        if (!r.ok) throw new Error("geocode failed");
        return r.json();
      })
      .then((data: { found: boolean; lat: number | null; lng: number | null }) => {
        if (cancelled) return;
        if (data.found && data.lat !== null && data.lng !== null) {
          setGeo({ status: "ok", lat: data.lat, lng: data.lng });
        } else {
          setGeo({ status: "error" });
        }
      })
      .catch(() => {
        if (!cancelled) setGeo({ status: "error" });
      });
    return () => { cancelled = true; };
  }, [locatie, regio]);

  if (geo.status === "loading") {
    return (
      <div className="h-52 w-full bg-muted/40 animate-pulse rounded-md flex items-center justify-center text-xs text-muted-foreground">
        Kaart laden…
      </div>
    );
  }

  if (geo.status === "ok") {
    const center: [number, number] = [geo.lat, geo.lng];
    return (
      <div className="relative">
        <div className="h-52 w-full overflow-hidden rounded-md">
          <MapContainer
            center={center}
            zoom={15}
            className="h-full w-full"
            scrollWheelZoom={false}
            zoomControl={true}
            attributionControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center} icon={markerIcon} />
          </MapContainer>
        </div>
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer noopener"
          className="absolute bottom-2 right-2 z-[1000] bg-background/90 text-xs text-muted-foreground px-2 py-1 rounded-md border inline-flex items-center gap-1 hover:bg-background"
        >
          Open in kaart <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <a
      href={mapsLink}
      target="_blank"
      rel="noreferrer noopener"
      className="block bg-muted/40 p-4 hover-elevate rounded-md"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{locatie}</span>
          <span className="text-muted-foreground">— {regio}</span>
        </div>
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
          Open in kaart <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

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

function useShareMeta(actie: LokaleActie | undefined) {
  useEffect(() => {
    if (!actie) return;
    const url = window.location.href;
    const title = `${actie.titel} — Lokale actie in ${actie.regio}`;
    const desc = truncate(actie.beschrijving, 200);

    const tags: HTMLMetaElement[] = [];
    tags.push(setMeta(`meta[name="description"]`, "name", "description", desc));
    tags.push(setMeta(`meta[property="og:title"]`, "property", "og:title", title));
    tags.push(setMeta(`meta[property="og:description"]`, "property", "og:description", desc));
    tags.push(setMeta(`meta[property="og:type"]`, "property", "og:type", "article"));
    tags.push(setMeta(`meta[property="og:url"]`, "property", "og:url", url));
    tags.push(setMeta(`meta[name="twitter:card"]`, "name", "twitter:card", "summary_large_image"));
    tags.push(setMeta(`meta[name="twitter:title"]`, "name", "twitter:title", title));
    tags.push(setMeta(`meta[name="twitter:description"]`, "name", "twitter:description", desc));

    return () => {
      const descEl = document.head.querySelector<HTMLMetaElement>(`meta[name="description"]`);
      if (descEl) descEl.setAttribute("content", "");
    };
  }, [actie]);
}

export default function PubliekeLokaleActiePage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: actie, isLoading, isError } = useQuery<LokaleActie>({
    queryKey: ["/api/lokale-acties/public", params.id],
    queryFn: () =>
      fetch(`/api/lokale-acties/public/${params.id}`).then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      }),
    enabled: !!params.id,
    retry: false,
  });

  usePageTitle(actie ? actie.titel : "Lokale actie");
  useShareMeta(actie);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/lokale-acties/${params.id}`
    : `/p/lokale-acties/${params.id}`;

  async function handleShare() {
    if (!actie) return;
    const shareData = {
      title: actie.titel,
      text: `${actie.titel} — lokale actie in ${actie.regio}`,
      url: publicUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast({ title: "Link gekopieerd", description: "Deel deze met je netwerk." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Kon niet kopiëren", description: publicUrl, variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4" data-testid="page-publieke-actie-loading">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !actie) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4" data-testid="page-publieke-actie-error">
        <CalendarDays className="h-10 w-10 mx-auto opacity-30" />
        <h1 className="text-xl font-semibold">Lokale actie niet gevonden</h1>
        <p className="text-sm text-muted-foreground">
          Deze actie bestaat niet meer of is inmiddels verlopen.
        </p>
        <Link href="/login">
          <Button variant="outline" data-testid="button-naar-login">
            <LogIn className="mr-2 h-4 w-4" /> Inloggen op OpenRegio
          </Button>
        </Link>
      </div>
    );
  }

  const mapsQuery = encodeURIComponent(`${actie.locatie}, ${actie.regio}, Nederland`);
  const mapsLink = `https://www.openstreetmap.org/search?query=${mapsQuery}`;
  const whatsappText = encodeURIComponent(
    `${actie.titel} — lokale actie in ${actie.regio}\n${publicUrl}`,
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6" data-testid="page-publieke-actie">
      {/* OpenRegio CTA banner */}
      <div className="bg-muted/50 border rounded-md px-4 py-3 flex items-center justify-between gap-3 flex-wrap" data-testid="banner-openregio">
        <p className="text-sm text-muted-foreground">
          Gedeeld via <span className="font-semibold text-foreground">OpenRegio</span> — platform voor lokale ondernemers
        </p>
        <Link href="/register">
          <Button size="sm" data-testid="button-aanmelden-cta">
            <LogIn className="mr-1.5 h-3.5 w-3.5" /> Gratis aanmelden
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
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
          {actie.status === "verlopen" && (
            <Badge variant="outline" data-testid="badge-verlopen">Verlopen</Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-titel">{actie.titel}</h1>
        {actie.bedrijfsnaam && (
          <p className="text-sm text-muted-foreground" data-testid="text-bedrijfsnaam">
            Door {actie.bedrijfsnaam}
          </p>
        )}
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm leading-relaxed whitespace-pre-line" data-testid="text-beschrijving">
            {actie.beschrijving}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm border-t pt-4">
            {actie.datum && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium">Wanneer</div>
                  <div className="text-muted-foreground" data-testid="text-wanneer">
                    {formatDatum(actie.datum)}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-medium">Locatie</div>
                <div className="text-muted-foreground" data-testid="text-locatie">
                  {actie.locatie} — {actie.regio}
                </div>
              </div>
            </div>
            {actie.bedrijfsnaam && (
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium">Organisator</div>
                  <div className="text-muted-foreground">{actie.bedrijfsnaam}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-medium">Doelgroep</div>
                <div className="text-muted-foreground">
                  {DOELGROEP_LABELS[actie.doelgroep] ?? actie.doelgroep}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-kaart">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{actie.locatie}</span>
            <span className="text-muted-foreground">— {actie.regio}</span>
          </div>
          <MiniKaart locatie={actie.locatie} regio={actie.regio} mapsLink={mapsLink} />
        </CardContent>
      </Card>

      {(actie.externeLink || actie.contactEmail) && (
        <Card data-testid="card-contact">
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold">Contact &amp; meer info</div>
            <div className="flex flex-wrap gap-2">
              {actie.externeLink && (
                <a href={actie.externeLink} target="_blank" rel="noreferrer noopener" data-testid="link-extern">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Meer info
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

      <Card data-testid="card-delen">
        <CardContent className="p-5 space-y-3">
          <div className="text-sm font-semibold">Deel deze actie</div>
          <p className="text-xs text-muted-foreground">
            Help mee om deze actie zichtbaar te maken bij andere ondernemers en buurtbewoners.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleShare} data-testid="button-delen">
              {copied ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <Share2 className="mr-1.5 h-3.5 w-3.5" />}
              {copied ? "Gekopieerd" : "Delen"}
            </Button>
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer noopener"
              data-testid="link-delen-whatsapp"
            >
              <Button size="sm" variant="outline">WhatsApp</Button>
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(publicUrl);
                  setCopied(true);
                  toast({ title: "Link gekopieerd" });
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  toast({ title: "Kon niet kopiëren", variant: "destructive" });
                }
              }}
              data-testid="button-kopieer-link"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Kopieer link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTA to sign up / log in */}
      <Card className="bg-muted/30" data-testid="card-aanmelden-cta">
        <CardContent className="p-5 space-y-3">
          <div className="text-sm font-semibold">Meedoen met deze actie?</div>
          <p className="text-sm text-muted-foreground">
            Maak een gratis account aan op OpenRegio om je aan te melden voor lokale acties,
            op de hoogte te blijven van wat er speelt in jouw regio en meer.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/register">
              <Button size="sm" data-testid="button-aanmelden-footer">
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> Gratis aanmelden
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" variant="outline" data-testid="button-inloggen-footer">
                Al een account? Inloggen
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
