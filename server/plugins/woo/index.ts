export * from "./prompts";
export * from "./schema";
export * from "./redact";

export const WOO_MODEL = process.env.WOO_MODEL || "gpt-4o-mini";
export const WOO_DEADLINE_DAYS = 28;

export function calculateDeadline(fromDate: Date = new Date()): Date {
  return new Date(fromDate.getTime() + WOO_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
}

export const DEFAULT_CHECKLIST = [
  "Controleer alle gegevens op juistheid",
  "Voeg eventuele bijlagen toe",
  "Bewaar een kopie van dit verzoek",
  "Verstuur per e-mail of aangetekende post",
  "Noteer de verzenddatum",
  "Zet een herinnering voor 4 weken (reactietermijn)",
];
