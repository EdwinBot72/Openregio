// Een brief doorgeven van "Brief analyseren" naar "Besluit controleren".
// Alleen in het geheugen van dit tabblad — niets wordt opgeslagen.
export interface DoorgegevenBrief { tekst?: string; bestanden?: File[] }

let bewaard: DoorgegevenBrief | null = null;

export function geefBriefDoor(brief: DoorgegevenBrief) { bewaard = brief; }

/** Haalt de doorgegeven brief op (eenmalig). */
export function neemBriefOver(): DoorgegevenBrief | null {
  const b = bewaard;
  bewaard = null;
  return b;
}
