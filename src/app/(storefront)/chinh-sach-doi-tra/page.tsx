import type { Metadata } from "next";
import Link from "next/link";
import { PolicyShell } from "@/components/storefront/policy/policy-shell";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Chính sách đổi trả",
  description: `Điều kiện đổi, trả hàng và hoàn tiền tại ${SITE_NAME}.`,
  alternates: { canonical: "/chinh-sach-doi-tra" },
};

export default function ChinhSachDoiTraPage() {
  return (
    <PolicyShell title="Chính sách đổi trả">
      <p>
        Chính sách này mô tả nguyên tắc chung. Chi tiết áp dụng theo từng đơn hàng
        và thông báo tại thời điểm mua — khi cần, hãy{" "}
        <Link href="/contact">liên hệ</Link> kèm mã đơn.
      </p>
      <h2>Thời hạn</h2>
      <p>
        Trong trường hợp sản phẩm lỗi do nhà sản xuất hoặc sai khác mô tả đáng kể,
        khách hàng có thể yêu cầu đổi/trả trong khoảng thời gian thông báo trên
        phiếu giao hoặc email xác nhận (thường 7 ngày kể từ nhận hàng, trừ hàng
        order đặc biệt).
      </p>
      <h2>Điều kiện</h2>
      <ul>
        <li>Còn đầy đủ phụ kiện, bao bì (nếu có) và hóa đơn/chứng từ liên quan.</li>
        <li>
          Sản phẩm chưa qua sử dụng bất thường so với kiểm tra ban đầu (trừ lỗi kỹ
          thuật).
        </li>
      </ul>
      <h2>Hoàn tiền</h2>
      <p>
        Hoàn tiền (nếu áp dụng) được xử lý theo phương thức thanh toán gốc trong
        thời gian xử lý ngân hàng/ví điện tử.
      </p>
    </PolicyShell>
  );
}
