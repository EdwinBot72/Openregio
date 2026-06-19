import { db } from "../server/db";
import { users, onboardingTokens } from "../shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function run() {
  const email = process.argv[2];
  const baseUrl = process.argv[3] || "https://open-regio.replit.app";

  if (!email) {
    console.error("Gebruik: npx tsx scripts/gen-activation-link.ts <email> [baseUrl]");
    process.exit(1);
  }

  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    console.error("Gebruiker niet gevonden:", email);
    process.exit(1);
  }

  const user = result[0];
  console.log("Gevonden:", user.email, "| plan:", user.plan, "| onboarding:", user.mustCompleteOnboarding);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(onboardingTokens).values({ userId: user.id, token, expiresAt });

  console.log("\n=== ACTIVATIELINK (30 dagen geldig) ===");
  console.log(`${baseUrl}/first-login?token=${token}`);
}

run().catch((e) => { console.error(e.message); process.exit(1); });
