// PDF's van de briefcontrole en van de uitleg (Brievenagent/Contractagent).
// Echte tekst (doorzoekbaar, kopieerbaar), in de huisstijl — zelfde aanpak als regioscan-pdf.ts.
// jsPDF en het lettertype worden pas geladen als iemand op "Download als PDF" klikt.
import type { jsPDF as JsPDF } from "jspdf";

type RGB = [number, number, number];
const NAVY: RGB = [11, 34, 64];
const TEKST: RGB = [51, 65, 85];
const GRIJS: RGB = [100, 116, 139];
const LIJN: RGB = [226, 232, 240];
const GROEN: RGB = [31, 107, 69];
const BLAUW: RGB = [29, 74, 143];
const ORANJE: RGB = [138, 83, 0];

const MARGE = 16;
const PAGINA_B = 210;
const PAGINA_H = 297;
const BREEDTE = PAGINA_B - MARGE * 2;
const ONDER = PAGINA_H - MARGE - 6;
const FONT = "PlusJakartaSans";

const schoon = (t: string) =>
  String(t ?? "")
    .replace(/‘|’/g, "'")
    .replace(/“|”|„/g, '"')
    .replace(/…/g, "...")
    .replace(/ /g, " ");

/** Eenvoudige schrijver: houdt de y-positie bij, breekt regels af en begint zo nodig een nieuwe pagina. */
class Schrijver {
  y = MARGE;
  constructor(public doc: JsPDF, private voettekst: string) {}

  private ruimte(h: number) {
    if (this.y + h > ONDER) { this.doc.addPage(); this.y = MARGE; }
  }

  nieuwePagina() { this.doc.addPage(); this.y = MARGE; }

  tekst(t: string, o: { grootte?: number; vet?: boolean; kleur?: RGB; inspring?: number; na?: number; regel?: number } = {}) {
    const { grootte = 10, vet = false, kleur = TEKST, inspring = 0, na = 2, regel = 1.4 } = o;
    this.doc.setFont(FONT, vet ? "bold" : "normal");
    this.doc.setFontSize(grootte);
    this.doc.setTextColor(...kleur);
    const hoogte = (grootte * 0.3528) * regel;
    for (const r of this.doc.splitTextToSize(schoon(t), BREEDTE - inspring) as string[]) {
      this.ruimte(hoogte);
      this.doc.text(r, MARGE + inspring, this.y + hoogte * 0.75);
      this.y += hoogte;
    }
    this.y += na;
  }

  kop(t: string) { this.ruimte(14); this.y += 2; this.tekst(t, { grootte: 13, vet: true, kleur: NAVY, na: 1.5 }); }
  subkop(t: string) { this.ruimte(9); this.tekst(t, { grootte: 10.5, vet: true, kleur: NAVY, na: 1 }); }
  klein(t: string, kleur: RGB = GRIJS) { this.tekst(t, { grootte: 8.5, kleur, na: 1.5 }); }
  opsom(t: string, inspring = 0) { this.tekst(`-  ${t}`, { inspring: inspring + 2, na: 1 }); }

  /** Blok met een gekleurde streep links (citaat of punt met label). */
  streep(kleur: RGB, vul: () => void) {
    const start = this.y;
    const pagina = this.doc.getNumberOfPages();
    vul();
    if (this.doc.getNumberOfPages() === pagina) {
      this.doc.setDrawColor(...kleur);
      this.doc.setLineWidth(0.8);
      this.doc.line(MARGE, start, MARGE, this.y - 1);
    }
    this.y += 1.5;
  }

  lijn() {
    this.ruimte(4);
    this.doc.setDrawColor(...LIJN);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGE, this.y, PAGINA_B - MARGE, this.y);
    this.y += 4;
  }

  voetteksten() {
    const n = this.doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      this.doc.setPage(i);
      this.doc.setFont(FONT, "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...GRIJS);
      this.doc.text(schoon(this.voettekst), MARGE, PAGINA_H - 8);
      this.doc.text(`pagina ${i} van ${n}`, PAGINA_B - MARGE, PAGINA_H - 8, { align: "right" });
    }
  }
}

