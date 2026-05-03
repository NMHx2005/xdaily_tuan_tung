import type { Metadata } from "next";
import Link from "next/link";
import { PolicyShell } from "@/components/storefront/policy/policy-shell";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hướng dẫn mua hàng",
  description: `Các bước đặt hàng, thanh toán và nhận sản phẩm tại ${SITE_NAME}.`,
  alternates: { canonical: "/huong-dan-mua-hang" },
};

export default function HuongDanMuaHangPage() {
  return (
    <PolicyShell title="Hướng dẫn mua hàng">
      <p>
        Dưới đây là quy trình mua hàng trực tuyến tại website. Nếu cần hỗ trợ thêm,
        vui lòng{" "}
        <Link href="/contact">liên hệ</Link> hoặc gọi hotline trên trang chủ.
      </p>
      <h2>1. Chọn sản phẩm</h2>
      <p>
        Duyệt danh mục hoặc tìm kiếm theo tên sản phẩm. Vào trang chi tiết để xem
        mô tả, hình ảnh và thêm vào giỏ hàng.
      </p>
      <h2>2. Giỏ hàng &amp; thanh toán</h2>
      <p>
        Kiểm tra số lượng trong giỏ, sau đó chuyển tới bước thanh toán. Điền đầy
        đủ thông tin giao hàng và chọn phương thức thanh toán phù hợp.
      </p>
      <h2>3. Xác nhận đơn</h2>
      <p>
        Sau khi đặt hàng thành công, bạn sẽ nhận mã đơn (nếu có email). Đội ngũ có
        thể liên hệ để xác nhận trước khi giao.
      </p>
      <h2>4. Giao hàng</h2>
      <p>
        Thời gian giao phụ thuộc khu vực và tình trạng kho. Xem thêm{" "}
        <Link href="/chinh-sach-van-chuyen">chính sách vận chuyển</Link>.
      </p>
    </PolicyShell>
  );
}
