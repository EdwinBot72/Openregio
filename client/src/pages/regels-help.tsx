import { Link } from "wouter";
import {
  Mail,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Folder,
  Trash2,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FLOW_LIST, getFlow } from "@/lib/flow-engine/flows";
import type { HelpFlowDossier } from "@shared/schema";

const ICONS = {
  mail: Mail,
  help: HelpCircle,
  shield: ShieldAlert,
};

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function MijnDossiers() {
  const { toast } = useToast();
  const dossiersQuery = useQuery<HelpFlowDossier[]>({
    queryKey: ["/api/help-flow-dossiers"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/help-flow-dossiers/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-flow-dossiers"] });
      toast({
        title: "Verwijderd",
        description: "Het dossier is verwijderd.",
      });
    },
    onError: () => {
      toast({
        title: "Verwijderen mislukt",
        description: "Probeer het later nog eens.",
        variant: "destructive",
      });
    },
  });

  const pendingDeleteId =
    deleteMutation.isPending && typeof deleteMutation.variables === "string"
      ? deleteMutation.variables
      : null;

  if (dossiersQuery.isLoading) {
    return (
      <div className="flow-dossiers-empty" data-testid="dossiers-loading">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Dossiers laden…</span>
      </div>
    );
  }

  if (dossiersQuery.isError) {
    return (
      <div className="flow-dossiers-empty" data-testid="dossiers-error">
        <span>
          Je dossiers konden niet geladen worden.{" "}
          <button
            type="button"
            className="flow-dossier-retry"
            onClick={() => dossiersQuery.refetch()}
            data-testid="button-retry-dossiers"
          >
            Probeer opnieuw
          </button>
        </span>
      </div>
    );
  }

  const dossiers = dossiersQuery.data ?? [];

  if (dossiers.length === 0) {
    return (
      <p className="flow-dossiers-empty" data-testid="dossiers-empty">
        Je hebt nog geen opgeslagen dossiers. Start een hulp-flow hierboven en
        gebruik de knop 'Bewaar als dossier' om je antwoorden te bewaren.
      </p>
    );
  }

  return (
    <ul className="flow-dossiers-list" data-testid="list-dossiers">
      {dossiers.map((d) => {
        const flow = getFlow(d.flowId);
        const open = flow ? `/regels/help/${d.flowId}?dossier=${d.id}` : "#";
        const isDeletingThisRow = pendingDeleteId === d.id;
        return (
          <li
            key={d.id}
            className="flow-dossier-item"
            data-testid={`item-dossier-${d.id}`}
          >
            <div className="flow-dossier-info">
              <div className="flow-dossier-title" data-testid={`text-dossier-title-${d.id}`}>
                {d.title}
              </div>
              <div className="flow-dossier-meta">
                <span>{d.flowTitle}</span>
                <span aria-hidden="true">·</span>
                <span>{formatDate(d.createdAt)}</span>
                {d.scenarioRiskLabel ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{d.scenarioRiskLabel}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flow-dossier-actions">
              {flow ? (
                <Link
                  href={open}
                  className="flow-dossier-open"
                  data-testid={`button-open-dossier-${d.id}`}
                >
                  Openen <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="flow-dossier-missing">
                  Flow niet meer beschikbaar
                </span>
              )}
              <button
                type="button"
                className="flow-dossier-delete"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm("Weet je zeker dat je dit dossier wilt verwijderen?")
                  ) {
                    return;
                  }
                  deleteMutation.mutate(d.id);
                }}
                disabled={isDeletingThisRow}
                data-testid={`button-delete-dossier-${d.id}`}
                aria-label="Dossier verwijderen"
              >
                {isDeletingThisRow ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function RegelsHelpPage() {
  usePageTitle("Hulp bij regels — OpenRegio");
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-regels-help">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <Link href="/regels">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 18, cursor: "pointer" }}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Terug naar Regels
        </div>
      </Link>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <HelpCircle style={{ width: 24, height: 24, color: "#6d28d9" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Hulp bij regels</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Drie korte hulplijnen voor wat ondernemers het vaakst tegenkomen.
            </p>
          </div>
        </div>
      </div>

      <div className="flow-hub-grid">
        {FLOW_LIST.map((flow) => {
          const Icon = ICONS[flow.icon] ?? HelpCircle;
          return (
            <Link
              key={flow.id}
              href={`/regels/help/${flow.id}`}
              className="flow-hub-card"
              data-testid={`card-flow-${flow.id}`}
            >
              <div className="flow-hub-icon">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flow-hub-title">{flow.title}</div>
              <p className="flow-hub-desc">{flow.intro}</p>
              <div className="flow-hub-cta">
                Start <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {isAuthenticated ? (
        <section className="flow-dossiers-section" data-testid="section-mijn-dossiers">
          <div className="flow-dossiers-head">
            <Folder className="h-4 w-4" />
            <h2>Mijn dossiers</h2>
          </div>
          <p className="flow-dossiers-intro">
            Eerder bewaarde hulp-flows. Open een dossier om je antwoorden en
            concept-tekst terug te zien.
          </p>
          <MijnDossiers />
        </section>
      ) : (
        <section
          className="flow-dossiers-section"
          data-testid="section-mijn-dossiers-loggedout"
        >
          <div className="flow-dossiers-head">
            <Folder className="h-4 w-4" />
            <h2>Mijn dossiers</h2>
          </div>
          <p className="flow-dossiers-intro">
            Log in om je hulp-flows te bewaren en later verder te werken.
          </p>
        </section>
      )}
      </div>
    </div>
  );
}
