import type { Metadata } from "next";
import { AdminContactMessagesClient } from "@/components/admin/contact/admin-contact-messages-client";

export const metadata: Metadata = {
  title: "Tin nhắn liên hệ | Admin",
};

export default function AdminContactMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tin nhắn liên hệ</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tin gửi từ form trang Liên hệ (lưu database; email thông báo tùy cấu hình
          Resend).
        </p>
      </div>
      <AdminContactMessagesClient />
    </div>
  );
}
