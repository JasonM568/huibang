import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotifyTeamParams {
  brandName: string;
  industry: string;
  contactName: string;
  contactInfo: string;
  submissionId: string;
}

export async function notifyTeam(params: NotifyTeamParams) {
  const { brandName, industry, contactName, contactInfo, submissionId } =
    params;

  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw"}/admin/submissions/${submissionId}`;

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    subject: `📋 新問卷提交：${brandName}（${industry}）`,
    html: `
      <div style="font-family: 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; font-size: 20px; margin: 0;">📋 新品牌檢測問卷提交</h1>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #E2E8F0; border-top: 0; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748B; width: 100px;">品牌名稱</td>
              <td style="padding: 8px 0; color: #1E293B; font-weight: 600;">${brandName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">產業類別</td>
              <td style="padding: 8px 0; color: #1E293B;">${industry}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">聯絡人</td>
              <td style="padding: 8px 0; color: #1E293B;">${contactName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">聯絡方式</td>
              <td style="padding: 8px 0; color: #1E293B;">${contactInfo}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${adminUrl}" style="display: inline-block; background: #EA580C; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              查看完整問卷 →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Email send error:", error);
    throw error;
  }

  return data;
}

// === 訪客確認信 ===
interface NotifyCustomerParams {
  email: string;
  contactName: string;
  brandName: string;
  submissionId: string;
  overallScore: number;
}

export async function notifyCustomer(params: NotifyCustomerParams) {
  const { email, contactName, brandName, submissionId, overallScore } = params;

  const resultUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw"}/result/${submissionId}`;

  const scoreColor = overallScore >= 80 ? "#22c55e" : overallScore >= 60 ? "#3b82f6" : overallScore >= 40 ? "#eab308" : "#ef4444";
  const scoreLabel = overallScore >= 80 ? "優秀" : overallScore >= 60 ? "良好" : overallScore >= 40 ? "待加強" : "需改善";

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: email,
    subject: `你的品牌健檢報告已完成 — ${brandName}`,
    html: `
      <div style="font-family: -apple-system, 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">品牌健檢報告已完成</h1>
          <p style="color: #bfdbfe; font-size: 14px; margin: 0;">${brandName} 的專屬分析</p>
        </div>

        <div style="background: #fff; padding: 32px 24px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            ${contactName} 你好，
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            感謝你填寫惠邦行銷的品牌健檢問卷！AI 已經完成分析，以下是你的品牌健康概覽：
          </p>

          <!-- Score -->
          <div style="text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; margin: 0 0 24px 0;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">品牌健康總分</p>
            <div style="font-size: 48px; font-weight: 700; color: ${scoreColor}; margin: 0 0 4px 0;">
              ${overallScore}
            </div>
            <p style="color: ${scoreColor}; font-size: 14px; font-weight: 600; margin: 0;">${scoreLabel}</p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 0 0 24px 0;">
            <a href="${resultUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              查看完整報告 →
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
            報告包含五大維度分析與具體改善建議。如果你想進一步了解如何提升品牌行銷效果，歡迎預約免費諮詢。
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

          <p style="color: #64748b; font-size: 13px; margin: 0;">
            惠邦行銷｜讓每個品牌都找到對的人<br>
            如有任何問題，歡迎回覆此信件或聯繫我們
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Customer email error:", error);
    throw error;
  }

  return data;
}

// ===== 付款成功：寄送健診連結 =====
interface SendDiagnosticTokenParams {
  email: string;
  contactName: string;
  tokenUrl: string;
  tradeNo: string;
}

export async function sendDiagnosticToken(params: SendDiagnosticTokenParams) {
  const { email, contactName, tokenUrl, tradeNo } = params;
  const name = contactName || "您";

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: email,
    subject: `付款成功！你的 AI 社群深度健診連結 🔬`,
    html: `
      <div style="font-family: -apple-system, 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">✅ 付款成功</h1>
          <p style="color: #a7f3d0; font-size: 14px; margin: 0;">AI 社群帳號深度健診</p>
        </div>
        <div style="background: #fff; padding: 32px 24px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            ${name} 你好，<br><br>
            感謝你購買惠邦行銷的 AI 社群帳號深度健診！你的付款已確認（訂單編號：${tradeNo}），請點擊下方按鈕開始填寫深度健診問卷：
          </p>

          <div style="text-align: center; padding: 24px; background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; margin: 0 0 24px 0;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">
              🔬 你的專屬健診連結（30天有效）
            </p>
            <a href="${tokenUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              開始填寫健診問卷 →
            </a>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
              ⚡ <strong>填寫提示：</strong><br>
              • 共 21 題，約需 8-10 分鐘<br>
              • 填完後 AI 會立即產出專屬報告<br>
              • 此連結為一次性使用，請一次填寫完畢<br>
              • $999 可全額折抵社群經營方案第一個月費用
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            惠邦行銷｜讓每個品牌都找到對的人<br>
            如有問題，歡迎回覆此信件聯繫我們
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Send diagnostic token email error:", error);
    throw error;
  }
  return data;
}

