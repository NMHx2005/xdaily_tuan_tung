"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Package, User, Lock, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Chờ xác nhận", variant: "outline" },
  CONFIRMED: { label: "Đã xác nhận", variant: "secondary" },
  PROCESSING: { label: "Đang xử lý", variant: "secondary" },
  SHIPPING: { label: "Đang giao hàng", variant: "default" },
  DELIVERED: { label: "Đã giao", variant: "default" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
};

const quickLinks = [
  { label: "Đơn hàng của tôi", href: "/account/orders", icon: Package },
  { label: "Thông tin cá nhân", href: "/account/profile", icon: User },
  { label: "Đổi mật khẩu", href: "/account/password", icon: Lock },
];

export function AccountDashboardClient() {
  const { data: session } = useSession();
  const { data: orders, isLoading } = trpc.order.getMyOrders.useQuery(
    undefined,
    { enabled: !!session }
  );

  const recentOrders = orders?.slice(0, 3) ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">
        Xin chào, {session?.user?.name || "bạn"}!
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Quản lý tài khoản và đơn hàng của bạn
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-4 rounded-lg border p-5 transition-colors hover:bg-neutral-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Icon className="h-5 w-5 text-neutral-600" />
              </div>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-4 rounded-lg border p-5 text-left transition-colors hover:bg-red-50 hover:border-red-200"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <LogOut className="h-5 w-5 text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-600">Đăng xuất</span>
        </button>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Đơn hàng gần đây</h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">
            Bạn chưa có đơn hàng nào.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => {
              const status = statusMap[order.status] ?? {
                label: order.status,
                variant: "outline" as const,
              };
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium font-mono">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDate(new Date(order.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-sm font-semibold">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
