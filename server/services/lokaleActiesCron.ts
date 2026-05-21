import cron from "node-cron";
import { storage } from "../storage";

const HARD_DELETE_AFTER_DAYS = 180;

export async function runLokaleActiesCleanup(): Promise<{ markedVerlopen: number; deletedOld: number }> {
  console.log("[LokaleActiesCron] Opschoning gestart");
  try {
    const result = await storage.cleanupExpiredLokaleActies({ hardDeleteAfterDays: HARD_DELETE_AFTER_DAYS });
    console.log(
      `[LokaleActiesCron] Opschoning klaar — ${result.markedVerlopen} acties op 'verlopen' gezet, ${result.deletedOld} oude acties (>${HARD_DELETE_AFTER_DAYS} dgn) definitief verwijderd`,
    );
    return result;
  } catch (err) {
    console.error("[LokaleActiesCron] Fout bij opschoning:", (err as Error).message);
    return { markedVerlopen: 0, deletedOld: 0 };
  }
}

export function startLokaleActiesCron() {
  cron.schedule(
    "15 3 * * *",
    async () => {
      try {
        await runLokaleActiesCleanup();
      } catch (err) {
        console.error("[LokaleActiesCron] Onverwachte fout:", err);
      }
    },
    { timezone: "Europe/Amsterdam" },
  );
  console.log("[LokaleActiesCron] Dagelijkse cron-taak geregistreerd (03:15 AMS)");

  setImmediate(async () => {
    try {
      await runLokaleActiesCleanup();
    } catch (err) {
      console.error("[LokaleActiesCron] Opstart-opschoning fout:", (err as Error).message);
    }
  });
}
