"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export function OrderReview() {
  const { items, subtotal } = useCart();

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : DEFAULT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-lg font-bold">Đơn hàng của bạn</h2>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="48px"
                className="object-cover"
              />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-600 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.variantName && (
                  <p className="text-xs text-neutral-500">{item.variantName}</p>
                )}
              </div>
              <p className="ml-2 flex-shrink-0 text-sm font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Tạm tính:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Phí vận chuyển:</span>
          <span className={isFreeShipping ? "text-green-600" : ""}>
            {isFreeShipping ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between">
        <span className="text-base font-bold">Tổng cộng:</span>
        <span className="text-xl font-bold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
