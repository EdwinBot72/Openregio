import bcrypt from "bcrypt";
import { storage } from "./storage";

const SALT_ROUNDS = 10;

export async function seedMasterAccount() {
  try {
    // Check if master account already exists
    const existingMaster = await storage.getUserByEmail("edwin@stroombox.nl");
    
    if (existingMaster) {
      if (existingMaster.plan !== "pro" || existingMaster.role !== "master") {
        await storage.updateUser(existingMaster.id, { plan: "pro", role: "master" });
        console.log("✓ Master account updated to pro/master:", existingMaster.email);
      } else {
        console.log("✓ Master account already exists:", existingMaster.email);
      }
      return;
    }
    
    // Create master account
    const passwordHash = await bcrypt.hash("Konijn01!?!", SALT_ROUNDS);
    
    const masterUser = await storage.createUser({
      email: "edwin@stroombox.nl",
      passwordHash,
      plan: "pro",
      role: "master",
      firstName: "Edwin",
      lastName: "Stroombox",
    });
    
    console.log("✓ Master account created:", masterUser.email, "with role:", masterUser.role);
  } catch (error) {
    // Seed failure is non-fatal: app can still serve requests without master account
    console.error("[Seed] Master account seed failed (non-fatal):", (error as Error).message || error);
  }
}