// ===== AI 個體包：付款成功寄送 Google Sheet 連結 =====
interface SendAiPackEmailParams {
  email: string;
  contactName: string;
  tradeNo: string;
  planId: string;
}

const AI_PACK_SHEET_URLS: Record<string, string> = {
  "1": "https://docs.google.com/spreadsheets/d/1uVZDt6c6TZ9pn3lLNY5riWUAti1i88d0Eg164X86-o8/edit?usp=sharing",
  "2": "https://docs.google.com/spreadsheets/d/1zifC9U1smty22qlrugaV-JiWOj6jnQUtooPf4keMoeE/edit?usp=sharing",
  "3": "https://docs.google.com/spreadsheets/d/1TY6ZvifbdzSta-KmzcwBJKwJxmmwon7NCSCRYzQR74o/edit?usp=sharing",
};

const AI_PACK_PLAN_NAMES: Record<string, string> = {
  "1": "入門方案（2 位 AI Agent）",
  "2": "進階方案（6 位 AI Agent）",
  "3": "全配方案（10 位 AI Agent）",
};

export async function sendAiPackEmail(params: SendAiPackEmailParams) {
  const { email, contactName, tradeNo, planId } = params;
  const name = contactName || "您";
  const planName = AI_PACK_PLAN_NAMES[planId] || "AI 個體包";
  const sheetUrl = AI_PACK_SHEET_URLS[planId] || AI_PACK_SHEET_URLS["3"];

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: email,
    subject: `付款成功！你的 AI 個體包已開通 🤖`,
    html: `
      <div style="font-family: -apple-system, 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #059669, #06b6d4); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">✅ 付款成功</h1>
          <p style="color: #a7f3d0; font-size: 14px; margin: 0;">AI 個體包 — ${planName}</p>
        </div>
        <div style="background: #fff; padding: 32px 24px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            ${name} 你好，<br><br>
            感謝你購買惠邦行銷的 AI 個體包！你的付款已確認（訂單編號：${tradeNo}）。
          </p>

          <div style="text-align: center; padding: 24px; background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; margin: 0 0 24px 0;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">
              🤖 你的 AI Agent 已準備就緒
            </p>
            <a href="${sheetUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669, #06b6d4); color: #fff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              前往領取 AI Agent →
            </a>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
              ⚡ <strong>使用說明：</strong><br>
              • 點擊上方按鈕後，會看到你的 AI Agent 連結清單<br>
              • 需要 ChatGPT 帳號才能使用（免費版可用部分功能）<br>
              • 永久有效，不限使用次數<br>
              • 可分享給團隊成員一起使用
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            惠邦行銷｜讓每個品牌都找到對的人<br>
            如有問題，歡迎回覆此信件聯繫我們
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Send AI pack email error:", error);
    throw error;
  }
  return data;
}

// ===== 付款失敗：通知客戶 =====
interface SendPaymentFailedEmailParams {
  email: string;
  contactName: string;
  orderNo: string;
  productName: string;
}

export async function sendPaymentFailedEmail(params: SendPaymentFailedEmailParams) {
  const { email, contactName, orderNo, productName } = params;
  const name = contactName || "您";
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: email,
    subject: `付款未完成，請重新操作 — ${productName}`,
    html: `
      <div style="font-family: -apple-system, 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">付款未完成</h1>
          <p style="color: #fecaca; font-size: 14px; margin: 0;">${productName}</p>
        </div>
        <div style="background: #fff; padding: 32px 24px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            ${name} 你好，<br><br>
            你的訂單（編號：${orderNo}）付款未成功。這可能是因為交易逾時、餘額不足或其他原因。
          </p>

          <div style="padding: 20px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 0 0 24px 0;">
            <p style="color: #991b1b; font-size: 14px; line-height: 1.5; margin: 0;">
              如果你仍有購買需求，請重新前往產品頁面下單。若持續無法付款，歡迎聯繫我們協助處理。
            </p>
          </div>

          <div style="text-align: center; margin: 0 0 24px 0;">
            <a href="${siteUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              回到惠邦行銷 →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            惠邦行銷｜讓每個品牌都找到對的人<br>
            如有問題，歡迎回覆此信件聯繫我們
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Send payment failed email error:", error);
    throw error;
  }
  return data;
}

