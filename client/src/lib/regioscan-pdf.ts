import { jsPDF } from "jspdf";
import type { RegioScan, RegioScanResult, RegioScanItem, RegioScanActie } from "@shared/schema";
import { plusJakartaSansRegularBase64, plusJakartaSansBoldBase64 } from "./fonts/plus-jakarta-sans";

const BRAND_DARK: [number, number, number] = [11, 34, 64];
const BRAND_BLUE: [number, number, number] = [31, 95, 174];
const BRAND_ORANGE: [number, number, number] = [242, 138, 26];
const RISK_RED: [number, number, number] = [220, 38, 38];
const OPP_GREEN: [number, number, number] = [22, 163, 74];
const TEXT_DEFAULT: [number, number, number] = [55, 65, 81];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const RULE_GREY: [number, number, number] = [230, 235, 242];

const PRIO_COLORS: Record<string, [number, number, number]> = {
  hoog: [185, 28, 28],
  midden: [194, 65, 12],
  laag: [31, 95, 174],
};

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const PAGE_BOTTOM = PAGE_H - MARGIN - 8;
const FONT = "PlusJakartaSans";

type Ctx = {
  doc: jsPDF;
  y: number;
  pageNum: number;
  scan: RegioScan;
};

function sanitize(text: string): string {
  return (text ?? "")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2022/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ");
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("nl-NL", { day: "2-digit", month: "long", year: "numeric" });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function registerFonts(doc: jsPDF) {
  doc.addFileToVFS("PlusJakartaSans-Regular.ttf", plusJakartaSansRegularBase64);
  doc.addFont("PlusJakartaSans-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("PlusJakartaSans-Bold.ttf", plusJakartaSansBoldBase64);
  doc.addFont("PlusJakartaSans-Bold.ttf", FONT, "bold");
  // Map italic/bolditalic to regular/bold so jsPDF doesn't fall back to helvetica
  doc.addFont("PlusJakartaSans-Regular.ttf", FONT, "italic");
  doc.addFont("PlusJakartaSans-Bold.ttf", FONT, "bolditalic");
}

function addFooter(ctx: Ctx) {
  const { doc, scan, pageNum } = ctx;
  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    sanitize(`OpenRegio · RegioScan · ${scan.branche} · ${scan.gemeente}`),
    MARGIN,
    PAGE_H - 8,
  );
  doc.text(`Pagina ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
}

/** Ensure we have `needed` mm of vertical space; otherwise insert a new page. */
function ensure(ctx: Ctx, needed: number) {
  if (ctx.y + needed > PAGE_BOTTOM) {
    addFooter(ctx);
    ctx.doc.addPage();
    ctx.pageNum += 1;
    ctx.y = MARGIN;
  }
}

/** Draw a single line of text at ctx.y, advancing the cursor by `lh`. */
function drawLine(ctx: Ctx, text: string, x: number, lh: number, baselineOffset = 4) {
  ensure(ctx, lh);
  ctx.doc.text(text, x, ctx.y + baselineOffset);
  ctx.y += lh;
}

/** Draw wrapped text with the current font settings. */
function drawWrapped(ctx: Ctx, text: string, x: number, maxW: number, lh: number) {
  const lines = ctx.doc.splitTextToSize(sanitize(text), maxW);
  for (const line of lines) {
    drawLine(ctx, line, x, lh);
  }
}

export function exportRegioScanPdf(scan: RegioScan): void {
  const result = scan.result as RegioScanResult;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerFonts(doc);
  doc.setFont(FONT, "normal");

  const ctx: Ctx = { doc, y: MARGIN, pageNum: 1, scan };

  // ---------- Hero ----------
  doc.setFillColor(...BRAND_DARK);
  doc.rect(0, 0, PAGE_W, 34, "F");
  doc.setFillColor(...BRAND_ORANGE);
  doc.rect(0, 34, PAGE_W, 1.2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.text("OPENREGIO · REGIOSCAN", MARGIN, 13);

  doc.setFontSize(18);
  doc.text(sanitize(`${scan.branche} · ${scan.gemeente}`), MARGIN, 23);

  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  const datum = formatDate(scan.createdAt);
  if (datum) doc.text(`Uitgevoerd op ${datum}`, MARGIN, 30);

  ctx.y = 44;

  // ---------- Scores ----------
  const scoreBoxW = (CONTENT_W - 6) / 2;
  drawScoreBox(doc, MARGIN, ctx.y, scoreBoxW, "Risicoscore", result.scoreRisico, RISK_RED);
  drawScoreBox(doc, MARGIN + scoreBoxW + 6, ctx.y, scoreBoxW, "Kansenscore", result.scoreKans, OPP_GREEN);
  ctx.y += 28;

  if (result.risicoToelichting) renderMutedParagraph(ctx, "Risico: " + result.risicoToelichting);
  if (result.kansenToelichting) renderMutedParagraph(ctx, "Kansen: " + result.kansenToelichting);
  if (result.risicoToelichting || result.kansenToelichting) ctx.y += 2;

  // ---------- Samenvatting ----------
  if (result.samenvatting) {
    renderSectionHeader(ctx, "Samenvatting", BRAND_BLUE);
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_DEFAULT);
    drawWrapped(ctx, result.samenvatting, MARGIN, CONTENT_W, 5);
    ctx.y += 4;
  }

  // ---------- 6 Uitkomstblokken ----------
  const blokken: Array<{ titel: string; kleur: [number, number, number]; items: RegioScanItem[]; leeg: string }> = [
    { titel: "Lokale besluiten", kleur: BRAND_BLUE, items: result.besluiten, leeg: "Geen specifieke besluiten gevonden." },
    { titel: "Regels & verordeningen", kleur: BRAND_DARK, items: result.regels, leeg: "Geen relevante regels gevonden." },
    { titel: "Kansen", kleur: OPP_GREEN, items: result.kansen, leeg: "Geen kansen aangetroffen." },
    { titel: "Documenten om op te vragen", kleur: BRAND_ORANGE, items: result.documenten, leeg: "Geen documenten voorgesteld." },
    { titel: "Risico's & valkuilen", kleur: RISK_RED, items: result.risicos, leeg: "Geen specifieke risico's geïdentificeerd." },
  ];

  for (const blok of blokken) {
    renderSectionHeader(ctx, `${blok.titel} (${blok.items.length})`, blok.kleur);
    if (blok.items.length === 0) {
      doc.setFont(FONT, "italic");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_MUTED);
      drawLine(ctx, sanitize(blok.leeg), MARGIN, 7);
    } else {
      for (const item of blok.items) renderItem(ctx, item, blok.kleur);
    }
    ctx.y += 2;
  }

  // Acties
  renderSectionHeader(ctx, `Aanbevolen acties (${result.acties.length})`, BRAND_BLUE);
  if (result.acties.length === 0) {
    doc.setFont(FONT, "italic");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    drawLine(ctx, "Geen acties voorgesteld.", MARGIN, 7);
  } else {
    for (const a of result.acties) renderActie(ctx, a);
  }
  ctx.y += 2;

  // ---------- Woo-concept ----------
  if (scan.wooConcept) {
    renderSectionHeader(ctx, "Concept Woo-verzoek", BRAND_ORANGE);
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_DEFAULT);
    drawWrapped(ctx, scan.wooConcept, MARGIN, CONTENT_W, 5);
    ctx.y += 4;
  }

  // Disclaimer
  ensure(ctx, 20);
  doc.setDrawColor(...RULE_GREY);
  doc.line(MARGIN, ctx.y, PAGE_W - MARGIN, ctx.y);
  ctx.y += 5;
  doc.setFont(FONT, "italic");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  drawWrapped(
    ctx,
    "Deze RegioScan combineert AI-analyse met je bedrijfsprofiel. Verifieer wettelijke verwijzingen altijd bij de officiele bron (gemeente, overheid.nl). Dit is geen juridisch advies.",
    MARGIN,
    CONTENT_W,
    4,
  );

  addFooter(ctx);

  const filename = `regioscan-${slugify(scan.branche)}-${slugify(scan.gemeente)}-${scan.id}.pdf`;
  doc.save(filename);
}

function drawScoreBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  label: string,
  value: number,
  color: [number, number, number],
) {
  doc.setDrawColor(...RULE_GREY);
  doc.setFillColor(250, 251, 253);
  doc.roundedRect(x, y, w, 24, 3, 3, "FD");

  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_DARK);
  doc.text(label, x + 4, y + 7);

  doc.setFontSize(20);
  doc.setTextColor(...color);
  doc.text(String(Math.max(0, Math.min(100, value))), x + w - 4, y + 11, { align: "right" });

  const barY = y + 16;
  const barX = x + 4;
  const barW = w - 8;
  doc.setFillColor(238, 242, 247);
  doc.roundedRect(barX, barY, barW, 4, 2, 2, "F");
  const filledW = Math.max(0, Math.min(barW, (barW * value) / 100));
  if (filledW > 0) {
    doc.setFillColor(...color);
    doc.roundedRect(barX, barY, filledW, 4, 2, 2, "F");
  }
}

function renderSectionHeader(ctx: Ctx, text: string, color: [number, number, number]) {
  ensure(ctx, 14);
  const { doc } = ctx;
  doc.setFillColor(...color);
  doc.rect(MARGIN, ctx.y, 2.2, 6, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_DARK);
  doc.text(sanitize(text), MARGIN + 5, ctx.y + 5);
  doc.setDrawColor(...RULE_GREY);
  doc.line(MARGIN, ctx.y + 8, PAGE_W - MARGIN, ctx.y + 8);
  ctx.y += 12;
}

function renderMutedParagraph(ctx: Ctx, text: string) {
  ctx.doc.setFont(FONT, "normal");
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(...TEXT_MUTED);
  drawWrapped(ctx, text, MARGIN, CONTENT_W, 4.5);
  ctx.y += 1;
}

function renderItem(ctx: Ctx, item: RegioScanItem, accent: [number, number, number]) {
  const { doc } = ctx;
  ensure(ctx, 14);
  const startPage = ctx.pageNum;
  const startY = ctx.y;

  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_DARK);
  drawWrapped(ctx, item.titel ?? "", MARGIN + 3, CONTENT_W - 6, 5);

  if (item.toelichting) {
    doc.setFont(FONT, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_DEFAULT);
    drawWrapped(ctx, item.toelichting, MARGIN + 3, CONTENT_W - 6, 4.5);
  }

  const meta: string[] = [];
  if (item.datum && item.datum !== "onbekend") meta.push(`Datum: ${item.datum}`);
  if (item.bron) meta.push(`Bron: ${item.bron}`);
  if (item.teVerifieren !== false) meta.push("Te verifieren");
  if (meta.length) {
    doc.setFont(FONT, "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MUTED);
    drawWrapped(ctx, meta.join("  ·  "), MARGIN + 3, CONTENT_W - 6, 4);
  }

  // Left accent — only on the page where the item started, to avoid mis-aligned strokes
  if (ctx.pageNum === startPage) {
    doc.setFillColor(...accent);
    doc.rect(MARGIN, startY + 1, 1, Math.max(2, ctx.y - startY - 1), "F");
  } else {
    doc.setFillColor(...accent);
    doc.rect(MARGIN, startY + 1, 1, Math.max(2, PAGE_BOTTOM - startY - 1), "F");
  }

  ctx.y += 4;
}

function renderActie(ctx: Ctx, actie: RegioScanActie) {
  const { doc } = ctx;
  ensure(ctx, 14);
  const prioColor = PRIO_COLORS[actie.prio] ?? PRIO_COLORS.midden;

  // Prio pill + first title line on the same row
  const pillLabel = `PRIO ${actie.prio.toUpperCase()}`;
  doc.setFont(FONT, "bold");
  doc.setFontSize(7.5);
  const pillW = doc.getTextWidth(pillLabel) + 4;
  doc.setFillColor(...prioColor);
  doc.roundedRect(MARGIN + 3, ctx.y, pillW, 4.5, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(pillLabel, MARGIN + 5, ctx.y + 3.3);

  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_DARK);
  const titleX = MARGIN + 3 + pillW + 3;
  const titleMaxW = CONTENT_W - (titleX - MARGIN) - 3;
  const titleLines = doc.splitTextToSize(sanitize(actie.titel ?? ""), titleMaxW);
  doc.text(titleLines[0] ?? "", titleX, ctx.y + 3.5);
  ctx.y += 6;

  // Remaining title lines on full width
  if (titleLines.length > 1) {
    for (const line of titleLines.slice(1)) {
      drawLine(ctx, line, MARGIN + 3, 5);
    }
  }

  if (actie.toelichting) {
    doc.setFont(FONT, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_DEFAULT);
    drawWrapped(ctx, actie.toelichting, MARGIN + 3, CONTENT_W - 6, 4.5);
  }

  ctx.y += 4;
}
