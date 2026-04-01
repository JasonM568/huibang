-- 在 admin_users 加入 can_quote 欄位
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS can_quote BOOLEAN DEFAULT FALSE NOT NULL;
