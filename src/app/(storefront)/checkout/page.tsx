import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPageClient } from "@/components/storefront/checkout/checkout-page-client";

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Hoàn tất đơn hàng tại XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Thanh toán | XDAILY",
    description: "Hoàn tất đơn hàng tại XDAILY.",
    url: "/checkout",
  },
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageClient />
    </Suspense>
  );
}
