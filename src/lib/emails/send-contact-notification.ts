import "server-only";

import {
  getContactNotificationTo,
  getResend,
  getResendFromAddress,
  isContactNotificationEmailEnabled,
} from "@/lib/email";
import { getSiteUrl } from "@/lib/seo";

export async function sendContactNotificationEmail(payload: {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}): Promise<void> {
  if (!isContactNotificationEmailEnabled()) return;
  const to = getContactNotificationTo();
  if (!to) return;

  const resend = getResend();
  if (!resend) return;

  const site = getSiteUrl();
  const phoneLine =
    payload.phone && payload.phone.trim() !== ""
      ? `<p><strong>SĐT:</strong> ${escapeHtml(payload.phone)}</p>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <h2>Tin nhắn liên hệ mới</h2>
  <p><strong>Họ tên:</strong> ${escapeHtml(payload.name)}</p>
  <p><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
  ${phoneLine}
  <p><strong>Nội dung:</strong></p>
  <pre style="white-space: pre-wrap; background: #f4f4f5; padding: 12px; border-radius: 8px;">${escapeHtml(payload.message)}</pre>
  <p style="font-size: 12px; color: #71717a;">Nguồn: ${escapeHtml(site)}/contact</p>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: getResendFromAddress(),
      to,
      subject: `[Liên hệ] ${payload.name}`,
      html,
    });
  } catch (err) {
    console.error("[email] sendContactNotificationEmail:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
