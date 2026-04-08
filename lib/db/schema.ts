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
  numeric,
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
  canQuote: boolean("can_quote").default(false).notNull(),
  canSalary: boolean("can_salary").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== 登入紀錄 =====
export const loginLogs = pgTable("login_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => adminUsers.id, { onDelete: "cascade" }).notNull(),
  loginAt: timestamp("login_at").defaultNow().notNull(),
  ip: varchar("ip", { length: 50 }),
  userAgent: varchar("user_agent", { length: 300 }),
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
  clientNumber: varchar("client_number", { length: 20 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // 品牌基本資料
  brandName: varchar("brand_name", { length: 100 }).notNull(),
  industry: varchar("industry", { length: 50 }),
  contactName: varchar("contact_name", { length: 50 }).notNull(),
  contactEmail: varchar("contact_email", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 30 }),
  taxId: varchar("tax_id", { length: 20 }).notNull(),
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
  // 三聯發票（統編）
  buyerUbn: varchar("buyer_ubn", { length: 10 }),
  buyerCompany: varchar("buyer_company", { length: 100 }),
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

// ===== EDM 發送記錄 =====
export const edmLogs = pgTable("edm_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  recipientCount: integer("recipient_count").notNull(),
  recipients: jsonb("recipients").notNull(),
  sentBy: varchar("sent_by", { length: 100 }),
  status: varchar("status", { length: 20 }).default("sent").notNull(),
});
export type EdmLog = typeof edmLogs.$inferSelect;

// ===== 報價單系統 =====

// 客戶
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  taxId: varchar("tax_id", { length: 20 }).notNull(),
  contactPerson: varchar("contact_person", { length: 100 }).notNull(),
  address: text("address"),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 30 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 服務項目
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  specification: text("specification"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 報價單
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteNumber: varchar("quote_number", { length: 30 }).unique().notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  userId: uuid("user_id").references(() => adminUsers.id).notNull(),
  discount: numeric("discount", { precision: 5, scale: 2 }).default("0").notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("5").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  notes: text("notes"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 報價單項目
export const quoteItems = pgTable("quote_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id").references(() => quotes.id, { onDelete: "cascade" }).notNull(),
  serviceId: uuid("service_id").references(() => services.id),
  name: varchar("name", { length: 200 }).notNull(),
  specification: text("specification"),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

// 公司資訊（報價單用）
export const companyInfo = pgTable("company_info", {
  id: varchar("id", { length: 20 }).primaryKey().default("default"),
  name: varchar("name", { length: 200 }).default("公司名稱").notNull(),
  address: text("address").default("").notNull(),
  phone: varchar("phone", { length: 30 }).default("").notNull(),
  email: varchar("email", { length: 100 }).default("").notNull(),
  taxId: varchar("tax_id", { length: 20 }).default("").notNull(),
  logoUrl: text("logo_url").default("").notNull(),
  stampUrl: text("stamp_url").default("").notNull(),
});

// 請款單
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: varchar("invoice_number", { length: 30 }).unique().notNull(),
  quoteId: uuid("quote_id").references(() => quotes.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  userId: uuid("user_id").references(() => adminUsers.id).notNull(),
  // 金額（從報價單帶入）
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  // 發票狀態
  invoiceStatus: varchar("invoice_status", { length: 20 }).default("unissued").notNull(),
  // unissued（未開）/ issued（已開）
  taxInvoiceNo: varchar("tax_invoice_no", { length: 20 }),  // 發票號碼
  issuedDate: timestamp("issued_date"),    // 開立日期
  sentDate: timestamp("sent_date"),        // 寄出日期
  // 付款狀態
  paymentStatus: varchar("payment_status", { length: 20 }).default("unpaid").notNull(),
  // unpaid（未付）/ paid（已付）
  expectedPayDate: timestamp("expected_pay_date"),  // 預計付款日期
  paidDate: timestamp("paid_date"),                 // 實際入帳日期
  bankAccountLast5: varchar("bank_account_last5", { length: 5 }),  // 匯款帳號末5碼
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== 收支表 =====
export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 20 }).notNull(),
  // type: payable（應付帳款）/ receivable（應收帳款）
  description: varchar("description", { length: 300 }).notNull(),    // 款項說明
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),  // 金額
  counterparty: varchar("counterparty", { length: 200 }),            // 對象（公司/個人）
  invoiceNo: varchar("invoice_no", { length: 30 }),                  // 發票號碼
  invoiceDate: timestamp("invoice_date"),                            // 發票憑證開立日期
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending").notNull(),
  // paymentStatus: paid（已付）/ pending_pay（待付）/ received（已收）/ pending_receive（待收）
  transactionDate: timestamp("transaction_date"),                    // 款項出入帳日期時間
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== 薪資系統 =====

// 員工
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  department: varchar("department", { length: 50 }),    // 單位（行銷部等）
  jobTitle: varchar("job_title", { length: 50 }),       // 職位
  jobGrade: varchar("job_grade", { length: 20 }),       // 職等
  baseSalary: numeric("base_salary", { precision: 10, scale: 0 }).default("0").notNull(),  // 基本薪資
  startDate: timestamp("start_date"),                   // 到職日
  isActive: boolean("is_active").default(true).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 薪資紀錄（每月一筆）
export const salaryRecords = pgTable("salary_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
  year: integer("year").notNull(),                      // 年（民國年）
  month: integer("month").notNull(),                    // 月
  workPeriodStart: varchar("work_period_start", { length: 20 }),  // 工作期間起
  workPeriodEnd: varchar("work_period_end", { length: 20 }),      // 工作期間迄
  payDays: integer("pay_days"),                         // 計薪日數
  // 應領
  baseSalary: numeric("base_salary", { precision: 10, scale: 0 }).default("0").notNull(),
  leaveDays: text("leave_days"),                        // 請假日數說明
  leaveDeduction: numeric("leave_deduction", { precision: 10, scale: 0 }).default("0").notNull(),  // 請假扣款
  overtimePay: numeric("overtime_pay", { precision: 10, scale: 0 }).default("0").notNull(),       // 加班費
  fullAttendanceBonus: numeric("full_attendance_bonus", { precision: 10, scale: 0 }).default("0").notNull(), // 全勤獎金
  supervisorAllowance: numeric("supervisor_allowance", { precision: 10, scale: 0 }).default("0").notNull(), // 主管加給
  // 應扣
  laborInsurance: numeric("labor_insurance", { precision: 10, scale: 0 }).default("0").notNull(),   // 勞保費
  healthInsurance: numeric("health_insurance", { precision: 10, scale: 0 }).default("0").notNull(), // 健保費
  otherDeduction: numeric("other_deduction", { precision: 10, scale: 0 }).default("0").notNull(),   // 其他扣款
  otherDeductionNote: text("other_deduction_note"),
  // 合計
  totalEarnings: numeric("total_earnings", { precision: 10, scale: 0 }).default("0").notNull(),     // 應領合計
  totalDeductions: numeric("total_deductions", { precision: 10, scale: 0 }).default("0").notNull(), // 應扣合計
  netPay: numeric("net_pay", { precision: 10, scale: 0 }).default("0").notNull(),                   // 實領金額
  note: text("note"),
  internalNote: text("internal_note"),                     // 單位備註說明（僅管理者可見）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 員工固定薪資項目（如主管加給、績效獎金等，每月自動帶入）
export const employeeAllowances = pgTable("employee_allowances", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 0 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 薪資獎金項目（多筆，如專案獎金）
export const salaryBonuses = pgTable("salary_bonuses", {
  id: uuid("id").primaryKey().defaultRandom(),
  salaryRecordId: uuid("salary_record_id").references(() => salaryRecords.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),    // 獎金名稱（如：專案獎金-中宇）
  amount: numeric("amount", { precision: 10, scale: 0 }).default("0").notNull(),
});

// 薪資應扣項目（多筆，如代扣所得稅等）
export const salaryDeductions = pgTable("salary_deductions", {
  id: uuid("id").primaryKey().defaultRandom(),
  salaryRecordId: uuid("salary_record_id").references(() => salaryRecords.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 0 }).default("0").notNull(),
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
export type Customer = typeof customers.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type CompanyInfo = typeof companyInfo.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type EmployeeAllowance = typeof employeeAllowances.$inferSelect;
export type SalaryRecord = typeof salaryRecords.$inferSelect;
export type SalaryBonus = typeof salaryBonuses.$inferSelect;
export type SalaryDeduction = typeof salaryDeductions.$inferSelect;
