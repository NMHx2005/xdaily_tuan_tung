import type { Metadata } from "next";
import Link from "next/link";
import { PolicyShell } from "@/components/storefront/policy/policy-shell";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Chính sách vận chuyển",
  description: `Phạm vi giao hàng, phí và thời gian giao tại ${SITE_NAME}.`,
  alternates: { canonical: "/chinh-sach-van-chuyen" },
};

export default function ChinhSachVanChuyenPage() {
  return (
    <PolicyShell title="Chính sách vận chuyển">
      <p>
        Chúng tôi giao hàng tới các khu vực được hỗ trợ trên website. Phí và thời
        gian có thể thay đổi theo mùa hoặc chương trình — giá trên đơn thanh toán
        là căn cứ cuối cùng.
      </p>
      <h2>Phạm vi &amp; thời gian</h2>
      <p>
        Đơn nội thành thường giao nhanh hơn đơn liên tỉnh. Thời gian ước tính được
        hiển thị khi đặt hàng hoặc xác nhận qua điện thoại.
      </p>
      <h2>Phí vận chuyển</h2>
      <p>
        Phí có thể miễn hoặc giảm theo chương trình. Mức phí cụ thể hiển thị ở bước
        thanh toán.
      </p>
      <h2>Kiểm tra khi nhận</h2>
      <p>
        Quý khách nên kiểm tra tình trạng bên ngoài và số lượng kiện khi nhận. Mọi
        khiếu nại về hư hỏng vận chuyển nên được thông báo sớm qua{" "}
        <Link href="/contact">kênh liên hệ</Link>.
      </p>
    </PolicyShell>
  );
}
