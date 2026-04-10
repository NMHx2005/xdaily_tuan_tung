import { AdminImageDomainsClient } from "@/components/admin/image-domains/admin-image-domains-client";

export const metadata = { title: "Domain ảnh — Admin" };

export default function AdminImageDomainsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Domain ảnh được phép</h1>
      <AdminImageDomainsClient />
    </div>
  );
}
