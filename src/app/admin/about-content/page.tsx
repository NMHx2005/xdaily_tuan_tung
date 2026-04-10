import { AdminAboutContentClient } from "@/components/admin/about/admin-about-content-client";

export const metadata = { title: "Trang Giới thiệu — Admin" };

export default function AdminAboutContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Nội dung trang Giới thiệu</h1>
      <AdminAboutContentClient />
    </div>
  );
}
