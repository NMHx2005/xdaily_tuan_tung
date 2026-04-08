import Link from "next/link";
import Image from "next/image";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { createCaller } from "@/lib/trpc/server";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/admin/stats-card";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/order-status-badge";

export default async function AdminDashboard() {
  const trpc = await createCaller();
  const [stats, recentOrders, topProducts] = await Promise.all([
    trpc.admin.getDashboardStats(),
    trpc.admin.getRecentOrders(),
    trpc.admin.getTopProducts(),
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

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Recent Orders — 2/3 width */}
        <div className="lg:col-span-2">
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">SP</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tổng tiền</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">TT</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Ngày</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">
                        {order.user?.name ?? order.shippingName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingPhone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(new Date(order.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products — 1/3 width */}
        <div>
          <h2 className="text-lg font-bold">Sản phẩm bán chạy</h2>
          <div className="mt-4 rounded-lg border bg-white">
            {topProducts.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu
              </p>
            ) : (
              <div className="divide-y">
                {topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.totalSold} đã bán · {formatPrice(p.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
