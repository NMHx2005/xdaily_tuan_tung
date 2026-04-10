"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/stores/cart-store";
import { useCartStore } from "@/stores/cart-store";

/**
 * Chỉ dùng dữ liệu persist sau khi client mount — trùng với SSR (giỏ rỗng, count 0),
 * tránh hydration mismatch với useSyncExternalStore + zustand rehydrate.
 */
export function useCart() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  const cart = useCartStore();

  if (!ready) {
    return {
      items: [] as CartItem[],
      addItem: cart.addItem,
      removeItem: cart.removeItem,
      updateQuantity: cart.updateQuantity,
      clearCart: cart.clearCart,
      subtotal: 0,
      itemCount: 0,
    };
  }

  return {
    items: cart.items,
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    updateQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
    subtotal: cart.getSubtotal(),
    itemCount: cart.getItemCount(),
  };
}
