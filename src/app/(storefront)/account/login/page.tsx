import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/components/storefront/auth/auth-page-client";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPageClient />
    </Suspense>
  );
}
