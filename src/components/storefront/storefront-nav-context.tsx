"use client";

import { createContext, useContext } from "react";
import type { StorefrontNavItem } from "@/lib/storefront-nav";

const StorefrontNavContext = createContext<StorefrontNavItem[]>([]);

export function StorefrontNavProvider({
  nav,
  children,
}: {
  nav: StorefrontNavItem[];
  children: React.ReactNode;
}) {
  return (
    <StorefrontNavContext.Provider value={nav}>
      {children}
    </StorefrontNavContext.Provider>
  );
}

export function useStorefrontNav(): StorefrontNavItem[] {
  return useContext(StorefrontNavContext);
}
