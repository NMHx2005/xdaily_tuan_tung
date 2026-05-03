import type { Metadata } from "next";
import { AccountProfileClient } from "@/components/storefront/auth/account-profile-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Thông tin cá nhân",
  description: `Cập nhật thông tin tài khoản ${SITE_NAME}.`,
  robots: { index: false, follow: true },
  openGraph: {
    title: `Thông tin cá nhân | ${SITE_NAME}`,
    url: "/account/profile",
  },
};

export default function AccountProfilePage() {
  return <AccountProfileClient />;
}
