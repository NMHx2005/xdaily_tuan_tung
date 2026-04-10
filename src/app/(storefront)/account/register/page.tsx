import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/components/storefront/auth/auth-page-client";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Đăng ký | XDAILY",
    description: "Tạo tài khoản XDAILY.",
    url: "/account/register",
  },
};

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthPageClient initialTab="register" />
    </Suspense>
  );
}
