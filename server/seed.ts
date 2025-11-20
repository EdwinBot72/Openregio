import bcrypt from "bcrypt";
import { storage } from "./storage";

const SALT_ROUNDS = 10;

export async function seedMasterAccount() {
  try {
    // Check if master account already exists
    const existingMaster = await storage.getUserByEmail("edwin@stroombox.nl");
    
    if (existingMaster) {
      console.log("✓ Master account already exists:", existingMaster.email);
      return;
    }
    
    // Create master account
    const passwordHash = await bcrypt.hash("Phttp123!?!", SALT_ROUNDS);
    
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
    console.error("Failed to seed master account:", error);
    throw error;
  }
}
