import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/components/storefront/auth/auth-page-client";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập tài khoản XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Đăng nhập | XDAILY",
    description: "Đăng nhập tài khoản XDAILY.",
    url: "/account/login",
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPageClient />
    </Suspense>
  );
}
