import cron from "node-cron";
import { storage } from "../storage";
import { sendLedenUpdatesDigestEmail } from "./emailService";

const LOOKBACK_DAYS = 7;
const MIN_DAYS_BETWEEN_DIGESTS = 6;
const MAX_ITEMS_PER_MAIL = 10;

export async function runLedenUpdatesDigest(): Promise<{
  scanned: number;
  sent: number;
  skippedOptOut: number;
  skippedNoEmail: number;
  skippedAlreadySent: number;
  skippedNoContent: number;
  failed: number;
}> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  console.log(`[LedenUpdatesCron] Wekelijkse digest-ronde gestart — leden-blogs sinds ${since.toISOString()}`);

  const stats = {
    scanned: 0,
    sent: 0,
    skippedOptOut: 0,
    skippedNoEmail: 0,
    skippedAlreadySent: 0,
    skippedNoContent: 0,
    failed: 0,
  };

  // Haal alle gepubliceerde leden-blogs van de afgelopen 7 dagen op
  const alleLedenBlogs = await storage.getPublishedBlogs(undefined, "leden");
  const nieuweBlogs = alleLedenBlogs.filter((b) => {
    const pubDate = b.publishedAt ? new Date(b.publishedAt) : new Date(b.createdAt);
    return pubDate >= since;
  });

  if (nieuweBlogs.length === 0) {
    console.log("[LedenUpdatesCron] Geen nieuwe leden-blogs in de afgelopen 7 dagen — niets te versturen");
    return stats;
  }

  console.log(`[LedenUpdatesCron] ${nieuweBlogs.length} nieuwe leden-blog(s) gevonden`);

  // Bouw de items-lijst voor de mail (gesorteerd: nieuwste eerst)
  nieuweBlogs.sort((a, b) => {
    const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
    const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
    return bd - ad;
  });

  const mailItems = nieuweBlogs.slice(0, MAX_ITEMS_PER_MAIL).map((b) => ({
    title: b.title,
    excerpt: b.excerpt ?? null,
    slug: b.slug,
    publishedAt: b.publishedAt ?? b.createdAt,
  }));

  const alleUsers = await storage.getAllUsers();
  const cutoff = new Date(Date.now() - MIN_DAYS_BETWEEN_DIGESTS * 24 * 60 * 60 * 1000);

  for (const user of alleUsers) {
    stats.scanned++;

    if (user.deletedAt) continue;

    if (!user.email) {
      stats.skippedNoEmail++;
      continue;
    }

    if (user.emailNewsDigest === false) {
      stats.skippedOptOut++;
      continue;
    }

    // Idempotentie: sla over als de digest al recent is verstuurd
    if (user.lastDigestSentAt && new Date(user.lastDigestSentAt) > cutoff) {
      stats.skippedAlreadySent++;
      continue;
    }

    try {
      const ok = await sendLedenUpdatesDigestEmail(
        user.email,
        user.firstName ?? "",
        mailItems,
      );

      if (ok) {
        stats.sent++;
        // Markeer als verstuurd zodat we niet dubbel sturen
        await storage.updateUser(user.id, { lastDigestSentAt: new Date() });
      } else {
        stats.failed++;
        console.warn(`[LedenUpdatesCron] Mail naar ${user.email} geretourneerd false (Postmark niet beschikbaar?)`);
      }
    } catch (err) {
      stats.failed++;
      console.error(
        `[LedenUpdatesCron] Mail naar ${user.email} mislukt:`,
        (err as Error).message,
      );
    }
  }

  console.log(
    `[LedenUpdatesCron] Klaar — ${stats.sent} verstuurd, ${stats.skippedOptOut} opt-out, ` +
    `${stats.skippedAlreadySent} al recent verstuurd, ${stats.skippedNoContent} geen content, ` +
    `${stats.skippedNoEmail} zonder e-mail, ${stats.failed} mislukt`,
  );
  return stats;
}

export function startLedenUpdatesCron() {
  // Elke maandagochtend 08:00 NL-tijd (één uur na lokale-acties-notificaties op 07:00)
  cron.schedule(
    "0 8 * * 1",
    async () => {
      try {
        await runLedenUpdatesDigest();
      } catch (err) {
        console.error("[LedenUpdatesCron] Onverwachte fout:", err);
      }
    },
    { timezone: "Europe/Amsterdam" },
  );
  console.log("[LedenUpdatesCron] Wekelijkse digest-cron geregistreerd (maandag 08:00 AMS)");
}
