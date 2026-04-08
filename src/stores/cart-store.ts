import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemData {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
}

interface CartState {
  items: CartItemData[];
  itemCount: number;
  addItem: (item: Omit<CartItemData, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

function calcItemCount(items: CartItemData[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          let items: CartItemData[];
          if (existing) {
            items = state.items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          } else {
            items = [...state.items, { ...item, quantity }];
          }

          return { items, itemCount: calcItemCount(items) };
        }),

      removeItem: (productId, variantId) =>
        set((state) => {
          const items = state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          );
          return { items, itemCount: calcItemCount(items) };
        }),

      updateQuantity: (productId, quantity, variantId) =>
        set((state) => {
          if (quantity <= 0) {
            const items = state.items.filter(
              (i) => !(i.productId === productId && i.variantId === variantId)
            );
            return { items, itemCount: calcItemCount(items) };
          }

          const items = state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          );
          return { items, itemCount: calcItemCount(items) };
        }),

      clearCart: () => set({ items: [], itemCount: 0 }),
    }),
    { name: 'xdaily-cart' }
  )
);
