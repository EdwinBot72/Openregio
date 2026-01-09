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
  selectedQuestions: z.array(z.object({
    category: z.string(),
    documents: z.array(z.string()),
  })).optional().default([]),
  location: z.string().nullable().optional(),
  senderName: z.string().nullable().optional(),
  senderAddress: z.string().nullable().optional(),
  senderEmail: z.string().nullable().optional(),
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

export const extractOutputSchema = z.object({
  zaaknummer: z.string().describe("Zaaknummer of kenmerk van het besluit"),
  datum: z.string().describe("Datum van het besluit"),
  boete: z.string().nullable().describe("Opgelegde boete of sanctie, indien van toepassing"),
  locatie: z.string().nullable().describe("Locatie of adres waar het besluit betrekking op heeft"),
  bestuursorgaan: z.string().describe("Het bestuursorgaan dat het besluit heeft genomen"),
  onderwerp: z.string().describe("Korte omschrijving van het onderwerp"),
  themas: z.array(z.string()).describe("Relevante beleidsthema's (bijv. omgeving, vergunning, handhaving)"),
  kernfeiten: z.array(z.string()).describe("De belangrijkste feiten uit het besluit"),
  beleidsconflictHypothese: z.string().nullable().describe("Mogelijke beleidsconflicten of onduidelijkheden die nader onderzoek vereisen"),
});

export const generateOutputSchema = z.object({
  wooVerzoek: z.object({
    briefhoofd: z.string().describe("Volledige briefhoofd met datum, adressen"),
    onderwerpregel: z.string().describe("Formele onderwerpregel"),
    inhoud: z.string().describe("Volledige brieftekst met verwijzing naar Woo"),
    afsluiting: z.string().describe("Afsluitende formule met naam"),
  }).describe("Het complete WOO-verzoek"),
  inventarislijst: z.array(z.object({
    categorie: z.string().describe("Documentcategorie"),
    documenten: z.array(z.string()).describe("Specifieke documenten"),
    toelichting: z.string().nullable().describe("Waarom deze documenten relevant zijn"),
  })).describe("Gedetailleerde inventarislijst van gevraagde documenten"),
  ingebrekestelling: z.object({
    inhoud: z.string().describe("Template voor ingebrekestelling bij overschrijding termijn"),
  }).describe("Follow-up brief bij te late reactie"),
  bezwaarschrift: z.object({
    inhoud: z.string().describe("Template voor bezwaar bij (gedeeltelijke) afwijzing"),
  }).describe("Follow-up brief bij afwijzing"),
  checklist: z.array(z.string()).describe("Actiepunten voor de indiener"),
  metadata: z.object({
    gegenereerd: z.string().describe("Tijdstip van generatie"),
    termijn: z.string().describe("Wettelijke reactietermijn"),
    deadlineDatum: z.string().describe("Berekende deadline voor reactie"),
  }),
});

export const questionsOutputSchema = z.object({
  suggestedQuestions: z.array(z.object({
    category: z.string().describe("Documentcategorie"),
    documents: z.array(z.string()).describe("Specifieke documenten om op te vragen"),
    priority: z.enum(["hoog", "middel", "laag"]).describe("Prioriteit van deze categorie"),
    rationale: z.string().describe("Waarom deze documenten relevant zijn"),
  })).describe("Voorgestelde documentcategorieën met toelichting"),
  aanvullendeVragen: z.array(z.string()).describe("Suggesties voor aanvullende vragen aan de gebruiker"),
});

export type IntakeInput = z.infer<typeof intakeSchema>;
export type ExtractInput = z.infer<typeof extractSchema>;
export type QuestionsInput = z.infer<typeof questionsSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;
export type SimpleGenerateInput = z.infer<typeof simpleGenerateSchema>;
export type SaveDossierInput = z.infer<typeof saveDossierSchema>;

export type ExtractOutput = z.infer<typeof extractOutputSchema>;
export type GenerateOutput = z.infer<typeof generateOutputSchema>;
export type QuestionsOutput = z.infer<typeof questionsOutputSchema>;

export function zodToJsonSchema(schema: z.ZodObject<any>): Record<string, unknown> {
  const shape = schema.shape;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    const zodValue = value as z.ZodTypeAny;
    properties[key] = zodFieldToJsonSchema(zodValue);
    
    if (!zodValue.isOptional() && !zodValue.isNullable()) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

function zodFieldToJsonSchema(field: z.ZodTypeAny): Record<string, unknown> {
  const description = field._def.description;
  
  if (field instanceof z.ZodString) {
    return { type: "string", ...(description && { description }) };
  }
  if (field instanceof z.ZodNumber) {
    return { type: "number", ...(description && { description }) };
  }
  if (field instanceof z.ZodBoolean) {
    return { type: "boolean", ...(description && { description }) };
  }
  if (field instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodFieldToJsonSchema(field._def.type),
      ...(description && { description }),
    };
  }
  if (field instanceof z.ZodObject) {
    return {
      ...zodToJsonSchema(field),
      ...(description && { description }),
    };
  }
  if (field instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: field._def.values,
      ...(description && { description }),
    };
  }
  if (field instanceof z.ZodNullable) {
    const inner = zodFieldToJsonSchema(field._def.innerType);
    return { ...inner, nullable: true };
  }
  if (field instanceof z.ZodOptional) {
    return zodFieldToJsonSchema(field._def.innerType);
  }
  
  return { type: "string", ...(description && { description }) };
}
