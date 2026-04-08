import Link from "next/link";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { createCaller } from "@/lib/trpc/server";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800 border-blue-200" },
  PROCESSING: { label: "Đang xử lý", className: "bg-purple-100 text-purple-800 border-purple-200" },
  SHIPPING: { label: "Đang giao", className: "bg-orange-100 text-orange-800 border-orange-200" },
  DELIVERED: { label: "Đã giao", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800 border-red-200" },
};

export default async function AdminDashboard() {
  const trpc = await createCaller();
  const [stats, recentOrders] = await Promise.all([
    trpc.admin.getDashboardStats(),
    trpc.admin.getRecentOrders(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Doanh thu tháng này"
          value={formatPrice(stats.revenue)}
          icon={DollarSign}
          description="Đơn hàng đã giao"
        />
        <StatsCard
          title="Đơn hàng tháng này"
          value={String(stats.orderCount)}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Khách hàng"
          value={String(stats.customerCount)}
          icon={Users}
        />
        <StatsCard
          title="Sản phẩm"
          value={String(stats.productCount)}
          icon={Package}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Đơn hàng gần đây</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Mã đơn</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Khách hàng</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Tổng tiền</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Ngày đặt</th>
                <th className="px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const status = statusMap[order.status] ?? {
                  label: order.status,
                  className: "bg-neutral-100 text-neutral-800",
                };
                return (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name ?? order.shippingName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.email ?? order.shippingEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border text-xs ${status.className}`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(new Date(order.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
