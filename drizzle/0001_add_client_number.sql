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

-- 將 contact_email、contact_phone 設為 NOT NULL（現有空值先補預設值）
UPDATE clients SET contact_email = '' WHERE contact_email IS NULL;
UPDATE clients SET contact_phone = '' WHERE contact_phone IS NULL;
ALTER TABLE clients ALTER COLUMN contact_email SET NOT NULL;
ALTER TABLE clients ALTER COLUMN contact_phone SET NOT NULL;

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

-- ===== 薪資紀錄：新增單位備註說明欄位 =====
ALTER TABLE salary_records ADD COLUMN internal_note TEXT;

-- ===== customers 欄位調整：email 取消必填，taxId/phone 改必填 =====
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;
UPDATE customers SET tax_id = '' WHERE tax_id IS NULL;
UPDATE customers SET phone = '' WHERE phone IS NULL;
ALTER TABLE customers ALTER COLUMN tax_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN phone SET NOT NULL;
