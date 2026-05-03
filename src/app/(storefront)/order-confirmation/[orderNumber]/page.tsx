import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { createCaller } from "@/lib/trpc/server";
import { formatShippingAddressLine } from "@/lib/format-shipping-address";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
  description: `Xác nhận đơn hàng tại ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Đặt hàng thành công | ${SITE_NAME}`,
    description: `Xác nhận đơn hàng tại ${SITE_NAME}.`,
  },
};

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;

  let order = null;
  try {
    const trpc = await createCaller();
    order = await trpc.order.getById({ orderNumber });
  } catch {
    // Order not found or unauthorized — show minimal confirmation
  }

  const isFound = !!order;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center">
          {isFound ? (
            <CheckCircle className="h-20 w-20 text-green-500" />
          ) : (
            <CheckCircle className="h-20 w-20 text-neutral-300" />
          )}
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold">
          {isFound ? "Đặt hàng thành công!" : "Thông tin đơn hàng"}
        </h1>
        <p className="mt-2 text-neutral-600">
          {isFound
            ? "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý."
            : "Không thể tải chi tiết đơn hàng. Vui lòng đăng nhập để xem."}
        </p>
      </div>

      <div className="mt-8 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Mã đơn hàng</span>
          <span className="font-mono text-lg font-bold">{orderNumber}</span>
        </div>

        {order && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name}
                    {item.variantName && ` - ${item.variantName}`}
                    <span className="text-neutral-500"> x{item.quantity}</span>
                  </span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phí vận chuyển</span>
                <span className={order.shippingFee === 0 ? "text-green-600" : ""}>
                  {order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-1 text-sm text-neutral-600">
              <p><span className="font-medium">Người nhận:</span> {order.shippingName}</p>
              <p><span className="font-medium">SĐT:</span> {order.shippingPhone}</p>
              <p><span className="font-medium">Địa chỉ:</span> {formatShippingAddressLine(order)}</p>
              <p><span className="font-medium">Thanh toán:</span> {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/">
          <Button variant="outline" className="w-full sm:w-auto">
            Tiếp tục mua sắm
          </Button>
        </Link>
        <Link href="/account/orders">
          <Button className="w-full sm:w-auto">
            Xem đơn hàng
          </Button>
        </Link>
      </div>
    </div>
  );
}
