import { AdminWebsiteClient } from "@/components/admin/website/admin-website-client";

export const metadata = { title: "Website & liên hệ — Admin" };

export default function AdminWebsitePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Website &amp; liên hệ</h1>
      <AdminWebsiteClient />
    </div>
  );
}
