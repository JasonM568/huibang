# SPEC — ERP 模組移植(erp-system → huibang 官網後台)

> 狀態:**待 Jason 確認**
> 日期:2026-08-08
> 來源:`/Users/jasonmchen/erp-system`(v0.7.0,Next 16 + Supabase Auth/RLS)
> 目標:huibang 官網後台(Next 14 + Drizzle + 自建 auth)

---

## 1. 目標

把 erp-system 中「官網後台沒有」的模組移植進 huibang 後台,成為 `/admin/erp` 模組:

- **商品管理**:商品(SKU/單位/分類/條碼/成本價/三階售價/安全庫存/效期屬性)、分類、多維規格(維度/選項)
- **倉庫管理**:主倉/子倉層級
- **進銷存**:入庫(入倉分配+批號/效期)、庫存查詢(總量+各倉)、倉間調撥、效期警示、庫存異動紀錄
- **銷售訂單**:建單(依客戶類型自動帶三階價、可指定批號)、狀態流、詳細頁
- **出貨單**:分批出貨、扣庫存、簽收、出貨單列印

**明確不做**(已與 Jason 對齊 2026-08-08):

- 不移植:報價單、請款單、CRM 進階(聯絡人/商機/活動)、採購、會計、HR、專案——官網已有或本次不需要
- 不打通官網現有 `customers` 表:**ERP 模組自帶獨立客戶表 `erp_customers`**
- 不動官網現有任何模組與資料

## 2. 技術移植原則(兩邊棧不相容,是重寫不是複製)

| 層面 | erp-system 原作法 | 移植到 huibang 的作法 |
|---|---|---|
| 資料存取 | Supabase client 直連 + RLS | Drizzle ORM + API routes(`requireAuth()` 守門),**不用 RLS** |
| 權限 | Supabase Auth(auth.users) | 沿用官網 admin session;`created_by` 改參照 `admin_users` |
| UI | shadcn/ui + Tailwind v4 | 官網自建元件風格 + Tailwind v3(比照 quote-system 寫法) |
| Server Actions | Next 16 server actions | 官網慣例:API routes(`app/api/admin/erp/...`) |
| 狀態 | TanStack Query + Zustand | 官網慣例:useState/useEffect + fetch(不新增依賴) |

## 3. 資料庫 Schema(全部加 `erp_` 前綴,避免與官網現有表衝突)

同一個 Supabase Postgres(`POSTGRES_URL`),新增以下表,定義寫入 `lib/db/schema.ts`,migration SQL 附加到 `drizzle/0001_add_client_number.sql` 並立即執行:

| 新表 | 來源表 | 說明 |
|---|---|---|
| `erp_categories` | categories | 商品分類(支援 parent) |
| `erp_warehouses` | warehouses | 倉庫,含 `warehouse_type`(main/sub)+ `parent_id` |
| `erp_products` | products | 含 cost/selling/wholesale/group 四價、`has_expiry`、`expiry_alert_days`、安全庫存 |
| `erp_spec_dimensions` | spec_dimensions | 規格維度(顏色/尺寸/容量),含 seed |
| `erp_spec_options` | spec_options | 維度選項,含 seed |
| `erp_product_specs` | product_specs | 商品×維度×選項 |
| `erp_product_stock` | product_stock | 每商品總庫存(未分倉+已分倉合計) |
| `erp_inventory` | inventory | 商品×倉庫存量 |
| `erp_inventory_batches` | inventory_batches | 批號庫存(warehouse_id 可空=未分倉),含效期 |
| `erp_inventory_transactions` | inventory_transactions | 異動流水(正=入/負=出、balance_after、reference) |
| `erp_inventory_transfers` + `_items` | inventory_transfers | 倉間調撥 |
| `erp_customers` | customers | ERP 專用客戶,含 `customer_type`(wholesale/dealer/retail) |
| `erp_sales_orders` + `_items` | sales_orders | 銷售訂單;items 含 `batch_id`、`shipped_quantity`、折扣 |
| `erp_shipments` + `_items` | shipments | 出貨單(SH-YYYYMM-NNNN),分批出貨、簽收 |
| `erp_number_sequences` | number_sequences | 單號序列(SO/SH/TR) |

轉換規則:

- PG `ENUM` 型別一律改 `varchar` + `CHECK`(比照 00010 的做法,避免之後 ALTER TYPE)
- `auth.users` 外鍵一律改參照 `admin_users.id`
- 不建 RLS policy(權限由 API 層 `requireAuth()` 控)
- UUID 主鍵保留(`gen_random_uuid()`)

