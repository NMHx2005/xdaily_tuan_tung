"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  const [isHydrated, setIsHydrated] = useState(false);
  const cart = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return {
      items: [],
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