// ===== 發票開立成功：通知客戶 =====
interface SendInvoiceEmailParams {
  email: string;
  contactName: string;
  orderNo: string;
  invoiceNo: string;
  amount: number;
  itemName: string;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams) {
  const { email, contactName, orderNo, invoiceNo, amount, itemName } = params;
  const name = contactName || "您";

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: email,
    subject: `電子發票已開立 — ${invoiceNo}`,
    html: `
      <div style="font-family: -apple-system, 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">電子發票已開立</h1>
          <p style="color: #a7f3d0; font-size: 14px; margin: 0;">訂單 ${orderNo}</p>
        </div>
        <div style="background: #fff; padding: 32px 24px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            ${name} 你好，<br><br>
            你的電子發票已開立完成，以下為發票資訊：
          </p>

          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 100px;">發票號碼</td>
                <td style="padding: 6px 0; color: #166534; font-size: 16px; font-weight: 700;">${invoiceNo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px;">品名</td>
                <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${itemName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px;">金額</td>
                <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">NT$ ${amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
            此發票為雲端發票，已自動歸戶至你的載具或由財政部統一管理。如需查詢，可至<a href="https://www.einvoice.nat.gov.tw" style="color: #2563eb;">財政部電子發票整合平台</a>查詢。
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            惠邦行銷｜讓每個品牌都找到對的人<br>
            如有問題，歡迎回覆此信件聯繫我們
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Send invoice email error:", error);
    throw error;
  }
  return data;
}

// ===== 發票開立失敗：通知團隊 =====
interface NotifyTeamInvoiceFailedParams {
  orderNo: string;
  customerEmail: string;
  amount: number;
  errorMessage: string;
}

export async function notifyTeamInvoiceFailed(params: NotifyTeamInvoiceFailedParams) {
  const { orderNo, customerEmail, amount, errorMessage } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw"}/admin/orders`;

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    subject: `⚠️ 發票開立失敗：${orderNo}`,
    html: `
      <div style="font-family: 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; font-size: 20px; margin: 0;">⚠️ 發票開立失敗</h1>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 100px;">訂單編號</td><td style="padding: 8px 0; font-weight: 600;">${orderNo}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">客戶 Email</td><td style="padding: 8px 0;">${customerEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">金額</td><td style="padding: 8px 0;">NT$ ${amount.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">錯誤訊息</td><td style="padding: 8px 0; color: #dc2626;">${errorMessage}</td></tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${adminUrl}" style="display: inline-block; background: #dc2626; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              前往後台處理 →
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">
            請至後台手動重新開立發票，或聯繫 ezPay 確認問題。
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Team invoice failed email error:", error);
    throw error;
  }
  return data;
}

// ===== 試用名單：通知團隊 =====
interface NotifyTrialLeadParams {
  name: string;
  email: string;
  phone?: string | null;
}

export async function notifyTrialLead(params: NotifyTrialLeadParams) {
  const { name, email, phone } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw"}/admin/trial-leads`;

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    subject: `🎁 新試用名單：${name}（${email}）`,
    html: `
      <div style="font-family: 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #06b6d4); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; font-size: 20px; margin: 0;">🎁 新社群文案機器人試用申請</h1>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #E2E8F0; border-top: 0; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748B; width: 80px;">姓名</td>
              <td style="padding: 8px 0; color: #1E293B; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">Email</td>
              <td style="padding: 8px 0; color: #1E293B;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">手機</td>
              <td style="padding: 8px 0; color: #1E293B;">${phone || "未填寫"}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${adminUrl}" style="display: inline-block; background: #059669; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              查看所有試用名單 →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Trial lead notify email error:", error);
  }
  return data;
}

// ===== 試用名單：寄送社群文案機器人連結給用戶 =====
interface SendTrialAgentEmailParams {
  email: string;
  name: string;
}

export async function sendTrialAgentEmail(params: SendTrialAgentEmailParams) {
  const { email, name } = params;
  const agentUrl = process.env.TRIAL_AGENT_URL || "https://chatgpt.com";
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw";

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: email,
    subject: "🎁 你的免費社群文案機器人已開通！",
    html: `
      <div style="font-family: -apple-system, 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #059669, #06b6d4); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">🎁 免費試用已開通</h1>
          <p style="color: #a7f3d0; font-size: 14px; margin: 0;">社群文案機器人 — AI 幫你寫貼文</p>
        </div>
        <div style="background: #fff; padding: 32px 24px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            ${name} 你好，<br><br>
            感謝你申請惠邦行銷的社群文案機器人免費試用！點擊下方按鈕即可開始使用：
          </p>

          <div style="text-align: center; padding: 24px; background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; margin: 0 0 24px 0;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 16px 0;">
              🤖 你的專屬社群文案機器人
            </p>
            <a href="${agentUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669, #06b6d4); color: #fff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              立即開始使用 →
            </a>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
              ⚡ <strong>使用說明：</strong><br>
              • 需要 ChatGPT 帳號（免費版即可使用）<br>
              • 告訴它你的品牌和產業，它會幫你產出貼文<br>
              • 支援 Facebook、Instagram、LINE 等平台文案<br>
              • 不限使用次數，永久有效
            </p>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
            <p style="color: #1e40af; font-size: 13px; line-height: 1.5; margin: 0;">
              💡 <strong>想要更多 AI 行銷工具？</strong><br>
              我們有完整的 AI 個體包，包含 9 位專業 AI Agent，涵蓋社群經營、廣告投放、數據分析等。現在限時優惠只要 <strong>NT$999</strong>！
            </p>
            <div style="text-align: center; margin-top: 12px;">
              <a href="${siteUrl}/ai/restaurant-pack" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                了解 AI 個體包 →
              </a>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            惠邦行銷｜讓每個品牌都找到對的人<br>
            如有問題，歡迎回覆此信件聯繫我們
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Send trial agent email error:", error);
    throw error;
  }
  return data;
}

