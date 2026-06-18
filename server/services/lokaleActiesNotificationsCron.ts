import cron from "node-cron";
import { storage } from "../storage";
import { sendLokaleActiesDigestEmail } from "./emailService";

const LOOKBACK_DAYS = 7;
const MAX_ITEMS_PER_MAIL = 10;
const RING_BUFFER_MAX = 20;

function normalizeRegio(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export type NotificationLogEntry = {
  timestamp: string;
  triggeredBy: "cron" | "manual";
  scanned: number;
  sent: number;
  skippedNoMatch: number;
  skippedOptOut: number;
  skippedNoRegion: number;
  skippedNoEmail: number;
  failed: number;
};

const notificationLog: NotificationLogEntry[] = [];

export function getNotificationLog(): NotificationLogEntry[] {
  return [...notificationLog].reverse();
}

function appendLog(entry: NotificationLogEntry) {
  notificationLog.push(entry);
  if (notificationLog.length > RING_BUFFER_MAX) {
    notificationLog.splice(0, notificationLog.length - RING_BUFFER_MAX);
  }
}

export async function runLokaleActiesNotifications(
  triggeredBy: "cron" | "manual" = "cron",
): Promise<{
  scanned: number;
  sent: number;
  skippedNoMatch: number;
  skippedOptOut: number;
  skippedNoRegion: number;
  skippedNoEmail: number;
  failed: number;
}> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  console.log(`[LokaleActiesNotify] Wekelijkse notificatie-ronde gestart (${triggeredBy}) — sinds ${since.toISOString()}`);

  const stats = {
    scanned: 0,
    sent: 0,
    skippedNoMatch: 0,
    skippedOptOut: 0,
    skippedNoRegion: 0,
    skippedNoEmail: 0,
    failed: 0,
  };

  // Haal in één keer alle nieuwe acties van afgelopen 7 dagen op (alle regio's)
  const recenteActies = await storage.getLokaleActies({ createdSince: since });
  if (recenteActies.length === 0) {
    console.log("[LokaleActiesNotify] Geen nieuwe acties in de afgelopen 7 dagen — niets te versturen");
    appendLog({ timestamp: new Date().toISOString(), triggeredBy, ...stats });
    return stats;
  }

  // Groepeer per genormaliseerde regio voor snelle matching
  const actiesPerRegio = new Map<string, typeof recenteActies>();
  for (const actie of recenteActies) {
    const key = normalizeRegio(actie.regio);
    if (!key) continue;
    const bestaand = actiesPerRegio.get(key) ?? [];
    bestaand.push(actie);
    actiesPerRegio.set(key, bestaand);
  }

  const alleUsers = await storage.getAllUsers();
  for (const user of alleUsers) {
    stats.scanned++;

    if (user.deletedAt) continue;
    if (!user.email) {
      stats.skippedNoEmail++;
      continue;
    }
    if (!user.region) {
      stats.skippedNoRegion++;
      continue;
    }
    if (user.emailLokaleActiesDigest === false) {
      stats.skippedOptOut++;
      continue;
    }

    const userRegio = normalizeRegio(user.region);
    // Match op gelijke of substring-overlap (gemeente in regio of regio in gemeente)
    const matchingActies: typeof recenteActies = [];
    for (const [regioKey, acties] of actiesPerRegio.entries()) {
      if (regioKey === userRegio || regioKey.includes(userRegio) || userRegio.includes(regioKey)) {
        // Filter eigen acties uit (geen mail over je eigen post)
        for (const actie of acties) {
          if (actie.ownerUserId !== user.id) matchingActies.push(actie);
        }
      }
    }

    if (matchingActies.length === 0) {
      stats.skippedNoMatch++;
      continue;
    }

    // Sorteer op datum (eerstvolgend eerst, dan op createdAt desc)
    matchingActies.sort((a, b) => {
      const ad = a.datum ? new Date(a.datum).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.datum ? new Date(b.datum).getTime() : Number.POSITIVE_INFINITY;
      if (ad !== bd) return ad - bd;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const items = matchingActies.slice(0, MAX_ITEMS_PER_MAIL).map((a) => ({
      id: a.id,
      titel: a.titel,
      beschrijving: a.beschrijving,
      locatie: a.locatie,
      regio: a.regio,
      datum: a.datum,
      doelgroep: a.doelgroep,
    }));

    try {
      const ok = await sendLokaleActiesDigestEmail(
        user.email,
        user.firstName ?? "",
        user.region,
        items,
      );
      if (ok) {
        stats.sent++;
      } else {
        stats.failed++;
      }
    } catch (err) {
      stats.failed++;
      console.error(
        `[LokaleActiesNotify] Mail naar ${user.email} mislukt:`,
        (err as Error).message,
      );
    }
  }

  console.log(
    `[LokaleActiesNotify] Klaar — ${stats.sent} verstuurd, ${stats.skippedNoMatch} zonder match, ${stats.skippedOptOut} opt-out, ${stats.skippedNoRegion} zonder regio, ${stats.failed} mislukt`,
  );
  appendLog({ timestamp: new Date().toISOString(), triggeredBy, ...stats });
  return stats;
}

export function startLokaleActiesNotificationsCron() {
  // Elke maandagochtend 07:00 NL-tijd
  cron.schedule(
    "0 7 * * 1",
    async () => {
      try {
        await runLokaleActiesNotifications("cron");
      } catch (err) {
        console.error("[LokaleActiesNotify] Onverwachte fout:", err);
      }
    },
    { timezone: "Europe/Amsterdam" },
  );
  console.log("[LokaleActiesNotify] Wekelijkse cron-taak geregistreerd (maandag 07:00 AMS)");
}