## 4. 頁面結構(比照 quote-system 慣例)

```
app/admin/erp/
├── page.tsx                # Tabs:商品 | 分類與規格 | 倉庫 | 庫存查詢 | 效期警示 | ERP客戶
│   ├── ProductsTab.tsx     # 商品列表(規格欄、三層售價)+ 新增/編輯
│   ├── SpecsTab.tsx        # 分類管理 + 規格維度/選項管理
│   ├── WarehousesTab.tsx   # 倉庫 CRUD(主倉/子倉)
│   ├── StockTab.tsx        # 庫存查詢(預設隱藏 0 庫存)+ 入庫 + 入倉分配(勾批號)+ 調撥
│   ├── ExpiryTab.tsx       # 效期警示列表
│   └── CustomersTab.tsx    # ERP 客戶(類型 radio card:零售/批發/經銷)
├── sales-orders/
│   ├── page.tsx            # SO 列表(expand row 顯示品項)
│   ├── new/                # 全頁面建單(選客戶自動帶價+tier標籤、切客戶 confirm 重算、選批號)
│   ├── [id]/               # 詳細頁
│   └── [id]/ship/          # 出貨表單(分批、扣庫存)
└── shipments/
    ├── page.tsx            # 出貨單列表(expand row)
    ├── [id]/               # 出貨單詳細(簽收)
    └── [id]/print/         # 出貨單列印(比照官網列印頁慣例,window.open)
```

Sidebar(`app/admin/layout.tsx`)新增「ERP 進銷存」區:ERP 主控台、銷售訂單、出貨單。

## 5. API 路由

`app/api/admin/erp/` 下,全部 `requireAuth()`:

```
products/route.ts + [id]/route.ts
categories/  specs/(dimensions+options)  warehouses/
stock/(查詢)  stock-in/(入庫+分倉+批號)  transfers/
customers/ + [id]/
sales-orders/ + [id]/ + [id]/ship/(建立出貨、扣庫存、寫異動)
shipments/ + [id]/(簽收/取消)
```

## 6. 核心商業邏輯(照搬 erp-system 既有行為)

1. **三階帶價**:選客戶→新品項帶對應價(wholesale→批發價、dealer→團購價、retail→零售價;0 則 fallback 零售價);切客戶時 confirm 是否重算既有品項;單價欄下顯示 tier 標籤(批發=藍/團購=紫/零售=綠/自訂=琥珀)
2. **入庫流程**:入庫先進總庫存(`erp_product_stock`)→再分配到倉(`erp_inventory`);`has_expiry=true` 的商品分配時必須勾批號
3. **出貨流程**:SO→建出貨單(可分批)→扣 `erp_inventory` + 批次量→寫 `erp_inventory_transactions`(負數)→更新 `so_items.shipped_quantity` 與 SO 狀態
4. **單號**:`SO-YYYYMM-NNNN` / `SH-YYYYMM-NNNN` / `TR-YYYYMM-NNNN`,用 `erp_number_sequences` 以 transaction 遞增
5. **庫存查詢**:預設隱藏 quantity=0;效期警示依 `expiry_alert_days`

## 7. 實作順序(單一 scope,分段交付)

| 階段 | 內容 | 驗收 |
|---|---|---|
| A | Schema + migration 執行 + 商品/分類/規格/倉庫 CRUD | 後台能建商品(含三價/規格)、倉庫 |
| B | 入庫/分倉/批號 + 庫存查詢 + 調撥 + 效期 | 入庫→分倉→查詢流程可跑,批號效期正確 |
| C | ERP 客戶 + 銷售訂單(帶價/批號/expand 列表) | 建 SO 自動帶價正確、tier 標籤正確 |
| D | 出貨(分批/扣庫存/簽收/列印)+ sidebar + build 驗證 | 出貨後庫存/批次/shipped_quantity 正確;`npm run build` 過 |

每階段完成即 commit + push(依官網 git 安全流程:`git read-tree HEAD` → diff 檢查 → 無 `D` entries 才 commit)。

## 8. 邊界與風險

- **不碰**官網現有表和頁面;唯二共用點:`admin_users`(created_by)與 sidebar 加連結
- 官網本機 build 因中文路徑有已知 manifest ENOENT,以 `Compiled successfully` + 型別檢查為準
- ERP 舊系統(hbppp01.vercel.app)照常運作,不遷移既有資料;上線後若要搬資料另開任務
- Next 14 無 server actions 慣例,全部走 API routes,與官網一致
