"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/server/trpc";
import { trpc } from "@/lib/trpc/client";
import { formatDate, formatPrice } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/order-status-badge";
import { OrderStatusTimeline } from "@/components/admin/orders/order-status-timeline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type OrderDetail = inferRouterOutputs<AppRouter>["order"]["getDetail"];

const METHOD_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

export function OrderDetailClient({ order: initial }: { order: OrderDetail }) {
  const router = useRouter();
  const [order, setOrder] = React.useState(initial);
  const [nextStatus, setNextStatus] = React.useState(initial.status);

  React.useEffect(() => {
    setOrder(initial);
    setNextStatus(initial.status);
  }, [initial]);

  const updateMut = trpc.order.updateStatus.useMutation({
    onSuccess: (_, vars) => {
      toast.success("Đã cập nhật trạng thái");
      setOrder((o) => ({ ...o, status: vars.status }));
      setNextStatus(vars.status);
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-mono text-xl font-bold">{order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground">
              Đặt lúc {formatDate(new Date(order.createdAt))}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium">Ảnh</th>
                  <th className="px-4 py-3 font-medium">Sản phẩm</th>
                  <th className="px-4 py-3 font-medium">Biến thể</th>
                  <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                  <th className="px-4 py-3 font-medium text-center">SL</th>
                  <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const slug = item.product?.slug;
                  return (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                        {slug && (
                          <Link
                            href={`${SITE_URL}/products/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Xem SP
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.variantName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span className="tabular-nums">{formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giảm giá</span>
              <span className="tabular-nums">-{formatPrice(order.discount)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Tổng cộng</span>
              <span className="tabular-nums text-primary">
                {formatPrice(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Chọn trạng thái mới
              </p>
              <Select
                value={nextStatus}
                onValueChange={(v) => setNextStatus(v as typeof nextStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                className="w-full"
                disabled={
                  updateMut.isPending || nextStatus === order.status
                }
                onClick={() =>
                  updateMut.mutate({ id: order.id, status: nextStatus })
                }
              >
                Cập nhật
              </Button>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Tiến trình
              </p>
              <OrderStatusTimeline status={order.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giao hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.shippingName}</p>
            <p>{order.shippingPhone}</p>
            <p className="text-muted-foreground">{order.shippingEmail}</p>
            <p className="pt-2 leading-relaxed">
              {order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict},{" "}
              {order.shippingCity}
            </p>
            {order.shippingNote && (
              <p className="pt-2 text-muted-foreground">
                Ghi chú: {order.shippingNote}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
            <PaymentStatusBadge status={order.paymentStatus} />
            {order.paymentTransactionId && (
              <p className="pt-2 font-mono text-xs">
                Mã GD: {order.paymentTransactionId}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
