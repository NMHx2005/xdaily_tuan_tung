import type { Metadata } from "next";
import Link from "next/link";
import { PolicyShell } from "@/components/storefront/policy/policy-shell";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: `Cách ${SITE_NAME} thu thập, sử dụng và bảo vệ dữ liệu cá nhân của khách hàng.`,
  alternates: { canonical: "/chinh-sach-bao-mat" },
};

export default function ChinhSachBaoMatPage() {
  return (
    <PolicyShell title="Chính sách bảo mật">
      <p>
        Tài liệu này giải thích cách chúng tôi xử lý thông tin khi bạn dùng website,
        form liên hệ hoặc dịch vụ liên quan. Bằng việc tiếp tục sử dụng, bạn chấp
        nhận các nguyên tắc dưới đây cùng{" "}
        <Link href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>.
      </p>
      <h2>Dữ liệu thu thập</h2>
      <p>
        Có thể gồm họ tên, email, số điện thoại, địa chỉ giao hàng, nội dung tin
        nhắn liên hệ và dữ liệu kỹ thuật cần thiết để vận hành (ví dụ cookie chức
        năng, nhật ký lỗi).
      </p>
      <h2>Mục đích sử dụng</h2>
      <ul>
        <li>Xử lý đơn hàng, giao hàng và hỗ trợ sau bán.</li>
        <li>Trả lời yêu cầu qua form liên hệ.</li>
        <li>Cải thiện trải nghiệm website và bảo mật.</li>
      </ul>
      <h2>Lưu trữ &amp; bảo vệ</h2>
      <p>
        Chúng tôi áp dụng biện pháp kỹ thuật và tổ chức phù hợp để giảm rủi ro truy
        cập trái phép, mất mát hoặc sai lệch dữ liệu.
      </p>
      <h2>Quyền của bạn</h2>
      <p>
        Bạn có thể yêu cầu cập nhật, xóa hoặc giải thích về dữ liệu cá nhân bằng
        cách liên hệ qua trang <Link href="/contact">Liên hệ</Link>, kèm email đã
        dùng trên hệ thống.
      </p>
    </PolicyShell>
  );
}
