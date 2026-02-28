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
    from: "惠邦行銷問卷系統 <noreply@huibang.com.tw>",
    to: process.env.NOTIFY_EMAIL || "team@huibang.com",
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
