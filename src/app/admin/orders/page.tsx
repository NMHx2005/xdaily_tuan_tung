import { OrdersListClient } from "@/components/admin/orders/orders-list-client";

export const metadata = { title: "Đơn hàng" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Đơn hàng</h1>
      <OrdersListClient />
    </div>
  );
}
