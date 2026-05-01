import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Save, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Answers, FlowSchema } from "@/lib/flow-engine/types";
import { matchScenario, renderTemplate } from "@/lib/flow-engine/engine";
import { QuestionField } from "./QuestionField";
import { OutputPanel } from "./OutputPanel";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { HelpFlowDossier } from "@shared/schema";

interface Props {
  schema: FlowSchema;
}

function buildPrefill(schema: FlowSchema, search: string): Answers {
  if (!search) return {};
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: Answers = {};
  for (const q of schema.questions) {
    const raw = params.get(q.id);
    if (raw == null) continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if ((q.type === "select" || q.type === "radio") && q.options) {
      const allowed = q.options.find((o) => o.value === trimmed);
      if (allowed) out[q.id] = allowed.value;
      continue;
    }
    out[q.id] = trimmed;
  }
  return out;
}

function applyDossierAnswers(schema: FlowSchema, raw: unknown): Answers {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as Record<string, unknown>;
  const out: Answers = {};
  for (const q of schema.questions) {
    const v = src[q.id];
    if (typeof v !== "string") continue;
    const trimmed = v.trim();
    if (!trimmed) continue;
    if ((q.type === "select" || q.type === "radio") && q.options) {
      const allowed = q.options.find((o) => o.value === trimmed);
      if (allowed) out[q.id] = allowed.value;
      continue;
    }
    out[q.id] = trimmed;
  }
  return out;
}

function buildDossierTitle(schema: FlowSchema, answers: Answers): string {
  // Pak het eerste niet-lege antwoord als korte beschrijving van de casus.
  for (const q of schema.questions) {
    const raw = (answers[q.id] ?? "").trim();
    if (!raw) continue;
    let label = raw;
    if ((q.type === "radio" || q.type === "select") && q.options) {
      const opt = q.options.find((o) => o.value === raw);
      if (opt) label = opt.label;
    }
    const short = label.length > 60 ? `${label.slice(0, 57)}…` : label;
    return `${schema.title} — ${short}`;
  }
  const stamp = new Date().toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${schema.title} (${stamp})`;
}

export function FlowRunner({ schema }: Props) {
  const search = useSearch();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const dossierId = useMemo(() => {
    if (!search) return "";
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    return (params.get("dossier") ?? "").trim();
  }, [search]);

  const initialAnswers = useMemo(
    () => buildPrefill(schema, search),
    [schema, search],
  );
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  // Snapshot van de opgeslagen rendered tekst van het geopende dossier.
  // Wordt vertoond zolang de gebruiker de antwoorden niet wijzigt, zodat
  // historische dossiers stabiel blijven ook al verandert de flow-template later.
  const [snapshotText, setSnapshotText] = useState<string | null>(null);

  const dossierQuery = useQuery<HelpFlowDossier>({
    queryKey: ["/api/help-flow-dossiers", dossierId],
    enabled: Boolean(dossierId) && isAuthenticated,
  });

  // Wanneer een dossier geladen is, herstel de antwoorden in de runner.
  useEffect(() => {
    if (!dossierId) return;
    const data = dossierQuery.data;
    if (!data) return;
    if (data.flowId !== schema.id) return;
    const restored = applyDossierAnswers(schema, data.answers);
    if (Object.keys(restored).length === 0) return;
    setAnswers(restored);
    setSnapshotText(data.renderedText && data.renderedText.length > 0 ? data.renderedText : null);
    // We willen dit alleen draaien wanneer er een nieuw dossier binnenkomt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossierQuery.data?.id, dossierId, schema.id]);

  const scenario = useMemo(() => matchScenario(schema, answers), [schema, answers]);

  const computedText = useMemo(() => {
    const tmpl = scenario.templateOverride ?? schema.outputTemplate;
    return renderTemplate(schema, tmpl, answers);
  }, [schema, scenario, answers]);

  // Toon de opgeslagen snapshot zolang de gebruiker niets gewijzigd heeft;
  // anders altijd de live berekende tekst.
  const renderedText = snapshotText ?? computedText;

  const hasAnyAnswer = useMemo(
    () => Object.values(answers).some((v) => typeof v === "string" && v.trim().length > 0),
    [answers],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        flowId: schema.id,
        flowTitle: schema.title,
        title: buildDossierTitle(schema, answers),
        answers,
        scenarioId: scenario.id,
        scenarioLevel: scenario.level,
        scenarioRiskLabel: scenario.riskLabel,
        renderedText,
      };
      const res = await apiRequest("POST", "/api/help-flow-dossiers", body);
      return (await res.json()) as HelpFlowDossier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-flow-dossiers"] });
      toast({
        title: "Opgeslagen",
        description: "Je dossier staat onder 'Mijn dossiers' op de hulp-pagina.",
      });
    },
    onError: () => {
      toast({
        title: "Opslaan mislukt",
        description: "Probeer het later nog eens of log opnieuw in.",
        variant: "destructive",
      });
    },
  });

  function setAnswer(id: string, v: string) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
    // Zodra de gebruiker iets wijzigt, vervalt de opgeslagen snapshot en
    // schakelen we over op de live berekende tekst.
    if (snapshotText !== null) setSnapshotText(null);
  }

  return (
    <div className="flow-engine-grid">
      <div className="flow-questions" data-testid="flow-questions">
        <div className="openregio-card">
          <h2>Beantwoord deze vragen</h2>
          <p className="flow-questions-intro">{schema.intro}</p>
          {dossierId && dossierQuery.isLoading ? (
            <p className="flow-questions-intro" data-testid="text-dossier-loading">
              Eerder dossier wordt geladen…
            </p>
          ) : null}
          {dossierId && dossierQuery.isError ? (
            <p className="flow-questions-intro" data-testid="text-dossier-error">
              Dit dossier kon niet geladen worden. Je kunt wel een nieuw dossier
              starten.
            </p>
          ) : null}
          {dossierId &&
          dossierQuery.data &&
          dossierQuery.data.flowId !== schema.id ? (
            <p
              className="flow-questions-intro"
              data-testid="text-dossier-mismatch"
            >
              Dit dossier hoort bij een andere hulp-flow ('
              {dossierQuery.data.flowTitle}'). Open het via 'Mijn dossiers' op
              de hulp-pagina.
            </p>
          ) : null}
          <div className="flow-question-list">
            {schema.questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flow-output-col">
        <OutputPanel
          title={schema.outputTitle}
          text={renderedText}
          scenario={scenario}
        />

        {isAuthenticated ? (
          <div className="flow-save-row">
            <button
              type="button"
              className="flow-save-button"
              onClick={() => saveMutation.mutate()}
              disabled={!hasAnyAnswer || saveMutation.isPending}
              data-testid="button-save-dossier"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saveMutation.isPending ? "Opslaan…" : "Bewaar als dossier"}
            </button>
            <p className="flow-save-hint">
              Je antwoorden + concept-tekst worden bewaard onder 'Mijn
              dossiers' zodat je later verder kunt.
            </p>
          </div>
        ) : (
          <p className="flow-save-hint" data-testid="text-save-login-hint">
            Log in om deze flow als dossier op te slaan.
          </p>
        )}
      </div>
    </div>
  );
}
