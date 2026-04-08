"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import type { CartItem as CartItemType } from "@/stores/cart-store";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  function handleDecrease() {
    if (item.quantity <= 1) {
      handleRemove();
      return;
    }
    updateQuantity(item.id, item.quantity - 1);
  }

  function handleIncrease() {
    updateQuantity(item.id, item.quantity + 1);
  }

  function handleRemove() {
    removeItem(item.id);
    toast.success("Đã xóa khỏi giỏ hàng");
  }

  return (
    <div className="flex gap-3">
      <Link
        href={`/products/${item.slug}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-medium line-clamp-2 hover:text-gold transition-colors"
          >
            {item.name}
          </Link>
          {item.variantName && (
            <p className="mt-0.5 text-xs text-neutral-500">
              {item.variantName}
            </p>
          )}
          <p className="mt-0.5 text-sm font-semibold">
            {formatPrice(item.price)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleDecrease}
              className="flex h-7 w-7 items-center justify-center rounded-l border text-neutral-600 transition-colors hover:bg-neutral-50"
              aria-label="Giảm"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 w-8 items-center justify-center border-y text-xs font-medium">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={item.quantity >= item.maxStock}
              className="flex h-7 w-7 items-center justify-center rounded-r border text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
              aria-label="Tăng"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="p-1 text-neutral-400 transition-colors hover:text-red-500"
            aria-label="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
