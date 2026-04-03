import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Download,
  UserPlus,
  Shield,
  BarChart3,
  Building2,
  Signal,
  ChevronRight,
  ScanText,
  CheckCircle,
  TrendingUp,
  Eye,
  Zap,
  Globe,
  Users,
  Landmark,
  FolderOpen,
  Gavel,
  Bot,
  AlertTriangle,
  Calendar,
  FileText,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { IntelSignaal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SECTOR_CONFIG,
  SECTOR_TILES,
  CATEGORIE_META,
  CATEGORIE_KEYS,
  type SectorKey,
} from "@/config/sectors";

const CATEGORIE_KLEUREN: Record<string, string> = {
  subsidies: "text-emerald-400 bg-emerald-500/10",
  financieel: "text-amber-400 bg-amber-500/10",
  wetgeving: "text-blue-400 bg-blue-500/10",
  beleid: "text-purple-400 bg-purple-500/10",
  hoog: "text-rose-400 bg-rose-500/10",
};

// ─── Sector onboarding prompt ──────────────────────────────────────────────

function SectorOnboarding() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState<SectorKey | null>(null);

  const handleKiesSector = async (sectorKey: SectorKey) => {
    setSaving(sectorKey);
    try {
      await apiRequest("PATCH", "/api/user/sector", { sector: sectorKey });
      await qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await qc.invalidateQueries({ queryKey: ["/api/intel/signalen"] });
      toast({ title: "Sector opgeslagen", description: `Je ziet nu content voor ${SECTOR_CONFIG[sectorKey].label}.` });
    } catch {
      toast({ title: "Fout", description: "Sector kon niet worden opgeslagen.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-6" data-testid="section-sector-onboarding">
      <div className="mb-4">
        <h2 className="text-base font-bold text-foreground">In welke sector ben je actief?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Zo zien we je de meest relevante signalen, kansen en regelgeving voor jouw branche.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SECTOR_TILES.map((tile) => {
          const Icon = tile.icon;
          const isSaving = saving === tile.key;
          return (
            <button
              key={tile.key}
              onClick={() => handleKiesSector(tile.key)}
              disabled={!!saving}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center hover-elevate transition-all ${tile.bg} ${tile.border}`}
              data-testid={`sector-tile-${tile.key}`}
            >
              <div className={`w-10 h-10 rounded-xl ${tile.bg} border ${tile.border} flex items-center justify-center`}>
                {isSaving ? (
                  <Loader2 className={`h-5 w-5 animate-spin ${tile.color}`} />
                ) : (
                  <Icon className={`h-5 w-5 ${tile.color}`} />
                )}
              </div>
              <span className={`text-sm font-semibold ${tile.color}`}>{tile.label}</span>
              <span className="text-[11px] text-muted-foreground">{tile.sub}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Regio onboarding prompt ───────────────────────────────────────────────

const REGIO_TILES = [
  "Groningen", "Friesland", "Drenthe", "Overijssel", "Flevoland",
  "Gelderland", "Utrecht", "Noord-Holland", "Zuid-Holland",
  "Zeeland", "Noord-Brabant", "Limburg",
];

function RegioOnboarding() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const handleKiesRegio = async (regio: string) => {
    setSaving(regio);
    try {
      await apiRequest("PATCH", "/api/user/region", { region: regio });
      await qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await qc.invalidateQueries({ queryKey: ["/api/intel/signalen"] });
      toast({ title: "Regio opgeslagen", description: `Je ziet nu updates voor ${regio}.` });
    } catch {
      toast({ title: "Fout", description: "Regio kon niet worden opgeslagen.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-6" data-testid="section-regio-onboarding">
      <div className="mb-4">
        <h2 className="text-base font-bold text-foreground">In welke provincie ben je actief?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Zo filteren we regio-updates, beleid en kansen op jouw werkgebied.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {REGIO_TILES.map((regio) => {
          const isSaving = saving === regio;
          return (
            <button
              key={regio}
              onClick={() => handleKiesRegio(regio)}
              disabled={!!saving}
              className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground hover-elevate transition-all disabled:opacity-60"
              data-testid={`regio-tile-${regio.toLowerCase().replace(/[^a-z]/g, "-")}`}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {regio}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── WOO dossier panel ────────────────────────────────────────────────────

type WooDossier = {
  id: number;
  authority: string;
  subject: string;
  status: string;
  createdAt: string;
  deadline: string | null;
  ingebrekeSentAt: string | null;
  dwangsomContractAcceptedAt: string | null;
};

function WooDossierPanel({ isPro }: { isPro: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedDossier, setSelectedDossier] = useState<WooDossier | null>(null);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [ingrebrekeLetterOpen, setIngebrekelLetterOpen] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");

  const { data: dossiers = [], isLoading } = useQuery<WooDossier[]>({
    queryKey: ["/api/woo/dossiers"],
    enabled: isPro,
  });

  const overdue = dossiers.filter((d) => {
    if (["response_received", "closed", "ingebreke_gesteld"].includes(d.status)) return false;
    if (!d.createdAt) return false;
    const created = new Date(d.createdAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 28);
    return created <= cutoff;
  });

  const pending = dossiers.filter((d) => {
    if (["response_received", "closed", "ingebreke_gesteld"].includes(d.status)) return false;
    const created = new Date(d.createdAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 28);
    return created > cutoff;
  });

  const ingebrekelMutation = useMutation({
    mutationFn: async (dossierId: number) => {
      const res = await apiRequest("POST", `/api/woo/dossiers/${dossierId}/ingebreke`, { contractAccepted: true });
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/woo/dossiers"] });
      setGeneratedLetter(data.ingebrekeletter);
      setSelectedDossier(null);
      setContractAccepted(false);
      setIngebrekelLetterOpen(true);
    },
    onError: () => {
      toast({ title: "Mislukt", description: "Ingebrekestelling aanmaken mislukt.", variant: "destructive" });
    },
  });

  if (!isPro) return null;
  if (isLoading) return null;
  if (dossiers.length === 0) return null;

  const daysLeft = (d: WooDossier) => {
    const deadline = d.deadline ? new Date(d.deadline) : (() => {
      const t = new Date(d.createdAt);
      t.setDate(t.getDate() + 28);
      return t;
    })();
    const diff = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
    return diff;
  };

  const statusLabel: Record<string, string> = {
    sent: "Verstuurd",
    intake: "Intake",
    extracted: "Verwerkt",
    questions: "In behandeling",
    generated: "Gegenereerd",
    response_received: "Reactie ontvangen",
    closed: "Gesloten",
    ingebreke_gesteld: "In gebreke gesteld",
  };

  return (
    <>
      <section className="space-y-3" data-testid="section-woo-dossiers">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground">Mijn Woo-controleslag</h2>
        </div>

        {overdue.length > 0 && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="text-sm font-semibold text-destructive">
                {overdue.length} {overdue.length === 1 ? "dossier" : "dossiers"} zonder reactie — termijn verstreken
              </p>
            </div>
            <div className="space-y-2">
              {overdue.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border bg-background px-3 py-3 flex items-center justify-between gap-3 flex-wrap"
                  data-testid={`card-woo-overdue-${d.id}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.authority}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { setSelectedDossier(d); setContractAccepted(false); }}
                    data-testid={`button-ingebreke-${d.id}`}
                  >
                    <Gavel className="h-3.5 w-3.5 mr-1.5" />
                    In gebreke stellen
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div className="rounded-2xl border bg-card p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Lopende verzoeken</p>
            {pending.map((d) => {
              const days = daysLeft(d);
              return (
                <div
                  key={d.id}
                  className="rounded-xl border bg-background px-3 py-3 flex items-center justify-between gap-3 flex-wrap"
                  data-testid={`card-woo-pending-${d.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.authority}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex items-center gap-1 text-xs ${days <= 7 ? "text-amber-500" : "text-muted-foreground"}`}>
                      <Calendar className="h-3 w-3" />
                      <span>{days > 0 ? `${days} dag${days !== 1 ? "en" : ""} resterend` : "Termijn verstreken"}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {statusLabel[d.status] ?? d.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={!!selectedDossier} onOpenChange={(open) => { if (!open) setSelectedDossier(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-destructive" />
              Ingebrekestelling indienen
            </DialogTitle>
            <DialogDescription>
              Het bestuursorgaan heeft niet tijdig gereageerd op je Woo-verzoek inzake{" "}
              <strong>{selectedDossier?.subject}</strong>. Je kunt nu formeel in gebreke stellen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md border bg-muted/30 p-4 space-y-2 text-sm">
              <p className="font-semibold">Dwangsom-verdeling (art. 4:17 Awb)</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• De overheid verbeurt bij niet-tijdige beslissing een dwangsom.</li>
                <li>• Het wettelijk maximum bedraagt <strong>€1.400</strong> per verzoek.</li>
                <li>• OpenRegio verdeelt eventuele opbrengsten <strong>50/50</strong> met jou als verzoeker.</li>
                <li>• OpenRegio verzorgt de verdere juridische afhandeling voor jou.</li>
              </ul>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="contract-accept"
                checked={contractAccepted}
                onCheckedChange={(v) => setContractAccepted(!!v)}
                data-testid="checkbox-contract"
              />
              <label htmlFor="contract-accept" className="text-sm leading-snug cursor-pointer">
                Ik ga akkoord met de verdeling van de dwangsom (50/50) en machtigt OpenRegio om namens mij op te treden bij ingebrekestelling en verdere juridische stappen.
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setSelectedDossier(null)}>Annuleren</Button>
            <Button
              variant="destructive"
              disabled={!contractAccepted || ingebrekelMutation.isPending}
              onClick={() => selectedDossier && ingebrekelMutation.mutate(selectedDossier.id)}
              data-testid="button-confirm-ingebreke"
            >
              {ingebrekelMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Ingebrekestelling genereren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ingrebrekeLetterOpen} onOpenChange={setIngebrekelLetterOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Ingebrekestelling gegenereerd
            </DialogTitle>
            <DialogDescription>
              Kopieer de brief en stuur hem aangetekend op naar het bestuursorgaan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed p-4 bg-muted rounded-md" data-testid="text-ingebreke-letter">
              {generatedLetter}
            </pre>
          </div>
          <DialogFooter className="gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(generatedLetter).then(() => toast({ title: "Gekopieerd" }))}
              data-testid="button-copy-ingebreke"
            >
              Kopiëren
            </Button>
            <Button onClick={() => setIngebrekelLetterOpen(false)}>Sluiten</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Blog type ────────────────────────────────────────────────────────────

type BlogPost = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  createdAt?: string;
  category?: string;
};

// ─── Main dashboard ───────────────────────────────────────────────────────

export default function DashboardPage() {
  usePageTitle("Vandaag");
  const { user, isLoading: authLoading } = useAuth();

  const { data: bedrijfsprofiel } = useQuery<{
    naam?: string;
    beschrijving?: string;
    website?: string;
    telefoon?: string;
    adres?: string;
    kvkNummer?: string;
    logo?: string;
    regio?: string;
  } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const { data: intelSignalen = [] } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"],
    enabled: !!user,
  });

  const { data: blogs = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs/public"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="space-y-5 pb-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-8">
        <p className="text-muted-foreground">Log opnieuw in om door te gaan.</p>
      </div>
    );
  }

  const isPro = user.plan === "pro";
  const isAdmin = user.isAdmin || false;
  const isMaster = user.role === "master" || user.role === "admin";
  const hasSector = !!user.sector;
  const hasRegio = !!user.region;
  const sectorKey = (hasSector && user.sector && user.sector in SECTOR_CONFIG) ? user.sector as SectorKey : null;
  const sectorConfig = sectorKey ? SECTOR_CONFIG[sectorKey] : null;

  const displayName = user.firstName || bedrijfsprofiel?.naam || user.businessName || "ondernemer";
  const heeftProfiel = !!(bedrijfsprofiel?.naam);

  const signaalCount = intelSignalen.length;
  const hogeImpactCount = intelSignalen.filter(
    (s) => s.urgentie === "hoog" || s.categorie === "wetgeving"
  ).length;
  const kansSignalen = intelSignalen.filter(
    (s) => s.categorie === "subsidies" || s.categorie === "financieel"
  );

  // Profile completeness
  type ProfielVeld = "naam" | "beschrijving" | "website" | "telefoon" | "adres" | "kvkNummer";
  const profielVelden: ProfielVeld[] = ["naam", "beschrijving", "website", "telefoon", "adres", "kvkNummer"];
  const ingevuld = bedrijfsprofiel
    ? profielVelden.filter((v) => !!bedrijfsprofiel[v]).length
    : 0;
  const profielPct = Math.round((ingevuld / profielVelden.length) * 100);

  const recenteUpdates = intelSignalen.slice(0, 4).map((s) => ({
    id: String(s.id),
    titel: s.titel,
    samenvatting: s.samenvatting || s.titel,
    categorie: s.categorie,
    urgentie: s.urgentie,
  }));

  const recenteBlogs = blogs.slice(0, 3);

  function getGreeting() {
    const uur = new Date().getHours();
    if (uur < 12) return "Goedemorgen";
    if (uur < 18) return "Goedemiddag";
    return "Goedenavond";
  }

  return (
    <div className="space-y-5 pb-8">

      {/* ── Onboarding prompts (sector en/of regio ontbreekt) ───────────── */}
      {!hasSector && <SectorOnboarding />}
      {!hasRegio && <RegioOnboarding />}

      {/* ── Hero greeting ────────────────────────────────────────────────── */}
      <section data-testid="section-greeting">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111b3a] via-[#122347] to-[#0a6a5e] p-7 text-white shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Badge
              variant="outline"
              className="text-xs rounded-full border-white/15 bg-white/10 text-slate-200"
              data-testid="badge-plan"
            >
              {isPro ? "Pro-lid" : "Basis-lid"}
            </Badge>
            {sectorConfig && (
              <Badge
                variant="outline"
                className="text-xs rounded-full border-white/15 bg-white/10 text-slate-200"
                data-testid="badge-sector"
              >
                {sectorConfig.label}
              </Badge>
            )}
            {hogeImpactCount > 0 && (
              <span className="text-xs text-rose-300 font-medium">
                {hogeImpactCount} hoge-impact {hogeImpactCount === 1 ? "signaal" : "signalen"}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 mb-1">{getGreeting()}, {displayName}</p>
          <h1 className="text-2xl md:text-3xl font-black leading-tight text-white mb-2" data-testid="text-welcome">
            {hasSector && sectorConfig
              ? `Wat speelt er vandaag in ${sectorConfig.label.toLowerCase()}?`
              : "Wat speelt er vandaag in jouw regio?"}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mb-6">
            {signaalCount > 0
              ? `${signaalCount} actuele ${signaalCount === 1 ? "update" : "updates"} voor jou klaar — bekijk ze hieronder.`
              : "Regio-updates, subsidies en kansen op één plek."}
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link href="/intel">
              <button
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:opacity-90 active:scale-95"
                data-testid="button-volgende-stap"
              >
                Regio-updates <ArrowRight className="inline w-4 h-4 ml-1.5 -mt-0.5" />
              </button>
            </Link>
            <Link href="/kansen-in-de-buurt">
              <button
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
                data-testid="button-kansen"
              >
                Alle kansen bekijken
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3 status kaarten ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="section-status">

        {/* Mijn bedrijf */}
        <Link href="/bedrijfsprofiel">
          <div
            className="rounded-2xl border bg-card p-5 hover-elevate cursor-pointer h-full flex flex-col"
            data-testid="card-stat-bedrijf"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-blue-500/10 p-1.5">
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mijn bedrijf</p>
            </div>
            <p className="text-sm font-bold text-foreground truncate" data-testid="text-bedrijfsnaam">
              {bedrijfsprofiel?.naam || user.businessName || "Profiel invullen"}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {sectorConfig && (
                <span className={`text-xs font-medium ${sectorConfig.kleur}`} data-testid="text-sector-label">
                  {sectorConfig.label}
                </span>
              )}
              <Badge variant="secondary" className="text-[10px]" data-testid="badge-pakket">
                {isPro ? "Pro" : "Basis"}
              </Badge>
            </div>
            {(bedrijfsprofiel?.regio || user.region) && (
              <p className="text-xs text-muted-foreground mt-0.5">{bedrijfsprofiel?.regio || user.region}</p>
            )}
            <div className="mt-auto pt-3">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${profielPct === 100 ? "bg-emerald-500" : profielPct >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                  style={{ width: `${profielPct}%` }}
                />
              </div>
              <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${profielPct === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                <Eye className="w-3.5 h-3.5" />
                {profielPct === 100 ? "Profiel compleet" : `${ingevuld} van ${profielVelden.length} velden ingevuld`}
              </div>
              <div className="mt-3 flex gap-2">
                <span className="flex-1 text-center rounded-lg border bg-background px-2 py-1.5 text-[11px] font-medium text-foreground hover-elevate cursor-pointer" data-testid="cta-profiel-bewerken">
                  Profiel bewerken
                </span>
                <span className={`flex-1 text-center rounded-lg border px-2 py-1.5 text-[11px] font-medium hover-elevate cursor-pointer ${profielPct === 100 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" : "bg-background text-muted-foreground"}`} data-testid="cta-profiel-live">
                  Profiel live zetten
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Nieuwste kansen */}
        <Link href="/kansen-in-de-buurt">
          <div
            className="rounded-2xl border bg-card p-5 hover-elevate cursor-pointer h-full flex flex-col"
            data-testid="card-stat-kansen"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-emerald-500/10 p-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nieuwste kansen</p>
            </div>
            {kansSignalen.length === 0 ? (
              <>
                <p className="text-2xl font-black text-foreground" data-testid="text-signaal-count">{signaalCount}</p>
                <p className="text-xs text-muted-foreground mt-1">regio-updates</p>
              </>
            ) : (
              <div className="space-y-1.5 flex-1">
                {kansSignalen.slice(0, 3).map((s) => (
                  <p key={s.id} className="text-xs text-foreground line-clamp-1 leading-snug">{s.titel}</p>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              {kansSignalen.length > 0 ? `${kansSignalen.length} kansen open` : "Bekijk alle kansen"}
            </div>
          </div>
        </Link>

        {/* Open acties */}
        <div
          className="rounded-2xl border bg-card p-5 flex flex-col"
          data-testid="card-stat-open-acties"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-violet-500/10 p-1.5">
              <Zap className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Open acties</p>
          </div>
          <div className="space-y-2 flex-1">
            <Link href="/basischeck">
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 hover-elevate cursor-pointer" data-testid="actie-basischeck-card">
                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-tight">Lokale Basischeck</p>
                  <p className="text-[11px] text-muted-foreground">Controleer je compliance</p>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />
              </div>
            </Link>
            <Link href="/tools/brief-analyse">
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 hover-elevate cursor-pointer" data-testid="actie-brief-card">
                <ScanText className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-tight">Brief begrijpen</p>
                  <p className="text-[11px] text-muted-foreground">Upload een overheidsbrief</p>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />
              </div>
            </Link>
            <Link href="/regiobot">
              <div className={`flex items-center gap-2 rounded-lg border bg-background px-3 py-2 hover-elevate cursor-pointer ${!isPro ? "opacity-60" : ""}`} data-testid="actie-regiobot-card">
                <Bot className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-tight">Bibliotheek</p>
                  <p className="text-[11px] text-muted-foreground">{isPro ? "Stel een vraag" : "Pro-abonnement vereist"}</p>
                </div>
                {!isPro ? <Shield className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Onboarding wall — shown when BOTH sector and regio are missing ── */}
      {(!hasSector && !hasRegio) && (
        <section data-testid="section-onboarding-wall">
          <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-foreground">Stel je profiel in om te beginnen</h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                Kies je sector en regio hierboven om je gepersonaliseerde dashboard te activeren.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Je ziet dan kansen, regio-updates en signalen die passen bij jouw bedrijf.</p>
          </div>
        </section>
      )}

      {/* ── Kansen per sector + Regio-updates ───────────────────────────── */}
      {(hasSector || hasRegio) && (
      <section className="grid gap-5 lg:grid-cols-2" data-testid="section-kansen-updates">

        {/* Kansen per sector */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              {sectorConfig ? (
                <>
                  <sectorConfig.icon className={`w-4 h-4 ${sectorConfig.kleur}`} />
                  <h2 className="text-base font-bold text-foreground">Kansen in {sectorConfig.label.toLowerCase()}</h2>
                </>
              ) : (
                <>
                  <Landmark className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-base font-bold text-foreground">Kansen &amp; acties</h2>
                </>
              )}
            </div>
            {!hasSector && (
              <Badge variant="outline" className="text-[10px]">Kies een sector</Badge>
            )}
          </div>
          {sectorConfig ? (
            <div className="grid grid-cols-2 gap-3" data-testid="grid-kansen-sector">
              {CATEGORIE_KEYS.map((catKey) => {
                const meta = CATEGORIE_META[catKey];
                const content = sectorConfig.categorieen[catKey];
                const Icon = meta.icon;
                return (
                  <Link href={content.href} key={catKey}>
                    <div
                      className="flex items-center gap-3 rounded-xl border bg-background p-3 hover-elevate cursor-pointer"
                      data-testid={`kans-tile-${catKey}`}
                    >
                      <div className={`rounded-lg p-2 shrink-0 ${meta.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight">{meta.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{content.sub}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center" data-testid="kansen-onboarding-gate">
              <Landmark className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">Kies je sector hierboven</p>
              <p className="text-xs text-muted-foreground">Dan zie je hier de kansen en acties die relevant zijn voor jouw branche.</p>
            </div>
          )}
          {!isPro && (
            <Link href="/lidmaatschap">
              <div className="mt-3 rounded-xl border border-dashed border-muted-foreground/30 p-3 flex items-center justify-between hover-elevate cursor-pointer" data-testid="banner-upgrade">
                <div>
                  <p className="text-xs font-semibold text-foreground">Documenten &amp; AI — Pro</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Bibliotheek, WOO-verzoeken, regelgeving</p>
                </div>
                <Bot className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Link>
          )}
        </div>

        {/* Regio-updates */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <h2 className="text-base font-bold text-foreground">
              {hasRegio ? `Updates in ${user.region}` : "Regio-updates"}
            </h2>
            <Link href="/intel">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" data-testid="button-alles-updates">
                Alles bekijken <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {!hasRegio ? (
            <div className="py-6 text-center" data-testid="regio-onboarding-gate">
              <Globe className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">Kies je regio hierboven</p>
              <p className="text-xs text-muted-foreground">Dan zie je hier de laatste updates uit jouw werkgebied.</p>
            </div>
          ) : recenteUpdates.length === 0 ? (
            <div className="py-6 text-center">
              <Signal className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Geen recente updates voor {user.region}.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recenteUpdates.map((item) => (
                <Link href="/intel" key={item.id}>
                  <div
                    className="rounded-xl border bg-background px-3 py-3 cursor-pointer hover-elevate"
                    data-testid={`card-update-${item.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium text-foreground flex-1 min-w-0 leading-snug line-clamp-1">{item.titel}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${CATEGORIE_KLEUREN[item.categorie] ?? "text-muted-foreground bg-muted"}`}>
                        {item.categorie}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.samenvatting}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* ── Snelle acties ────────────────────────────────────────────────── */}
      <section data-testid="section-snelle-acties">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-foreground">Snelle acties</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ScanText, label: "Brief laten checken", sub: "Upload een overheidsbrief", href: "/tools/brief-analyse", color: "text-violet-500", bg: "bg-violet-500/10", testid: "actie-brief" },
              { icon: Globe, label: "Beter gevonden worden", sub: "Check je online zichtbaarheid", href: "/tools/website-scan", color: "text-blue-500", bg: "bg-blue-500/10", testid: "actie-website" },
              { icon: TrendingUp, label: "Kansen zien", sub: "Subsidies en lokale opdrachten", href: "/intel", color: "text-emerald-500", bg: "bg-emerald-500/10", testid: "actie-kansen" },
              { icon: UserPlus, label: "Profiel live zetten", sub: "Zichtbaar voor de regio", href: "/bedrijfsprofiel", color: "text-amber-500", bg: "bg-amber-500/10", testid: "actie-profiel-live" },
              ...(isPro ? [
                { icon: FolderOpen, label: "Documenten", sub: "Jouw bibliotheek", href: "/woo-bibliotheek", color: "text-orange-500", bg: "bg-orange-500/10", testid: "actie-documenten" },
              ] : []),
              ...(isMaster ? [
                { icon: Gavel, label: "WOO opstellen", sub: "Verzoek aanmaken", href: "/woo-wizard", color: "text-rose-500", bg: "bg-rose-500/10", testid: "actie-verzoek" },
              ] : []),
            ].map((actie) => {
              const Icon = actie.icon;
              return (
                <Link href={actie.href} key={actie.testid}>
                  <div
                    className="flex flex-col items-center gap-2 rounded-xl border bg-background p-3 hover-elevate cursor-pointer text-center"
                    data-testid={actie.testid}
                  >
                    <div className={`rounded-lg p-2 ${actie.bg}`}>
                      <Icon className={`w-4 h-4 ${actie.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{actie.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{actie.sub}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Laatste uit Bibliotheek ──────────────────────────────────────── */}
      {recenteBlogs.length > 0 && (
        <section data-testid="section-blogs">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-base font-bold text-foreground">Laatste uit Bibliotheek</h2>
              </div>
              <Link href="/blogs">
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2" data-testid="button-alle-blogs">
                  Alles lezen <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {recenteBlogs.map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.id}>
                  <div
                    className="rounded-xl border bg-background p-4 hover-elevate cursor-pointer h-full flex flex-col gap-2"
                    data-testid={`card-blog-${blog.id}`}
                  >
                    {blog.category && (
                      <Badge variant="secondary" className="text-[10px] self-start">{blog.category}</Badge>
                    )}
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{blog.title}</p>
                    {blog.excerpt && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{blog.excerpt}</p>
                    )}
                    <div className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                      Lees meer <ArrowRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WOO Controleslag ──────────────────────────────────────────────── */}
      {isPro && <WooDossierPanel isPro={isPro} />}

      {/* ── Admin ─────────────────────────────────────────────────────────── */}
      {isAdmin && (
        <section className="space-y-3 pt-2 border-t" data-testid="section-admin">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Beheer &amp; Admin</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-card p-4 space-y-3" data-testid="card-admin-export">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Leden export</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="/api/export/nieuwe-leden?days=7&format=csv">
                  <button className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover-elevate" data-testid="button-export-csv-7">CSV 7d</button>
                </a>
                <a href="/api/export/nieuwe-leden?days=30&format=csv">
                  <button className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover-elevate" data-testid="button-export-csv-30">CSV 30d</button>
                </a>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-3" data-testid="card-admin-create-user">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Gebruiker aanmaken</p>
              </div>
              <Link href="/admin/users">
                <Button size="sm" className="w-full" data-testid="button-admin-create-user">
                  Nieuw account <ArrowRight className="inline w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-3" data-testid="card-admin-cockpit">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Rapporten</p>
              </div>
              <Link href="/admin/inzicht">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-admin-rapporten">
                  Bekijk rapporten
                </Button>
              </Link>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-3" data-testid="card-admin-beheer">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Admin cockpit</p>
              </div>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-admin-beheer">
                  Naar beheer
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
