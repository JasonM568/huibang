-- 新增客戶編號欄位
ALTER TABLE clients ADD COLUMN client_number VARCHAR(20) UNIQUE;

-- 為現有客戶補上編號（依建立日期排序）
WITH numbered AS (
  SELECT
    id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY TO_CHAR(created_at, 'MMDDYY')
      ORDER BY created_at
    ) AS daily_seq
  FROM clients
)
UPDATE clients
SET client_number = 'C-' || TO_CHAR(numbered.created_at, 'MMDDYY') || '-' || numbered.daily_seq
FROM numbered
WHERE clients.id = numbered.id;

-- 新增統一編號欄位（允許 NULL 以相容現有資料，新建立時由 API 驗證必填）
ALTER TABLE clients ADD COLUMN tax_id VARCHAR(20);

-- contact_name 設為 NOT NULL，contact_email/contact_phone 允許 NULL
UPDATE clients SET contact_name = '' WHERE contact_name IS NULL;
ALTER TABLE clients ALTER COLUMN contact_name SET NOT NULL;
ALTER TABLE clients ALTER COLUMN contact_email DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN contact_phone DROP NOT NULL;

-- ===== 員工固定薪資項目 =====
CREATE TABLE employee_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(10, 0) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ===== 薪資自訂應扣項目 =====
CREATE TABLE salary_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_record_id UUID NOT NULL REFERENCES salary_records(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(10, 0) NOT NULL DEFAULT 0
);

-- ===== 收支表 =====
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  description VARCHAR(300) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  counterparty VARCHAR(200),
  invoice_no VARCHAR(30),
  invoice_date TIMESTAMP,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_date TIMESTAMP,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

ALTER TABLE ledger_entries ADD COLUMN invoice_ref_id UUID REFERENCES invoices(id) ON DELETE CASCADE;
ALTER TABLE ledger_entries ADD COLUMN expected_pay_date TIMESTAMP;

CREATE TABLE frequent_counterparties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ===== 登入紀錄 =====
ALTER TABLE admin_users ADD COLUMN last_login_at TIMESTAMP;

CREATE TABLE login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  login_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ip VARCHAR(50),
  user_agent VARCHAR(300)
);

-- ===== 薪資紀錄：新增單位備註說明欄位 =====
ALTER TABLE salary_records ADD COLUMN internal_note TEXT;

-- ===== customers 欄位調整：email 取消必填，taxId/phone 改必填 =====
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;
UPDATE customers SET tax_id = '' WHERE tax_id IS NULL;
UPDATE customers SET phone = '' WHERE phone IS NULL;
ALTER TABLE customers ALTER COLUMN tax_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN phone SET NOT NULL;

-- 2026-06-12: 報價單新增計稅方式（exclusive 稅外加 / inclusive 含稅）
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS tax_type varchar(20) DEFAULT 'exclusive' NOT NULL;

-- 2026-06-15: 報價項次各自折扣（amount 改存折後金額；quotes.subtotal 改存折後小計）
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS discount numeric(5,2) DEFAULT 0 NOT NULL;

-- 2026-06-18: 公司匯款資訊（附在請款單）
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS bank_name varchar(100) NOT NULL DEFAULT '';
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS bank_branch varchar(100) NOT NULL DEFAULT '';
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS bank_code varchar(10) NOT NULL DEFAULT '';
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS bank_account_name varchar(200) NOT NULL DEFAULT '';
ALTER TABLE company_info ADD COLUMN IF NOT EXISTS bank_account_number varchar(50) NOT NULL DEFAULT '';

