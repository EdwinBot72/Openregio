import { z } from "zod";

export const intakeSchema = z.object({
  authority: z.string().min(1, "Bestuursorgaan is verplicht"),
  subject: z.string().min(1, "Onderwerp is verplicht"),
  uploadedDocument: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  purpose: z.string().nullable().optional(),
  userQuestion: z.string().nullable().optional(),
});

export const extractSchema = z.object({
  dossierId: z.number().int().positive("Dossier ID is verplicht"),
  documentText: z.string().min(1, "Documenttekst is verplicht"),
});

export const questionsSchema = z.object({
  dossierId: z.number().int().positive("Dossier ID is verplicht"),
  extractedData: z.record(z.any()).nullable().optional(),
  purpose: z.string().nullable().optional(),
  userQuestion: z.string().nullable().optional(),
});

export const generateSchema = z.object({
  dossierId: z.number().int().positive("Dossier ID is verplicht"),
  authority: z.string().min(1, "Bestuursorgaan is verplicht"),
  subject: z.string().min(1, "Onderwerp is verplicht"),
  extractedData: z.record(z.any()).nullable().optional(),
  documentList: z.array(z.record(z.any())).optional(),
  location: z.string().nullable().optional(),
});

export const simpleGenerateSchema = z.object({
  authority: z.string().min(1, "Bestuursorgaan is verplicht"),
  subject: z.string().min(1, "Onderwerp is verplicht"),
  context: z.string().nullable().optional(),
  requestedDocuments: z.string().nullable().optional(),
});

export const saveDossierSchema = z.object({
  authority: z.string().min(1),
  subject: z.string().min(1),
  context: z.string().nullable().optional(),
  requestedDocuments: z.string().nullable().optional(),
  generatedLetter: z.string().min(1),
  checklist: z.string().nullable().optional(),
  status: z.string().optional().default("draft"),
});

export type IntakeInput = z.infer<typeof intakeSchema>;
export type ExtractInput = z.infer<typeof extractSchema>;
export type QuestionsInput = z.infer<typeof questionsSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;
export type SimpleGenerateInput = z.infer<typeof simpleGenerateSchema>;
export type SaveDossierInput = z.infer<typeof saveDossierSchema>;
