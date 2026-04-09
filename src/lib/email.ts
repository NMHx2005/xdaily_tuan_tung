import "server-only";
import { Resend } from "resend";

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
    "XDAILY <orders@xdaily.vn>"
  );
}
