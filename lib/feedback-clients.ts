// 客戶回饋表單——各客戶系統模組清單（2026-08-04）。
// 通行碼→公司對應放 env FEEDBACK_ACCESS_CODES（機密）；本檔只管每家客戶的表單結構。
// 新客戶上線：env 加一組「碼:公司名」，此處加一行模組清單即可。

export const CLIENT_PAGES: Record<string, string[]> = {
  環安傢俱: ["訂單", "維修單", "工作報表", "佈告欄", "考勤", "薪資", "業績儀表板", "商品/庫存", "其他"],
};

/** 未設定模組清單的客戶用通用選項 */
export const DEFAULT_PAGES = ["系統功能", "網站頁面", "其他"];

export function pagesForCompany(company: string): string[] {
  return CLIENT_PAGES[company] ?? DEFAULT_PAGES;
}
