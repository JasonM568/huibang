// Run with: npx tsx scripts/seed.ts
// Make sure .env.local is set up first

import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import bcrypt from "bcryptjs";
import { adminUsers } from "../lib/db/schema";

async function seed() {
  const db = drizzle(sql);

  // Create default admin user
  const email = process.env.ADMIN_EMAIL || "admin@huibang.com";
  const password = process.env.ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(adminUsers).values({
    email,
    passwordHash,
    name: "管理員",
    role: "admin",
  });

  console.log(`✅ Admin user created: ${email}`);
  console.log(`⚠️  Please change the default password after first login!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
