import type { Metadata } from "next";
import { OrderHistoryClient } from "@/components/storefront/auth/order-history-client";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  robots: { index: false },
};

export default function OrdersPage() {
  return <OrderHistoryClient />;
}
