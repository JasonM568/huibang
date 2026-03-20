"use client";

import { useEffect, useRef } from "react";

interface Props {
  contentName: string;
  contentCategory: string;
  contentType?: "product" | "article";
  contentIds?: string[];
  value?: number;
  currency?: string;
}

/**
 * 頁面掛載後觸發 Meta Pixel ViewContent 事件（僅觸發一次）
 */
export default function PixelViewContent({
  contentName,
  contentCategory,
  contentType = "product",
  contentIds,
  value,
  currency = "TWD",
}: Props) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    if (typeof window !== "undefined" && window.fbq) {
      hasFired.current = true;
      window.fbq("track", "ViewContent", {
        content_name: contentName,
        content_category: contentCategory,
        content_type: contentType,
        ...(contentIds ? { content_ids: contentIds } : {}),
        ...(value !== undefined ? { value, currency } : {}),
      });
    }
  }, [contentName, contentCategory, contentType, contentIds, value, currency]);

  return null;
}
