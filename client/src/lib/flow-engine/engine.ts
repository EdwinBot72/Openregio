import type {
  Answers,
  FlowSchema,
  Scenario,
  ScenarioCondition,
} from "./types";

export interface MatchedScenario {
  id: string;
  level: Scenario["level"];
  riskLabel: string;
  checks: string[];
  nextStep: string;
  templateOverride?: string;
}

function conditionMatches(cond: ScenarioCondition, answers: Answers): boolean {
  const v = (answers[cond.questionId] ?? "").trim();
  if (cond.equals !== undefined && v !== cond.equals) return false;
  if (cond.in && !cond.in.includes(v)) return false;
  if (cond.contains && !v.toLowerCase().includes(cond.contains.toLowerCase())) {
    return false;
  }
  if (cond.minLength !== undefined && v.length < cond.minLength) return false;
  return true;
}

export function matchScenario(
  schema: FlowSchema,
  answers: Answers,
): MatchedScenario {
  for (const s of schema.scenarios) {
    if (s.when.every((c) => conditionMatches(c, answers))) {
      return {
        id: s.id,
        level: s.level,
        riskLabel: s.riskLabel,
        checks: s.checks,
        nextStep: s.nextStep,
        templateOverride: s.templateOverride,
      };
    }
  }
  return {
    id: "fallback",
    level: schema.fallbackScenario.level,
    riskLabel: schema.fallbackScenario.riskLabel,
    checks: schema.fallbackScenario.checks,
    nextStep: schema.fallbackScenario.nextStep,
    templateOverride: schema.fallbackScenario.templateOverride,
  };
}

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)(?:\s*\|\s*([^}]*))?\s*\}\}/g;

function lookupAnswer(
  schema: FlowSchema,
  answers: Answers,
  key: string,
): string {
  const raw = (answers[key] ?? "").trim();
  if (!raw) return "";
  const q = schema.questions.find((qq) => qq.id === key);
  if (q && (q.type === "radio" || q.type === "select") && q.options) {
    const opt = q.options.find((o) => o.value === raw);
    if (opt) return opt.label;
  }
  return raw;
}

export function renderTemplate(
  schema: FlowSchema,
  template: string,
  answers: Answers,
): string {
  return template.replace(PLACEHOLDER_RE, (_match, key: string, fallback?: string) => {
    const v = lookupAnswer(schema, answers, key);
    if (v) return v;
    return (fallback ?? "").trim();
  });
}

export function isAnswered(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