-- 2026-06-18: 請款單分期請款（皆為空＝一般全額請款單）
ALTER TABLE invoices ALTER COLUMN invoice_number TYPE varchar(40);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS installment_no integer;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS installment_label varchar(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS installment_percent numeric(5,2);

-- ============================================================
-- 2026-08-08: ERP 進銷存模組（移植自 erp-system，全部 erp_ 前綴）
-- ENUM 一律改 varchar + CHECK；auth.users 外鍵改 admin_users；不建 RLS
-- ============================================================

-- 商品分類
CREATE TABLE IF NOT EXISTS erp_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES erp_categories(id),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 倉庫（主倉/子倉層級）
CREATE TABLE IF NOT EXISTS erp_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    warehouse_type VARCHAR(10) NOT NULL DEFAULT 'main' CHECK (warehouse_type IN ('main', 'sub')),
    parent_id UUID REFERENCES erp_warehouses(id) ON DELETE SET NULL,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 商品主檔（三階售價 + 效期屬性）
CREATE TABLE IF NOT EXISTS erp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    specification TEXT,
    unit VARCHAR(20) NOT NULL DEFAULT '個',
    category_id UUID REFERENCES erp_categories(id),
    barcode VARCHAR(50),
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    wholesale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    group_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    safety_stock INT NOT NULL DEFAULT 0,
    has_expiry BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_alert_days INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erp_products_sku ON erp_products(sku);
CREATE INDEX IF NOT EXISTS idx_erp_products_category ON erp_products(category_id);

-- 規格維度 / 選項 / 商品規格
CREATE TABLE IF NOT EXISTS erp_spec_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_spec_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension_id UUID NOT NULL REFERENCES erp_spec_dimensions(id) ON DELETE CASCADE,
    value VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(dimension_id, value)
);
CREATE INDEX IF NOT EXISTS idx_erp_spec_options_dimension ON erp_spec_options(dimension_id);

CREATE TABLE IF NOT EXISTS erp_product_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE CASCADE,
    dimension_id UUID NOT NULL REFERENCES erp_spec_dimensions(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES erp_spec_options(id) ON DELETE CASCADE,
    UNIQUE(product_id, dimension_id)
);
CREATE INDEX IF NOT EXISTS idx_erp_product_specs_product ON erp_product_specs(product_id);

-- 每商品總庫存
CREATE TABLE IF NOT EXISTS erp_product_stock (
    product_id UUID PRIMARY KEY REFERENCES erp_products(id) ON DELETE CASCADE,
    total_quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 商品 × 倉庫存量
CREATE TABLE IF NOT EXISTS erp_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES erp_products(id),
    warehouse_id UUID NOT NULL REFERENCES erp_warehouses(id),
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS erp_inventory_product_warehouse_idx ON erp_inventory(product_id, warehouse_id);

-- 批號庫存（warehouse_id 空 = 未分倉）
CREATE TABLE IF NOT EXISTS erp_inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES erp_warehouses(id) ON DELETE SET NULL,
    batch_no VARCHAR(50) NOT NULL,
    expiry_date DATE,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erp_batches_product ON erp_inventory_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_erp_batches_expiry ON erp_inventory_batches(expiry_date) WHERE expiry_date IS NOT NULL;

-- 庫存異動流水
CREATE TABLE IF NOT EXISTS erp_inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES erp_products(id),
    warehouse_id UUID REFERENCES erp_warehouses(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUST', 'TRANSFER')),
    quantity INT NOT NULL,
    balance_after INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    batch_no VARCHAR(50),
    note TEXT,
    created_by UUID NOT NULL REFERENCES admin_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erp_inv_tx_product ON erp_inventory_transactions(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_erp_inv_tx_reference ON erp_inventory_transactions(reference_type, reference_id);

-- 倉間調撥
CREATE TABLE IF NOT EXISTS erp_inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(30) UNIQUE NOT NULL,
    from_warehouse_id UUID NOT NULL REFERENCES erp_warehouses(id),
    to_warehouse_id UUID NOT NULL REFERENCES erp_warehouses(id),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'in_transit', 'completed', 'cancelled')),
    note TEXT,
    created_by UUID NOT NULL REFERENCES admin_users(id),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (from_warehouse_id != to_warehouse_id)
);

CREATE TABLE IF NOT EXISTS erp_inventory_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES erp_inventory_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES erp_products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    received_quantity INT NOT NULL DEFAULT 0
);

-- ERP 專用客戶（獨立於官網 customers）
CREATE TABLE IF NOT EXISTS erp_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE,
    company_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(20),
    customer_type VARCHAR(20) NOT NULL DEFAULT 'retail' CHECK (customer_type IN ('wholesale', 'dealer', 'retail')),
    contact_name VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(200),
    address TEXT,
    payment_terms VARCHAR(100),
    note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erp_customers_type ON erp_customers(customer_type);

