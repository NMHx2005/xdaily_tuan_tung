"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  const hydrated = useSyncExternalStore(
    (onStoreChange) => {
      const unsub = useCartStore.persist.onFinishHydration(() => {
        onStoreChange();
      });
      if (useCartStore.persist.hasHydrated()) {
        queueMicrotask(onStoreChange);
      }
      return unsub;
    },
    () => useCartStore.persist.hasHydrated(),
    () => false
  );

  const cart = useCartStore();

  if (!hydrated) {
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
