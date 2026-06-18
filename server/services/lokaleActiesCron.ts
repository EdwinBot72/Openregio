import cron from "node-cron";
import { storage } from "../storage";

const HARD_DELETE_AFTER_DAYS = 1;
const RING_BUFFER_MAX = 50;

export type CleanupLogEntry = {
  timestamp: string;
  markedVerlopen: number;
  deletedOld: number;
  triggeredBy: "cron" | "manual";
};

const cleanupLog: CleanupLogEntry[] = [];

export function getCleanupLog(): CleanupLogEntry[] {
  return [...cleanupLog].reverse();
}

function appendLog(entry: CleanupLogEntry) {
  cleanupLog.push(entry);
  if (cleanupLog.length > RING_BUFFER_MAX) {
    cleanupLog.splice(0, cleanupLog.length - RING_BUFFER_MAX);
  }
}

export async function runLokaleActiesCleanup(
  triggeredBy: "cron" | "manual" = "cron",
): Promise<{ markedVerlopen: number; deletedOld: number }> {
  console.log("[LokaleActiesCron] Opschoning gestart");
  try {
    const result = await storage.cleanupExpiredLokaleActies({ hardDeleteAfterDays: HARD_DELETE_AFTER_DAYS });
    console.log(
      `[LokaleActiesCron] Opschoning klaar — ${result.markedVerlopen} acties op 'verlopen' gezet, ${result.deletedOld} oude acties (>${HARD_DELETE_AFTER_DAYS} dgn) definitief verwijderd`,
    );
    appendLog({
      timestamp: new Date().toISOString(),
      markedVerlopen: result.markedVerlopen,
      deletedOld: result.deletedOld,
      triggeredBy,
    });
    return result;
  } catch (err) {
    console.error("[LokaleActiesCron] Fout bij opschoning:", (err as Error).message);
    appendLog({
      timestamp: new Date().toISOString(),
      markedVerlopen: 0,
      deletedOld: 0,
      triggeredBy,
    });
    return { markedVerlopen: 0, deletedOld: 0 };
  }
}

export function startLokaleActiesCron() {
  cron.schedule(
    "15 3 * * *",
    async () => {
      try {
        await runLokaleActiesCleanup("cron");
      } catch (err) {
        console.error("[LokaleActiesCron] Onverwachte fout:", err);
      }
    },
    { timezone: "Europe/Amsterdam" },
  );
  console.log("[LokaleActiesCron] Dagelijkse cron-taak geregistreerd (03:15 AMS)");

  setImmediate(async () => {
    try {
      await runLokaleActiesCleanup("cron");
    } catch (err) {
      console.error("[LokaleActiesCron] Opstart-opschoning fout:", (err as Error).message);
    }
  });
}