-- 銷售訂單
CREATE TABLE IF NOT EXISTS erp_sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES erp_customers(id),
    warehouse_id UUID NOT NULL REFERENCES erp_warehouses(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_ship_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
    tax_method VARCHAR(20) NOT NULL DEFAULT 'tax_excluded' CHECK (tax_method IN ('tax_included', 'tax_excluded')),
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    shipping_address TEXT,
    note TEXT,
    created_by UUID NOT NULL REFERENCES admin_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erp_so_customer ON erp_sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_erp_so_status ON erp_sales_orders(status);

CREATE TABLE IF NOT EXISTS erp_sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID NOT NULL REFERENCES erp_sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES erp_products(id),
    batch_id UUID REFERENCES erp_inventory_batches(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    shipped_quantity INT NOT NULL DEFAULT 0,
    unit_price NUMERIC(12,2) NOT NULL,
    price_tier VARCHAR(20),
    discount_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(14,2) NOT NULL,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL,
    note TEXT
);
CREATE INDEX IF NOT EXISTS idx_erp_so_items_so ON erp_sales_order_items(sales_order_id);

-- 出貨單（分批出貨）
CREATE TABLE IF NOT EXISTS erp_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_number VARCHAR(30) UNIQUE NOT NULL,
    sales_order_id UUID NOT NULL REFERENCES erp_sales_orders(id),
    warehouse_id UUID NOT NULL REFERENCES erp_warehouses(id),
    ship_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'signed', 'cancelled')),
    signed_at TIMESTAMPTZ,
    signed_by VARCHAR(100),
    shipping_address TEXT,
    note TEXT,
    created_by UUID NOT NULL REFERENCES admin_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erp_shipments_so ON erp_shipments(sales_order_id);

CREATE TABLE IF NOT EXISTS erp_shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES erp_shipments(id) ON DELETE CASCADE,
    so_item_id UUID NOT NULL REFERENCES erp_sales_order_items(id),
    product_id UUID NOT NULL REFERENCES erp_products(id),
    batch_id UUID REFERENCES erp_inventory_batches(id) ON DELETE SET NULL,
    batch_no VARCHAR(50),
    shipped_quantity INT NOT NULL CHECK (shipped_quantity > 0),
    note TEXT
);
CREATE INDEX IF NOT EXISTS idx_erp_shipment_items_shipment ON erp_shipment_items(shipment_id);

-- 單號序列（SO / SH / TR）
CREATE TABLE IF NOT EXISTS erp_number_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prefix VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    last_number INT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS erp_number_sequences_prefix_year_month_idx ON erp_number_sequences(prefix, year, month);

-- Seed：常用規格維度 + 選項（idempotent）
INSERT INTO erp_spec_dimensions (name, sort_order) VALUES
  ('顏色', 1), ('尺寸', 2), ('容量/重量', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO erp_spec_options (dimension_id, value, sort_order)
SELECT d.id, v.value, v.sort_order
FROM erp_spec_dimensions d,
     (VALUES ('黑色', 1), ('白色', 2), ('紅色', 3), ('藍色', 4), ('粉紅色', 5), ('淡紫色', 6)) AS v(value, sort_order)
WHERE d.name = '顏色'
ON CONFLICT (dimension_id, value) DO NOTHING;

INSERT INTO erp_spec_options (dimension_id, value, sort_order)
SELECT d.id, v.value, v.sort_order
FROM erp_spec_dimensions d,
     (VALUES ('S', 1), ('M', 2), ('L', 3), ('XL', 4), ('XXL', 5)) AS v(value, sort_order)
WHERE d.name = '尺寸'
ON CONFLICT (dimension_id, value) DO NOTHING;

INSERT INTO erp_spec_options (dimension_id, value, sort_order)
SELECT d.id, v.value, v.sort_order
FROM erp_spec_dimensions d,
     (VALUES ('100g', 1), ('300g', 2), ('500g', 3), ('1kg', 4)) AS v(value, sort_order)
WHERE d.name = '容量/重量'
ON CONFLICT (dimension_id, value) DO NOTHING;
