import { apiRequest } from "@/lib/queryClient";

export interface WooDossier {
  id: number;
  userId: string;
  authority: string;
  subject: string;
  context?: string | null;
  requestedDocuments?: string | null;
  generatedLetter?: string | null;
  checklist?: string | null;
  status: string;
  uploadedDocument?: string | null;
  extractedData?: Record<string, unknown> | null;
  documentList?: Array<{ category: string; documents: string[] }> | null;
  location?: string | null;
  purpose?: string | null;
  userQuestion?: string | null;
  deadline?: string | null;
  createdAt: string;
}

export interface ExtractedData {
  datum?: string;
  zaaknummer?: string;
  onderwerp?: string;
  afdeling?: string;
  kernfeiten?: string[];
  beleidsbotsing?: string;
}

export interface DocumentCategory {
  category: string;
  documents: string[];
}

export interface Authority {
  id: number;
  name: string;
  slug: string;
}

export async function fetchAuthorities(): Promise<Authority[]> {
  const res = await fetch("/api/woo/authorities");
  if (!res.ok) throw new Error("Kon bestuursorganen niet ophalen");
  return res.json();
}

export async function createIntake(data: {
  authority: string;
  subject: string;
  uploadedDocument?: string | null;
  location?: string | null;
  purpose?: string | null;
  userQuestion?: string | null;
}): Promise<WooDossier> {
  const res = await apiRequest("POST", "/api/woo/wizard/intake", data);
  return res.json();
}

export async function extractDocument(data: {
  dossierId: number;
  documentText: string;
}): Promise<{ success: boolean; extractedData: ExtractedData }> {
  const res = await apiRequest("POST", "/api/woo/wizard/extract", data);
  return res.json();
}

export async function generateQuestions(data: {
  dossierId: number;
  extractedData?: ExtractedData | null;
  purpose?: string | null;
  userQuestion?: string | null;
}): Promise<{ success: boolean; documentList: DocumentCategory[] }> {
  const res = await apiRequest("POST", "/api/woo/wizard/questions", data);
  return res.json();
}

export async function generateLetter(data: {
  dossierId: number;
  authority: string;
  subject: string;
  extractedData?: ExtractedData | null;
  documentList?: DocumentCategory[];
  location?: string | null;
}): Promise<{
  success: boolean;
  letter: string;
  checklist: string[];
  metadata: { authority: string; subject: string; generatedAt: string };
}> {
  const res = await apiRequest("POST", "/api/woo/wizard/generate", data);
  return res.json();
}

export async function getDossiers(): Promise<WooDossier[]> {
  const res = await fetch("/api/woo/dossiers", { credentials: "include" });
  if (!res.ok) throw new Error("Kon dossiers niet ophalen");
  return res.json();
}

export async function getDossier(id: number): Promise<WooDossier> {
  const res = await fetch(`/api/woo/dossiers/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Dossier niet gevonden");
  return res.json();
}

export async function updateDossier(
  id: number,
  updates: Partial<WooDossier>
): Promise<WooDossier> {
  const res = await apiRequest("PATCH", `/api/woo/dossiers/${id}`, updates);
  return res.json();
}