async function nieuwDocument(voettekst: string): Promise<Schrijver> {
  const [{ jsPDF }, fonts] = await Promise.all([import("jspdf"), import("./fonts/plus-jakarta-sans")]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("PlusJakartaSans-Regular.ttf", fonts.plusJakartaSansRegularBase64);
  doc.addFont("PlusJakartaSans-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("PlusJakartaSans-Bold.ttf", fonts.plusJakartaSansBoldBase64);
  doc.addFont("PlusJakartaSans-Bold.ttf", FONT, "bold");
  return new Schrijver(doc, voettekst);
}

const vandaag = () => new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
const bestandsnaam = (basis: string, extra?: string) =>
  `${basis}${extra ? "-" + extra.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) : ""}-${new Date().toISOString().slice(0, 10)}.pdf`;

// ── Briefcontrole ───────────────────────────────────────────
type Label = "vaststaand" | "interpretatie" | "te_controleren";
const LABEL: Record<Label, { tekst: string; kleur: RGB }> = {
  vaststaand: { tekst: "Vaststaand — uit je brief", kleur: GROEN },
  interpretatie: { tekst: "Juridische duiding", kleur: BLAUW },
  te_controleren: { tekst: "Nog te controleren", kleur: ORANJE },
};

export interface RapportVoorPdf {
  kop: { afzender?: string; kenmerk?: string; datum?: string; documenttype: string };
  secties: { titel: string; uitleg?: string; punten: { tekst: string; label: Label; bron?: string; wet?: string; term?: string; controleer?: string; ermee?: string }[] }[];
  conceptbrieven: { titel: string; tekst: string }[];
  omvang?: { tekens: number; ingekort: boolean };
}

export async function downloadRapportPdf(r: RapportVoorPdf, opts: { metWet: boolean }) {
  const s = await nieuwDocument(`OpenRegio - briefcontrole - ${vandaag()}`);
  s.klein("OPENREGIO - BRIEFCONTROLE");
  s.tekst("Wie legt je dit op - en mag dat?", { grootte: 18, vet: true, kleur: NAVY, na: 3 });
  s.tekst(`Soort: ${r.kop.documenttype}`, { na: 0.5 });
  if (r.kop.afzender) s.tekst(`Afzender: ${r.kop.afzender}`, { na: 0.5 });
  if (r.kop.kenmerk) s.tekst(`Kenmerk: ${r.kop.kenmerk}`, { na: 0.5 });
  if (r.kop.datum) s.tekst(`Datum brief: ${r.kop.datum}`, { na: 0.5 });
  s.tekst(`Opgesteld: ${vandaag()}`, { na: 3 });
  s.klein("Labels: Vaststaand = letterlijk uit je brief · Juridische duiding = algemene uitleg · Nog te controleren = zelf nagaan.");
  s.lijn();

  for (const sectie of r.secties) {
    s.kop(sectie.titel);
    if (sectie.uitleg) s.klein(sectie.uitleg);
    for (const p of sectie.punten) {
      if (p.term) {
        s.streep(NAVY, () => {
          s.tekst(p.term!, { vet: true, kleur: NAVY, inspring: 3, na: 0.5 });
          if (p.bron) s.tekst(`In je brief: ${p.bron}`, { grootte: 9, kleur: GROEN, inspring: 3, na: 1 });
          s.tekst(`Wat betekent dit: ${p.tekst}`, { inspring: 3, na: 0.8 });
          if (p.controleer) s.tekst(`Wat controleer je: ${p.controleer}`, { inspring: 3, na: 0.8 });
          if (p.ermee) s.tekst(`Wat kun je ermee: ${p.ermee}`, { inspring: 3, na: 0.8 });
          if (opts.metWet && p.wet) s.tekst(`Wet: ${p.wet}`, { grootte: 8.5, kleur: GRIJS, inspring: 3, na: 0.5 });
        });
      } else {
        const l = LABEL[p.label];
        s.streep(l.kleur, () => {
          s.tekst(l.tekst.toUpperCase(), { grootte: 7.5, vet: true, kleur: l.kleur, inspring: 3, na: 0.3 });
          s.tekst(p.tekst, { inspring: 3, na: 0.5 });
          if (p.bron) s.tekst(`In je brief: ${p.bron}`, { grootte: 8.5, kleur: GRIJS, inspring: 3, na: 0.5 });
          if (opts.metWet && p.wet) s.tekst(`Wet: ${p.wet}`, { grootte: 8.5, kleur: GRIJS, inspring: 3, na: 0.5 });
        });
      }
    }
  }

  s.lijn();
  s.klein("Controleer dit zelf. Dit overzicht is een hulpmiddel en geen juridisch advies. OpenRegio gaat er niet van uit dat een besluit ongeldig is - en ook niet dat de instantie altijd gelijk heeft. Bij een groot belang: raadpleeg een jurist of het Juridisch Loket.", ORANJE);

  for (const b of r.conceptbrieven) {
    s.nieuwePagina();
    s.klein("JE REACTIE - CONTROLE VAN DE OPMAAK");
    s.tekst(b.titel, { grootte: 14, vet: true, kleur: NAVY, na: 2 });
    s.klein("Vul de tekst tussen [haken] in, print, zet je paraaf. Bewaar het origineel zelf en breng een kopie weg (of verstuur aangetekend); vraag om een ontvangstbevestiging op je eigen exemplaar. Termijnen in de brief lopen intussen door.");
    s.lijn();
    for (const regel of b.tekst.split("\n")) s.tekst(regel || " ", { grootte: 10.5, na: regel ? 0.3 : 1.5 });
  }

  s.voetteksten();
  s.doc.save(bestandsnaam("openregio-briefcontrole", r.kop.afzender));
}

// ── Uitleg (Brievenagent / Contractagent) ───────────────────
export interface UitlegVoorPdf {
  soort: "brief" | "contract";
  kop: { onderwerp?: string; afzender?: string; datum?: string; kenmerk?: string };
  soortBrief?: string;
  partijen: string[];
  gewoneTaal: string[];
  juridisch: string[];
  watMoetJe: string[];
  verplichtingen: { partij: string; moet: string[] }[];
  termijnen: string[];
  bedragen: string[];
  begrippen: { term: string; citaat: string; betekenis: string; controleer: string; ermee: string; wet?: string; letOp?: boolean }[];
}

export async function downloadUitlegPdf(u: UitlegVoorPdf, opts: { metWet: boolean }) {
  const naam = u.soort === "contract" ? "Contractagent" : "Brievenagent";
  const s = await nieuwDocument(`OpenRegio - ${naam.toLowerCase()} - ${vandaag()}`);
  s.klein(`OPENREGIO - ${naam.toUpperCase()}`);
  s.tekst(u.kop.onderwerp || (u.soort === "contract" ? "Uitleg van je contract" : "Uitleg van je brief"), { grootte: 18, vet: true, kleur: NAVY, na: 3 });
  if (u.soortBrief) s.tekst(`Soort brief: ${u.soortBrief}`, { na: 0.5 });
  if (u.kop.afzender) s.tekst(`Afzender: ${u.kop.afzender}`, { na: 0.5 });
  if (u.kop.datum) s.tekst(`Datum: ${u.kop.datum}`, { na: 0.5 });
  if (u.kop.kenmerk) s.tekst(`Kenmerk: ${u.kop.kenmerk}`, { na: 0.5 });
  s.tekst(`Opgesteld: ${vandaag()}`, { na: 3 });
  s.lijn();

  const lijst = (titel: string, items: string[], uitleg?: string) => {
    if (!items.length) return;
    s.kop(titel);
    if (uitleg) s.klein(uitleg);
    for (const t of items) s.opsom(t);
  };
  lijst("Partijen", u.partijen);
  lijst("In gewone taal", u.gewoneTaal, "Automatisch gemaakte uitleg op basis van je tekst - controleer die zelf.");
  lijst("Juridisch uitgelegd", u.juridisch, "Algemene uitleg, geen advies over jouw situatie.");
  lijst("Wat wordt er van je gevraagd?", u.watMoetJe);
  if (u.verplichtingen.length) {
    s.kop("Wie moet wat doen?");
    for (const v of u.verplichtingen) { s.subkop(v.partij); for (const m of v.moet) s.opsom(m); }
  }
  const citaten = (titel: string, items: string[]) => {
    if (!items.length) return;
    s.kop(titel);
    s.klein("Letterlijk uit je tekst.");
    for (const t of items) s.streep(GROEN, () => s.tekst(`"${t}"`, { grootte: 9.5, kleur: GROEN, inspring: 3, na: 0.5 }));
  };
  citaten("Termijnen", u.termijnen);
  citaten("Bedragen", u.bedragen);

  if (u.begrippen.length) {
    s.kop("Juridische begrippen uitgelegd");
    for (const b of u.begrippen) {
      s.streep(b.letOp ? ORANJE : NAVY, () => {
        s.tekst(`${b.term}${b.letOp ? "  (let op)" : ""}`, { vet: true, kleur: b.letOp ? ORANJE : NAVY, inspring: 3, na: 0.5 });
        s.tekst(`In je tekst: "${b.citaat}"`, { grootte: 9, kleur: GROEN, inspring: 3, na: 1 });
        s.tekst(`Wat betekent dit: ${b.betekenis}`, { inspring: 3, na: 0.8 });
        s.tekst(`Wat controleer je: ${b.controleer}`, { inspring: 3, na: 0.8 });
        s.tekst(`Wat kun je ermee: ${b.ermee}`, { inspring: 3, na: 0.8 });
        if (opts.metWet && b.wet) s.tekst(`Wet: ${b.wet}`, { grootte: 8.5, kleur: GRIJS, inspring: 3, na: 0.5 });
      });
    }
  }

  s.lijn();
  s.klein("Deze uitleg is automatisch gemaakt en geen juridisch advies. Citaten komen letterlijk uit je tekst; de uitleg eromheen kan fouten bevatten. Bij een groot belang: raadpleeg een jurist of het Juridisch Loket.", ORANJE);
  s.voetteksten();
  s.doc.save(bestandsnaam(`openregio-${u.soort === "contract" ? "contractuitleg" : "brief-uitleg"}`, u.kop.onderwerp));
}
