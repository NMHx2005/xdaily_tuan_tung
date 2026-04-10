import type { Metadata } from "next";
import Link from "next/link";
import { PolicyShell } from "@/components/storefront/policy/policy-shell";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp (FAQ)",
  description: "Giải đáp nhanh về đặt hàng, giao nhận và bảo hành tại XDAILY.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <PolicyShell title="Câu hỏi thường gặp">
      <h2>Làm sao để đặt hàng?</h2>
      <p>
        Chọn sản phẩm → thêm giỏ → thanh toán. Xem chi tiết tại{" "}
        <Link href="/huong-dan-mua-hang">Hướng dẫn mua hàng</Link>.
      </p>
      <h2>Tôi có cần tài khoản để mua không?</h2>
      <p>
        Bạn có thể thanh toán với tư cách khách (guest) hoặc đăng nhập để theo dõi
        đơn trong tài khoản.
      </p>
      <h2>Thời gian giao hàng?</h2>
      <p>
        Phụ thuộc kho và địa chỉ. Thông tin ước tính hiển thị khi đặt hoặc được xác
        nhận qua hotline/email.
      </p>
      <h2>Đổi trả thế nào?</h2>
      <p>
        Xem <Link href="/chinh-sach-doi-tra">Chính sách đổi trả</Link> và liên hệ
        kèm mã đơn nếu cần hỗ trợ.
      </p>
    </PolicyShell>
  );
}
