import type { Metadata } from "next";
import { OrderHistoryClient } from "@/components/storefront/auth/order-history-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  description: `Lịch sử đơn hàng tại ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Đơn hàng của tôi | ${SITE_NAME}`,
    description: `Lịch sử đơn hàng tại ${SITE_NAME}.`,
    url: "/account/orders",
  },
};

export default function OrdersPage() {
  return <OrderHistoryClient />;
}
