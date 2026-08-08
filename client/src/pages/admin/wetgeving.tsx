import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, BookOpen, Building2, Calendar, CheckCircle, Clock, Globe, MapPin, User } from "lucide-react";
import { Link } from "wouter";

type Inzending = {
  id: number;
  afzender: string;
  onderwerp: string;
  regio: string;
  brief_tekst: string | null;
  status: "ingediend" | "verwerkt" | "gepubliceerd";
  ingediend_op: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  business_name: string | null;
};

const STATUS_LABELS: Record<Inzending["status"], string> = {
  ingediend: "Ingediend",
  verwerkt: "Verwerkt",
  gepubliceerd: "Gepubliceerd",
};

const STATUS_VARIANTS: Record<Inzending["status"], "secondary" | "outline" | "default"> = {
  ingediend: "secondary",
  verwerkt: "outline",
  gepubliceerd: "default",
};

function volgendeStatus(status: Inzending["status"]): Inzending["status"] | null {
  if (status === "ingediend") return "verwerkt";
  if (status === "verwerkt") return "gepubliceerd";
  return null;
}

function InzendingRow({ inzending }: { inzending: Inzending }) {
  const { toast } = useToast();
  const datum = new Date(inzending.ingediend_op).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const indiener = [inzending.first_name, inzending.last_name].filter(Boolean).join(" ") || inzending.email;
  const volgend = volgendeStatus(inzending.status);

  const statusMutation = useMutation({
    mutationFn: async (nieuweStatus: string) => {
      const res = await apiRequest("PATCH", `/api/wetgeving/inzendingen/${inzending.id}/status`, {
        status: nieuweStatus,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Onbekende fout");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wetgeving/inzendingen"] });
      toast({ title: "Status bijgewerkt" });
    },
    onError: (err: Error) => {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Card data-testid={`card-inzending-${inzending.id}`}>
      <CardContent className="pt-5 pb-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-medium text-sm" data-testid={`text-onderwerp-${inzending.id}`}>
              {inzending.onderwerp}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {inzending.afzender}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {inzending.regio}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {indiener}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {datum}
              </span>
            </div>
          </div>
          <Badge
            variant={STATUS_VARIANTS[inzending.status]}
            data-testid={`badge-status-${inzending.id}`}
          >
            {STATUS_LABELS[inzending.status]}
          </Badge>
        </div>

        {inzending.brief_tekst && (
          <div className="bg-muted/50 rounded-md px-3 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3" data-testid={`text-brief-${inzending.id}`}>
              {inzending.brief_tekst}
            </p>
          </div>
        )}

        {volgend && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate(volgend)}
              data-testid={`button-status-${inzending.id}`}
            >
              {volgend === "verwerkt" && <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
              {volgend === "gepubliceerd" && <Globe className="h-3.5 w-3.5 mr-1.5" />}
              Markeer als {STATUS_LABELS[volgend].toLowerCase()}
            </Button>
          </div>
        )}
        {!volgend && (
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Gepubliceerd — zichtbaar voor alle leden
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminWetgevingPage() {
  usePageTitle("Admin — Wetgeving Inzendingen");

  const { data: inzendingen, isLoading } = useQuery<Inzending[]>({
    queryKey: ["/api/wetgeving/inzendingen"],
  });

  const counts = inzendingen
    ? {
        ingediend: inzendingen.filter((i) => i.status === "ingediend").length,
        verwerkt: inzendingen.filter((i) => i.status === "verwerkt").length,
        gepubliceerd: inzendingen.filter((i) => i.status === "gepubliceerd").length,
      }
    : null;

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#ffffff", border: "1px solid #dce6f0", color: "#64748b", flexShrink: 0 }} data-testid="button-back">
          <ArrowLeft size={14} />
        </Link>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BookOpen style={{ width: 24, height: 24, color: "#0b2240" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="heading-wetgeving-admin">Wetgeving</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            Brieven ingediend door leden — verwerk en publiceer ze voor het platform.
          </p>
        </div>
      </div>

      {counts && (
        <div className="grid grid-cols-3 gap-3" data-testid="grid-stats">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold" data-testid="stat-ingediend">{counts.ingediend}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Ingediend
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold" data-testid="stat-verwerkt">{counts.verwerkt}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" /> Verwerkt
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold" data-testid="stat-gepubliceerd">{counts.gepubliceerd}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Globe className="h-3 w-3" /> Gepubliceerd
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3" data-testid="section-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-5 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : inzendingen && inzendingen.length > 0 ? (
        <div className="space-y-3" data-testid="list-inzendingen">
          {inzendingen.map((i) => (
            <InzendingRow key={i.id} inzending={i} />
          ))}
        </div>
      ) : (
        <Card data-testid="card-leeg">
          <CardContent className="pt-10 pb-10 text-center">
            <p className="text-muted-foreground text-sm">Nog geen inzendingen ontvangen.</p>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
  );
}
