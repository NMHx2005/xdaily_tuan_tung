import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPageClient } from "@/components/storefront/checkout/checkout-page-client";

export const metadata: Metadata = {
  title: "Thanh toán",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageClient />
    </Suspense>
  );
}
