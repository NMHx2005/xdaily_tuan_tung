import "server-only";
import { Resend } from "resend";
import { SITE_NAME } from "@/lib/constants";

/**
 * Resend client — only constructed when `RESEND_API_KEY` is set.
 * Order confirmation emails send only when `ENABLE_ORDER_CONFIRMATION_EMAIL=true` and key exists.
 */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

/** Chỉ gửi khi bật rõ ràng (`ENABLE_ORDER_CONFIRMATION_EMAIL=true`) và có `RESEND_API_KEY`. */
export function isOrderConfirmationEmailEnabled(): boolean {
  const enabled = process.env.ENABLE_ORDER_CONFIRMATION_EMAIL?.trim().toLowerCase();
  if (enabled !== "true" && enabled !== "1") return false;
  return !!process.env.RESEND_API_KEY?.trim();
}

export function getResendFromAddress(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    `${SITE_NAME} <orders@xdaily.vn>`
  );
}

/** Gửi thông báo có tin nhắn liên hệ mới — bật `ENABLE_CONTACT_NOTIFICATION_EMAIL=true` và có `RESEND_API_KEY`. */
export function isContactNotificationEmailEnabled(): boolean {
  const enabled =
    process.env.ENABLE_CONTACT_NOTIFICATION_EMAIL?.trim().toLowerCase();
  if (enabled !== "true" && enabled !== "1") return false;
  return !!process.env.RESEND_API_KEY?.trim();
}

/** Email nhận thông báo liên hệ; fallback `CONTACT_NOTIFICATION_EMAIL` rỗng thì không gửi mail (vẫn lưu DB). */
export function getContactNotificationTo(): string | null {
  const to = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
  return to || null;
}
