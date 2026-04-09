import "server-only";

import * as React from "react";
import type { Order, OrderItem } from "@prisma/client";

import {
  getResend,
  getResendFromAddress,
  isOrderConfirmationEmailEnabled,
} from "@/lib/email";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { OrderConfirmationEmail } from "@/lib/emails/order-confirmation";
import type { OrderConfirmationPayload } from "@/lib/emails/order-confirmation";

export type OrderWithItems = Order & { items: OrderItem[] };

export async function sendOrderConfirmationEmail(
  order: OrderWithItems
): Promise<void> {
  if (!isOrderConfirmationEmailEnabled()) return;
  const resend = getResend();
  if (!resend) return;

  const siteUrl = getSiteUrl();
  const logoUrl = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  const payload: OrderConfirmationPayload = {
    orderNumber: order.orderNumber,
    shippingName: order.shippingName,
    shippingPhone: order.shippingPhone,
    shippingEmail: order.shippingEmail,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingDistrict: order.shippingDistrict,
    shippingWard: order.shippingWard,
    shippingNote: order.shippingNote,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    createdAt: formatDate(order.createdAt),
    siteUrl,
    logoUrl,
    items: order.items.map((i) => ({
      name: i.name,
      variantName: i.variantName,
      price: i.price,
      quantity: i.quantity,
      imageUrl: i.image ? absoluteUrl(i.image) : logoUrl,
    })),
  };

  try {
    await resend.emails.send({
      from: getResendFromAddress(),
      to: order.shippingEmail,
      subject: `Xác nhận đơn hàng #${order.orderNumber}`,
      react: React.createElement(OrderConfirmationEmail, { order: payload }),
    });
  } catch (err) {
    console.error("[email] sendOrderConfirmationEmail:", err);
  }
}
