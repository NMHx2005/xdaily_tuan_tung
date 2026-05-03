import type { Metadata } from "next";
import Link from "next/link";
import { PolicyShell } from "@/components/storefront/policy/policy-shell";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: `Điều kiện sử dụng website và dịch vụ của ${SITE_NAME}.`,
  alternates: { canonical: "/dieu-khoan-su-dung" },
};

export default function DieuKhoanSuDungPage() {
  return (
    <PolicyShell title="Điều khoản sử dụng">
      <p>
        Vui lòng đọc kỹ trước khi sử dụng website. Nếu không đồng ý, vui lòng
        ngừng truy cập. Việc tiếp tục sử dụng đồng nghĩa bạn chấp nhận các điều
        khoản sau và <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>.
      </p>
      <h2>Nội dung &amp; giá</h2>
      <p>
        Hình ảnh, mô tả và giá có thể được điều chỉnh để phản ánh đúng tồn kho và
        chương trình khuyến mãi. Giá thanh toán trên đơn hợp lệ là căn cứ cuối
        cùng.
      </p>
      <h2>Đặt hàng</h2>
      <p>
        Đơn hàng được xem là có hiệu lực khi hệ thống ghi nhận thành công hoặc
        được xác nhận qua kênh chính thức của cửa hàng.
      </p>
      <h2>Trách nhiệm</h2>
      <p>
        Người dùng cam kết cung cấp thông tin trung thực, không lạm dụng dịch vụ
        cho mục đích gian lận hoặc vi phạm pháp luật.
      </p>
      <h2>Thay đổi điều khoản</h2>
      <p>
        Chúng tôi có thể cập nhật tài liệu này; phiên bản mới áp dụng khi đăng tải
        trên trang này trừ khi có thông báo khác.
      </p>
    </PolicyShell>
  );
}
