import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function run() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Gebruik: npx tsx scripts/reset-password.ts <email> <nieuw-wachtwoord>");
    process.exit(1);
  }

  const result = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email));
  if (result.length === 0) {
    console.error("Gebruiker niet gevonden:", email);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.email, email));
  console.log("Wachtwoord bijgewerkt voor:", result[0].email);
  process.exit(0);
}

run().catch((e) => { console.error(e.message); process.exit(1); });
