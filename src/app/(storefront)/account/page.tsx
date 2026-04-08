import type { Metadata } from "next";
import { AccountDashboardClient } from "@/components/storefront/auth/account-dashboard-client";

export const metadata: Metadata = {
  title: "Tài khoản",
  robots: { index: false },
};

export default function AccountPage() {
  return <AccountDashboardClient />;
}
