import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Clock,
  CheckCircle2,
  Circle,
  Target,
  ArrowRight,
  ListChecks,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type CursusItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  sector: string;
  plan: string;
  minutes: number;
  goal: string;
  action: string;
  result: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  postedAt: string;
  expiresAt: string;
  daysLeft: number;
  completed: boolean;
  completedAt: string | null;
};

type CursussenResponse = {
  today: string;
  items: CursusItem[];
  totaal: number;
};

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  zichtbaarheid: { label: "Zichtbaarheid", color: "text-[#0b2240] dark:text-[#0b2240]", bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40" },
  financieel: { label: "Financieel", color: "text-[#f28a1a] dark:text-[#f28a1a]", bg: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40" },
  marketing: { label: "Marketing", color: "text-[#0b2240] dark:text-[#0b2240]", bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40" },
  operatie: { label: "Operatie", color: "text-[#0b2240] dark:text-[#0b2240]", bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40" },
  wetgeving: { label: "Wetgeving", color: "text-[#0b2240] dark:text-[#0b2240]", bg: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40" },
  netwerk: { label: "Netwerk", color: "text-[#f28a1a] dark:text-[#f28a1a]", bg: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40" },
};

// ─── Single cursus card ───────────────────────────────────────────────────────

function CursusCard({ item }: { item: CursusItem }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const cat = CATEGORY_META[item.category] ?? { label: item.category, color: "text-muted-foreground", bg: "bg-muted" };

  const toggleMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/cursussen/${item.id}/voltooid`),
    onSuccess: async (res) => {
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ["/api/cursussen"] });
      toast({
        title: data.completed ? "Actie voltooid!" : "Markering verwijderd",
        description: data.completed ? "Goed bezig! Je hebt deze actie afgerond." : "Actie staat weer open.",
      });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Fout", description: "Kon voortgang niet opslaan." });
    },
  });

  return (
    <div
      className={`rounded-2xl border border-border bg-card overflow-hidden transition ${item.completed ? "opacity-75" : ""}`}
      data-testid={`card-cursus-${item.id}`}
    >
      {/* Afbeelding */}
      {item.imageUrl && (
        <div className="w-full overflow-hidden" style={{ height: 160 }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            data-testid={`img-cursus-${item.id}`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      <div className="p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cat.bg} ${cat.color}`}>
            {cat.label}
          </span>
          {item.completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3 w-3" />
              Gedaan
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{item.minutes} min</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-foreground leading-snug mb-3" data-testid={`text-cursus-title-${item.id}`}>
        {item.title}
      </h3>

      {/* Goal / Action / Result */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-1 shrink-0">
            <Target className="h-3 w-3 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Doel</p>
            <p className="text-sm text-foreground leading-snug">{item.goal}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-1 shrink-0">
            <ListChecks className="h-3 w-3 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Actie</p>
            <p className="text-sm text-foreground leading-snug">{item.action}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-1 shrink-0">
            <Trophy className="h-3 w-3 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Resultaat</p>
            <p className="text-sm text-foreground leading-snug">{item.result}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Nog {item.daysLeft} {item.daysLeft === 1 ? "dag" : "dagen"} beschikbaar
        </span>
        <Button
          size="sm"
          variant={item.completed ? "outline" : "default"}
          onClick={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
          data-testid={`button-voltooien-${item.id}`}
          className="shrink-0"
        >
          {item.completed ? (
            <>
              <Circle className="h-3.5 w-3.5 mr-1.5" />
              Terugzetten
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {item.ctaLabel ?? "Markeer als gedaan"}
            </>
          )}
        </Button>
      </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CursusSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-9 w-36 ml-auto" />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CursussenPage() {
  usePageTitle("Acties van de week");
  const { user } = useAuth();

  const { data, isLoading } = useQuery<CursussenResponse>({
    queryKey: ["/api/cursussen"],
  });

  const items = data?.items ?? [];
  const completed = items.filter((i) => i.completed).length;
  const totaal = items.length;
  const progressPct = totaal > 0 ? Math.round((completed / totaal) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-10 space-y-6">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 text-white bg-primary"
        data-testid="section-cursussen-hero"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 opacity-75" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">Acties van de week</span>
        </div>
        <h1 className="text-2xl font-black leading-tight text-white mb-1">
          Concrete stappen voor jouw bedrijf
        </h1>
        <p className="text-sm text-white/70 max-w-xl">
          Elke week nieuwe, praktische acties om je bedrijf te versterken. Haal ze een voor een binnen.
        </p>

        {/* Voortgangsbalk */}
        {!isLoading && totaal > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5 text-xs text-white/80">
              <span>{completed} van {totaal} {totaal === 1 ? "actie" : "acties"} gedaan</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progressPct}%` }}
                data-testid="progress-bar-cursussen"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Inhoud ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          <CursusSkeleton />
          <CursusSkeleton />
        </div>
      ) : totaal === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground mb-1">Geen actieve acties</p>
          <p className="text-sm text-muted-foreground mb-5">
            Er zijn momenteel geen acties beschikbaar voor jouw plan en sector.
            Kom snel terug voor nieuwe inhoud.
          </p>
          <Link href="/dashboard">
            <Button variant="default" data-testid="button-terug-dashboard">
              Terug naar dashboard
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {completed === totaal && totaal > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3" data-testid="banner-alles-voltooid">
              <Trophy className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">Alle acties voltooid!</p>
                <p className="text-xs text-muted-foreground">Goed gedaan. Kom volgende week terug voor nieuwe acties.</p>
              </div>
            </div>
          )}

          <div className="space-y-4" data-testid="list-cursussen">
            {items.map((item) => (
              <CursusCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
