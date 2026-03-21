"use client";

import { useEffect } from "react";

interface Props {
  contentName: string;
  contentCategory: string;
  contentType?: "product" | "article";
  contentIds?: string[];
  value?: number;
  currency?: string;
}

/**
 * 頁面掛載後觸發 Meta Pixel ViewContent 事件（每頁僅觸發一次）
 * 使用 window 全域旗標防止 React Strict Mode / re-render 重複觸發
 */
export default function PixelViewContent({
  contentName,
  contentCategory,
  contentType = "product",
  contentIds,
  value,
  currency = "TWD",
}: Props) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.fbq) return;

    // 用 contentName 作為唯一 key，防止同頁重複觸發
    const key = `__pixel_vc_fired_${contentName.replace(/\s/g, "_")}`;
    if ((window as Record<string, unknown>)[key]) return;
    (window as Record<string, unknown>)[key] = true;

    window.fbq("track", "ViewContent", {
      content_name: contentName,
      content_category: contentCategory,
      content_type: contentType,
      ...(contentIds ? { content_ids: contentIds } : {}),
      ...(value !== undefined ? { value, currency } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
