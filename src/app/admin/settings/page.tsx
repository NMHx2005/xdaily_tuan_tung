import { AdminSettingsClient } from "@/components/admin/settings/admin-settings-client";

export const metadata = { title: "Cài đặt cửa hàng" };

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Cài đặt</h1>
      <AdminSettingsClient />
    </div>
  );
}
