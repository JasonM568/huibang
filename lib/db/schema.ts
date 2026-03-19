import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  date,
  uniqueIndex,
  boolean,
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

// ===== 客戶管理 =====
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // 品牌基本資料
  brandName: varchar("brand_name", { length: 100 }).notNull(),
  industry: varchar("industry", { length: 50 }),
  contactName: varchar("contact_name", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 30 }),
  company: varchar("company", { length: 100 }),
  website: varchar("website", { length: 200 }),

  // 合作狀態
  status: varchar("status", { length: 20 }).default("prospect").notNull(),
  // status: prospect（洽談中）/ active（合作中）/ paused（暫停）/ ended（已結束）

  // 方案資訊
  planTier: varchar("plan_tier", { length: 20 }),
  // planTier: basic / growth / flagship / custom
  monthlyFee: integer("monthly_fee"),
  contractStart: date("contract_start"),
  contractEnd: date("contract_end"),

  // 關聯
  submissionId: uuid("submission_id").references(() => submissions.id),
  assignedTo: varchar("assigned_to", { length: 50 }),
  note: text("note"),
});

// ===== 品牌策略建檔 =====
export const clientStrategies = pgTable("client_strategies", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // 品牌人設
  brandPersonality: text("brand_personality"), // 品牌個性描述
  brandTone: text("brand_tone"), // 說話語氣
  brandTaboos: text("brand_taboos"), // 禁用詞彙/風格禁區

  // 受眾輪廓
  audienceAge: varchar("audience_age", { length: 50 }),
  audienceGender: varchar("audience_gender", { length: 30 }),
  audienceLocation: varchar("audience_location", { length: 100 }),
  audienceOccupation: varchar("audience_occupation", { length: 100 }),
  audiencePainPoints: text("audience_pain_points"),
  audiencePlatforms: text("audience_platforms"), // JSON 陣列字串
  audienceDecisionFactors: text("audience_decision_factors"),

  // 品牌聲量
  valueProposition: text("value_proposition"), // 核心價值主張
  keyMessages: text("key_messages"), // JSON 陣列字串
  competitorDiff: text("competitor_diff"), // 競品差異化

  // 經營設定
  platforms: text("platforms"), // JSON 陣列字串
  platformPositions: text("platform_positions"), // JSON 物件字串
  postFrequency: varchar("post_frequency", { length: 50 }),
  kpiTargets: text("kpi_targets"), // JSON 物件字串
}, (table) => ({
  clientIdIdx: uniqueIndex("client_strategies_client_id_idx").on(table.clientId),
}));

// ===== 深度社群健診 Token =====
export const diagnosticTokens = pgTable("diagnostic_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: uuid("token").defaultRandom().notNull().unique(),
  email: varchar("email", { length: 100 }).notNull(),
  contactName: varchar("contact_name", { length: 50 }),
  status: varchar("status", { length: 20 }).default("unused").notNull(),
  // status: unused / used / expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  // 填完問卷後關聯 submission
  submissionId: uuid("submission_id"),
  // 備註（例如：ECPay 訂單號碼）
  note: varchar("note", { length: 200 }),
});

// ===== 深度社群健診 提交紀錄 =====
export const diagnosticSubmissions = pgTable("diagnostic_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  // status: pending / analyzed

  // 來自 token
  tokenId: uuid("token_id").references(() => diagnosticTokens.id),

  // 基本識別（從 token 帶入）
  email: varchar("email", { length: 100 }),
  contactName: varchar("contact_name", { length: 50 }),

  // 問卷答案（JSONB）
  answers: jsonb("answers").notNull(),

  // AI 分析結果（六區塊書面報告）
  analysis: jsonb("analysis"),

  // 內部管理
  internalNote: text("internal_note"),
});

// ===== 訂單管理 =====
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNo: varchar("order_no", { length: 20 }).unique().notNull(),
  // 產品資訊
  productType: varchar("product_type", { length: 30 }).notNull(),
  planId: varchar("plan_id", { length: 10 }),
  amount: integer("amount").notNull(),
  itemName: varchar("item_name", { length: 200 }),
  // 客戶資訊
  customerEmail: varchar("customer_email", { length: 100 }).notNull(),
  customerName: varchar("customer_name", { length: 50 }),
  customerPhone: varchar("customer_phone", { length: 30 }),
  // 電子發票載具
  carrierType: varchar("carrier_type", { length: 10 }),
  carrierNum: varchar("carrier_num", { length: 20 }),
  // 付款狀態
  paymentStatus: varchar("payment_status", { length: 10 }).default("pending").notNull(),
  ecpayTradeNo: varchar("ecpay_trade_no", { length: 30 }),
  // 發票狀態
  invoiceStatus: varchar("invoice_status", { length: 10 }).default("none").notNull(),
  invoiceNo: varchar("invoice_no", { length: 20 }),
  invoiceError: text("invoice_error"),
  // 備註
  note: text("note"),
  // 時間戳
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== API 用量紀錄 =====
export const apiUsageLogs = pgTable("api_usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endpoint: varchar("endpoint", { length: 50 }).notNull(),
  // "analyze" | "analyze-deep" | "content-studio"
  model: varchar("model", { length: 50 }).notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  costUsd: varchar("cost_usd", { length: 20 }).notNull(), // 存字串避免浮點誤差
  userId: varchar("user_id", { length: 50 }),
  metadata: jsonb("metadata"),
});

// ===== 試用名單 =====
export const trialLeads = pgTable("trial_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  source: varchar("source", { length: 50 }).default("restaurant-pack").notNull(),
  agentDelivered: boolean("agent_delivered").default(false).notNull(),
  deliveredAt: timestamp("delivered_at"),
  note: text("note"),
});

// ===== Types =====
export type DiagnosticToken = typeof diagnosticTokens.$inferSelect;
export type NewDiagnosticToken = typeof diagnosticTokens.$inferInsert;
export type DiagnosticSubmission = typeof diagnosticSubmissions.$inferSelect;
export type NewDiagnosticSubmission = typeof diagnosticSubmissions.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientStrategy = typeof clientStrategies.$inferSelect;
export type NewClientStrategy = typeof clientStrategies.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;
export type TrialLead = typeof trialLeads.$inferSelect;
export type NewTrialLead = typeof trialLeads.$inferInsert;