// ===== 深度社群健診：客戶報告通知信 =====
interface NotifyDiagnosticCustomerParams {
  email: string;
  contactName: string;
  submissionId: string;
  overallScore: number;
  healthLevel: string;
}

export async function notifyDiagnosticCustomer(params: NotifyDiagnosticCustomerParams) {
  const { email, contactName, submissionId, overallScore, healthLevel } = params;
  const resultUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw"}/diagnostic/result/${submissionId}`;

  const levelColor =
    healthLevel === "良好" ? "#22c55e" :
    healthLevel === "尚可" ? "#3b82f6" :
    healthLevel === "待改善" ? "#f59e0b" : "#ef4444";

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: email,
    subject: `你的社群帳號深度健診報告已完成 🎯`,
    html: `
      <div style="font-family: -apple-system, 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px 0;">社群帳號深度健診報告</h1>
          <p style="color: #c4b5fd; font-size: 14px; margin: 0;">你的專屬社群診斷分析</p>
        </div>
        <div style="background: #fff; padding: 32px 24px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            ${contactName} 你好，<br><br>
            AI 已完成你的社群帳號深度健診分析，以下是你的帳號健康概覽：
          </p>
          <div style="text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; margin: 0 0 24px 0;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">社群健康總分</p>
            <div style="font-size: 52px; font-weight: 800; color: ${levelColor}; margin: 0 0 4px 0;">${overallScore}</div>
            <p style="color: ${levelColor}; font-size: 15px; font-weight: 700; margin: 0;">${healthLevel}</p>
          </div>
          <div style="text-align: center; margin: 0 0 24px 0;">
            <a href="${resultUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              查看完整健診報告 →
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
            報告包含：第一印象診斷、內容策略分析、數據盲點、優先改善清單，以及本週就能執行的具體行動步驟。
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            惠邦行銷｜讓每個品牌都找到對的人<br>
            如有問題，歡迎回覆此信件聯繫我們
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Diagnostic customer email error:", error);
    throw error;
  }
  return data;
}

// ===== 深度社群健診：團隊通知信 =====
interface NotifyTeamDiagnosticParams {
  contactName: string;
  email: string;
  submissionId: string;
}

export async function notifyTeamDiagnostic(params: NotifyTeamDiagnosticParams) {
  const { contactName, email, submissionId } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://huibang.com.tw"}/admin/diagnostic/${submissionId}`;

  const { data, error } = await resend.emails.send({
    from: "惠邦行銷 <hello@huibang.com.tw>",
    replyTo: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    to: process.env.NOTIFY_EMAIL || "service@huibang.com.tw",
    subject: `🔍 新深度健診提交：${contactName}（${email}）`,
    html: `
      <div style="font-family: 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; font-size: 20px; margin: 0;">🔍 新深度社群健診提交</h1>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; width: 100px;">聯絡人</td><td style="padding: 8px 0; font-weight: 600;">${contactName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${adminUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              查看健診報告 →
            </a>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Team diagnostic email error:", error);
    throw error;
  }
  return data;
}
