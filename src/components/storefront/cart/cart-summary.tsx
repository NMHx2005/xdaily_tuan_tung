"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function CartSummary() {
  const { subtotal } = useCart();

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : DEFAULT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="text-lg font-bold">Tóm tắt đơn hàng</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Tạm tính:</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Phí vận chuyển:</span>
          <span className={isFreeShipping ? "font-medium text-green-600" : "font-medium"}>
            {isFreeShipping ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="text-base font-bold">Tổng cộng:</span>
          <span className="text-lg font-bold">{formatPrice(total)}</span>
        </div>
      </div>

      <Link href="/checkout">
        <Button className="w-full h-12 text-base font-semibold">
          Thanh toán
        </Button>
      </Link>

      <Link
        href="/"
        className="block text-center text-sm text-neutral-500 transition-colors hover:text-neutral-700"
      >
        Tiếp tục mua sắm
      </Link>

      {!isFreeShipping && (
        <p className="text-xs text-neutral-400 text-center">
          Miễn phí vận chuyển cho đơn hàng từ {formatPrice(FREE_SHIPPING_THRESHOLD)}
        </p>
      )}
    </div>
  );
}
