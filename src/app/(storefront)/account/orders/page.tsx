import type { Metadata } from "next";
import { OrderHistoryClient } from "@/components/storefront/auth/order-history-client";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  description: "Lịch sử đơn hàng tại XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Đơn hàng của tôi | XDAILY",
    description: "Lịch sử đơn hàng tại XDAILY.",
    url: "/account/orders",
  },
};

export default function OrdersPage() {
  return <OrderHistoryClient />;
}
