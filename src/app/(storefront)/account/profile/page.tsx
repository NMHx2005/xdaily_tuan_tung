import type { Metadata } from "next";
import { AccountProfileClient } from "@/components/storefront/auth/account-profile-client";

export const metadata: Metadata = {
  title: "Thông tin cá nhân",
  description: "Cập nhật thông tin tài khoản XDAILY.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Thông tin cá nhân | XDAILY",
    url: "/account/profile",
  },
};

export default function AccountProfilePage() {
  return <AccountProfileClient />;
}
