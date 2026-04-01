-- 報價單系統 - 建立新 table
-- 在 Supabase SQL Editor 執行

-- 1. 客戶
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  tax_id VARCHAR(20),
  contact_person VARCHAR(100) NOT NULL,
  address TEXT,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. 服務項目
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  specification TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. 報價單
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  user_id UUID NOT NULL REFERENCES admin_users(id),
  discount NUMERIC(5, 2) DEFAULT 0 NOT NULL,
  tax_rate NUMERIC(5, 2) DEFAULT 5 NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' NOT NULL,
  notes TEXT,
  subtotal NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  tax_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  total_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 4. 報價單項目
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  name VARCHAR(200) NOT NULL,
  specification TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  amount NUMERIC(12, 2) NOT NULL
);

-- 5. 公司資訊（報價單用）
CREATE TABLE IF NOT EXISTS company_info (
  id VARCHAR(20) PRIMARY KEY DEFAULT 'default',
  name VARCHAR(200) DEFAULT '公司名稱' NOT NULL,
  address TEXT DEFAULT '' NOT NULL,
  phone VARCHAR(30) DEFAULT '' NOT NULL,
  email VARCHAR(100) DEFAULT '' NOT NULL,
  tax_id VARCHAR(20) DEFAULT '' NOT NULL,
  logo_url TEXT DEFAULT '' NOT NULL,
  stamp_url TEXT DEFAULT '' NOT NULL
);

-- 插入預設公司資訊
INSERT INTO company_info (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
