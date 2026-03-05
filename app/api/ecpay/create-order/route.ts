import { NextRequest, NextResponse } from "next/server";
import { createOrderParams } from "@/lib/ecpay";

export async function POST(request: NextRequest) {
  try {
    const { email, contactName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email 為必填" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";

    const { params, apiUrl } = createOrderParams({
      email,
      contactName: contactName || "",
      baseUrl,
    });

    // 回傳自動提交表單的 HTML
    const inputFields = Object.entries(params)
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${key}" value="${escapeHtml(value)}" />`
      )
      .join("\n");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>正在前往綠界付款...</title>
</head>
<body>
  <form id="ecpay-form" method="POST" action="${apiUrl}">
    ${inputFields}
  </form>
  <p style="text-align:center;margin-top:50px;font-family:sans-serif;color:#666;">
    正在前往付款頁面，請稍候...
  </p>
  <script>document.getElementById('ecpay-form').submit();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("ECPay create-order error:", error);
    return NextResponse.json(
      { error: "建立訂單失敗" },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
