"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { Separator } from "@/components/ui/separator";

const statusMap: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800 border-blue-200" },
  PROCESSING: { label: "Đang xử lý", className: "bg-purple-100 text-purple-800 border-purple-200" },
  SHIPPING: { label: "Đang giao hàng", className: "bg-orange-100 text-orange-800 border-orange-200" },
  DELIVERED: { label: "Đã giao", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800 border-red-200" },
};

export function OrderHistoryClient() {
  const { data: orders, isLoading } = trpc.order.getMyOrders.useQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tài khoản", href: "/account" },
          { label: "Đơn hàng" },
        ]}
      />

      <h1 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
        Đơn hàng của tôi
      </h1>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center py-16 text-center">
          <Package className="h-16 w-16 text-neutral-300" />
          <p className="mt-4 text-lg font-medium text-neutral-600">
            Bạn chưa có đơn hàng nào
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            Hãy bắt đầu mua sắm ngay!
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status] ?? {
              label: order.status,
              className: "bg-neutral-100 text-neutral-800",
            };
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className="rounded-lg border">
                <button
                  type="button"
                  onClick={() => toggleExpand(order.id)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold font-mono">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(new Date(order.createdAt))}
                      </p>
                    </div>
                    <Badge
                      className={`border text-xs ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      {formatPrice(order.total)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 py-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            {item.variantName && (
                              <p className="text-xs text-neutral-500">
                                {item.variantName}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-neutral-500">x{item.quantity}</p>
                            <p className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-neutral-500">
                        <span>Tạm tính</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Phí vận chuyển</span>
                        <span>
                          {order.shippingFee === 0
                            ? "Miễn phí"
                            : formatPrice(order.shippingFee)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Tổng cộng</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="text-xs text-neutral-500 space-y-0.5">
                      <p>
                        <span className="font-medium">Người nhận:</span>{" "}
                        {order.shippingName} — {order.shippingPhone}
                      </p>
                      <p>
                        <span className="font-medium">Địa chỉ:</span>{" "}
                        {order.shippingAddress}, {order.shippingWard},{" "}
                        {order.shippingDistrict}, {order.shippingCity}
                      </p>
                      <p>
                        <span className="font-medium">Thanh toán:</span>{" "}
                        {order.paymentMethod === "COD"
                          ? "Thanh toán khi nhận hàng"
                          : order.paymentMethod}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
