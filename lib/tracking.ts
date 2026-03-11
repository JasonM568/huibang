import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { like } from "drizzle-orm";

export interface TrackingCodes {
  gtm: string;
  ga4: string;
  googleAds: string;
  metaPixel: string;
  lineTag: string;
}

export async function getTrackingCodes(): Promise<TrackingCodes> {
  noStore();

  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(like(siteSettings.key, "tracking_%"));

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    return {
      gtm: map["tracking_gtm"] || "",
      ga4: map["tracking_ga4"] || "",
      googleAds: map["tracking_google_ads"] || "",
      metaPixel: map["tracking_meta_pixel"] || "",
      lineTag: map["tracking_line_tag"] || "",
    };
  } catch (error) {
    console.error("Failed to load tracking codes:", error);
    return { gtm: "", ga4: "", googleAds: "", metaPixel: "", lineTag: "" };
  }
}
