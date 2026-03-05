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
    replyTo: process.env.NOTIFY_EMAIL || "chief@huibang.com.tw",
    to: process.env.NOTIFY_EMAIL || "chief@huibang.com.tw",
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
    replyTo: process.env.NOTIFY_EMAIL || "chief@huibang.com.tw",
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
    replyTo: process.env.NOTIFY_EMAIL || "chief@huibang.com.tw",
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
    replyTo: process.env.NOTIFY_EMAIL || "chief@huibang.com.tw",
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
    replyTo: process.env.NOTIFY_EMAIL || "chief@huibang.com.tw",
    to: process.env.NOTIFY_EMAIL || "chief@huibang.com.tw",
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
