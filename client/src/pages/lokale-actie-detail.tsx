import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CalendarDays, MapPin, Users, ExternalLink, Mail, Clock, Building2,
  ArrowLeft, Share2, Copy, CheckCircle2, Pencil, Trash2,
} from "lucide-react";
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
      // Reset description but leave OG tags (they will be overwritten by next page).
      const descEl = document.head.querySelector<HTMLMetaElement>(`meta[name="description"]`);
      if (descEl) descEl.setAttribute("content", "");
    };
  }, [actie]);
}

export default function LokaleActieDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: actie, isLoading, isError } = useQuery<LokaleActie>({
    queryKey: ["/api/lokale-acties", params.id],
    enabled: !!params.id && !!user,
  });

  usePageTitle(actie ? actie.titel : "Lokale actie");
  useShareMeta(actie);

  const verwijderenMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/lokale-acties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokale-acties"] });
      toast({ title: "Verwijderd", description: "Je actie is verwijderd." });
      setLocation("/lokale-acties");
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon actie niet verwijderen.", variant: "destructive" });
    },
  });

  const verlopenMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/lokale-acties/${id}/verlopen`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lokale-acties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lokale-acties", params.id] });
      toast({ title: "Verlopen", description: "Je actie is gemarkeerd als verlopen." });
    },
  });

  async function handleShare() {
    if (!actie) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: actie.titel,
      text: `${actie.titel} — lokale actie in ${actie.regio}`,
      url: shareUrl,
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
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link gekopieerd", description: "Deel deze met je netwerk." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Kon niet kopiëren", description: shareUrl, variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4" data-testid="page-actie-detail-loading">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !actie) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4" data-testid="page-actie-detail-error">
        <CalendarDays className="h-10 w-10 mx-auto opacity-30" />
        <h1 className="text-xl font-semibold">Lokale actie niet gevonden</h1>
        <p className="text-sm text-muted-foreground">
          Deze actie bestaat niet meer of is inmiddels verlopen.
        </p>
        <Link href="/lokale-acties">
          <Button variant="outline" data-testid="button-terug-overzicht">
            <ArrowLeft className="mr-2 h-4 w-4" /> Terug naar lokale acties
          </Button>
        </Link>
      </div>
    );
  }

  const isEigen = user?.id === actie.ownerUserId;
  const mapsQuery = encodeURIComponent(`${actie.locatie}, ${actie.regio}, Nederland`);
  const osmEmbedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=&layer=mapnik&marker=&query=${mapsQuery}`;
  const mapsLink = `https://www.openstreetmap.org/search?query=${mapsQuery}`;
  const whatsappText = encodeURIComponent(
    `${actie.titel} — lokale actie in ${actie.regio}\n${window.location.href}`,
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6" data-testid="page-actie-detail">
      <div>
        <Link href="/lokale-acties">
          <Button variant="ghost" size="sm" data-testid="link-terug">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Lokale acties
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
        <CardContent className="p-0 overflow-hidden rounded-md">
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer noopener"
            className="block bg-muted/40 p-4 hover-elevate"
            data-testid="link-kaart-extern"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{actie.locatie}</span>
                <span className="text-muted-foreground">— {actie.regio}</span>
              </div>
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                Open in kaart <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </a>
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
                  await navigator.clipboard.writeText(window.location.href);
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

      {isEigen && (
        <Card data-testid="card-eigenaar-acties">
          <CardContent className="p-5 space-y-3">
            <div className="text-sm font-semibold">Beheer je actie</div>
            <div className="flex flex-wrap gap-2">
              <Link href="/lokale-acties">
                <Button size="sm" variant="outline" data-testid="button-bewerken">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Bewerken
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                disabled={verlopenMutation.isPending || actie.status === "verlopen"}
                onClick={() => verlopenMutation.mutate(actie.id)}
                data-testid="button-verlopen"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Markeer verlopen
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                data-testid="button-verwijder"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Verwijderen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Actie verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie wordt permanent verwijderd en is niet meer zichtbaar voor andere leden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-annuleer-verwijderen">Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => verwijderenMutation.mutate(actie.id)}
              data-testid="button-bevestig-verwijderen"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
