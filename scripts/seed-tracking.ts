// Run with: npx tsx scripts/seed-tracking.ts
// Make sure .env.local (or Vercel env) is set up first

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { siteSettings } from "../lib/db/schema";

async function seedTracking() {
  const client = postgres(process.env.POSTGRES_URL!, { prepare: false });
  const db = drizzle(client);

  const trackingDefaults = [
    { key: "tracking_gtm", value: "", description: "Google Tag Manager 容器 ID" },
    { key: "tracking_ga4", value: "G-P0D9HESXBG", description: "Google Analytics 4 測量 ID" },
    { key: "tracking_google_ads", value: "", description: "Google Ads 轉換追蹤 ID" },
    { key: "tracking_meta_pixel", value: "26910819901839061", description: "Meta Pixel ID" },
    { key: "tracking_line_tag", value: "", description: "LINE Tag ID" },
  ];

  for (const setting of trackingDefaults) {
    await db
      .insert(siteSettings)
      .values(setting)
      .onConflictDoNothing();
  }

  console.log("✅ Tracking code settings seeded");
  await client.end();
  process.exit(0);
}

seedTracking().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
