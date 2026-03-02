import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ===== 問卷提交紀錄 =====
export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  // status flow: pending → analyzed → contacted → converted

  // Part A: 基本資料（獨立欄位，方便後台篩選排序）
  brandName: varchar("brand_name", { length: 100 }),
  industry: varchar("industry", { length: 50 }),
  foundedYear: varchar("founded_year", { length: 20 }),
  mainProducts: text("main_products"),
  website: varchar("website", { length: 200 }),
  socialMedia: varchar("social_media", { length: 200 }),
  contactName: varchar("contact_name", { length: 50 }),
  contactInfo: varchar("contact_info", { length: 100 }),
  teamSize: varchar("team_size", { length: 20 }),
  revenueRange: varchar("revenue_range", { length: 30 }),

  // Part B-G: 問卷答案（JSONB，保持彈性）
  answers: jsonb("answers").notNull(),

  // AI 分析結果
  analysis: jsonb("analysis"),

  // 內部管理
  internalNote: text("internal_note"),
  assignedTo: varchar("assigned_to", { length: 50 }),
});

// ===== 後台管理員 =====
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 200 }).notNull(),
  name: varchar("name", { length: 50 }),
  role: varchar("role", { length: 20 }).default("editor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== Email 發送紀錄 =====
export const emailLogs = pgTable("email_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id),
  emailType: varchar("email_type", { length: 30 }),
  recipient: varchar("recipient", { length: 100 }),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("sent").notNull(),
});

// ===== 聯絡表單 =====
export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  company: varchar("company", { length: 100 }),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  service: varchar("service", { length: 50 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("unread").notNull(),
  // status flow: unread → read → replied
  internalNote: text("internal_note"),
});

// ===== 網站設定（Key-Value） =====
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull().default(""),
  description: varchar("description", { length: 200 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== Types =====
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
