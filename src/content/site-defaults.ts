/**
 * Giá trị mặc định trong code (khi DB chưa có hoặc lỗi định dạng).
 *
 * Trên production: chỉnh nội dung tại **Quản trị → Cài đặt → Nội dung website** (JSON).
 * Nút **Nạp mẫu** lấy đúng cấu trúc này để sửa rồi **Lưu**.
 */
export const defaultSiteContent = {
  siteBrand: {
    name: "XDAILY",
    footerTagline:
      "Nhà máy nội thất XDAILY — Cung cấp ghế, bàn, sofa cao cấp cho mọi không gian.",
  },
  siteContact: {
    hotlineDigits: "0845220066",
    hotlineDisplay: "0845 220 066",
    email: "contact@xdaily.vn",
    address:
      "Showroom: 123 Đường Võ Văn Kiệt, Phường Cầu Ông Lãnh, Quận 1, TP. Hồ Chí Minh",
    openingHours: "Thứ 2 – Thứ 7: 8h00 – 18h00 · Chủ nhật: nghỉ",
  },
  contactPageContent: {
    meta: {
      title: "Liên hệ",
      description:
        "Liên hệ XDAILY — hotline, email, địa chỉ showroom và form gửi yêu cầu tư vấn nội thất.",
      openGraphTitle: "Liên hệ | XDAILY",
    },
    hero: {
      title: "Liên hệ",
      lead:
        "Đội ngũ XDAILY hỗ trợ tư vấn sản phẩm, báo giá và chăm sóc sau mua. Hãy để lại tin nhắn hoặc liên hệ trực tiếp qua hotline.",
    },
    bottomHint: {
      prefix: "Mua hàng online?",
      linkProductsLabel: "Xem sản phẩm",
      linkCartLabel: "Giỏ hàng",
    },
    cardLabels: {
      address: "Địa chỉ",
      hotline: "Hotline",
      email: "Email",
      hours: "Giờ làm việc",
      mapOpen: "Mở bản đồ",
      call: "Gọi ngay",
      sendEmail: "Gửi email",
    },
  },
  aboutPageContent: {
    meta: {
      title: "Giới thiệu",
      description:
        "XDAILY — nhà máy & thương hiệu nội thất: ghế ăn, bàn trà, sofa… đồng hành không gian sống hiện đại.",
      openGraphTitle: "Giới thiệu | XDAILY",
    },
    organizationJsonLd: {
      description:
        "Thương hiệu nội thất XDAILY — ghế ăn, bàn trà, ghế bar, sofa và giải pháp trang trí cho nhà ở.",
    },
    hero: {
      h1: "Giới thiệu XDAILY",
      lead:
        "Chúng tôi tin rằng nội thất tốt không chỉ đẹp — mà còn phải bền, phù hợp không gian và phục vụ đúng nhu cầu từng gia đình.",
    },
    stats: [
      { value: "10+", label: "Năm kinh nghiệm ngành" },
      { value: "500+", label: "Mẫu sản phẩm & biến thể" },
      { value: "63", label: "Tỉnh thành phục vụ" },
      { value: "24/7", label: "Hỗ trợ đặt hàng online" },
    ],
    story: {
      imageAlt: "Không gian trưng bày nội thất XDAILY",
      eyebrow: "Câu chuyện thương hiệu",
      title: "Đồng hành cùng không gian sống hiện đại",
      body:
        "XDAILY xuất phát từ nhu cầu mang nội thất có thiết kế rõ ràng, chất lượng ổn định và mức giá minh bạch đến tay người tiêu dùng. Chúng tôi kết hợp sản xuất nội địa với nhập khẩu linh kiện — để mỗi sản phẩm đều có lộ trình kiểm định trước khi đến showroom và website.",
      primaryCta: { label: "Xem sản phẩm", href: "/collections" },
      secondaryCta: { label: "Liên hệ tư vấn", href: "/contact" },
    },
    pillars: [
      {
        icon: "factory" as const,
        title: "Sản xuất & nhập khẩu",
        text: "Hệ thống nhà xưởng và đối tác nhập khẩu giúp kiểm soát chất lượng và giá thành hợp lý.",
      },
      {
        icon: "sparkles" as const,
        title: "Thiết kế bền vững",
        text: "Ưu tiên vật liệu an toàn, form dáng hiện đại phù hợp xu hướng và nhu cầu gia đình Việt.",
      },
      {
        icon: "heartHandshake" as const,
        title: "Phục vụ tận tâm",
        text: "Tư vấn trước mua, đóng gói cẩn thận và đồng hành sau bán — minh bạch trong mọi giao dịch.",
      },
    ],
    sections: [
      {
        eyebrow: "Về chúng tôi",
        title: "XDAILY là ai?",
        paragraphs: [
          "XDAILY là thương hiệu nội thất hướng tới gia đình và không gian sống đô thị: ghế ăn, bàn trà, ghế bar, sofa… được chọn lọc và mô tả rõ ràng trên website để bạn dễ so sánh và đặt mua.",
          "Với mạng lưới đối tác sản xuất và nhập khẩu, chúng tôi có thể đáp ứng đơn lẻ lẫn nhu cầu trang trí theo khu vực — luôn ưu tiên an toàn sử dụng và độ bền theo thời gian.",
        ],
      },
      {
        eyebrow: "Định hướng",
        title: "Hướng đến cộng đồng",
        paragraphs: [
          "Chúng tôi muốn XDAILY là cái tên được nhắc tới khi người dùng tìm nội thất đẹp, dễ bảo trì và dịch vụ rõ ràng: từ tư vấn online đến giao nhận và hỗ trợ sau mua.",
        ],
      },
      {
        eyebrow: "Sứ mệnh",
        title: "Cam kết với khách hàng",
        paragraphs: [
          "Không ngừng cải thiện trải nghiệm mua sắm — mô tả trung thực, hình ảnh sát thực tế, chính sách đổi trả và vận chuyển minh bạch. Mọi góp ý đều là cơ hội để chúng tôi phục vụ tốt hơn.",
        ],
      },
      {
        eyebrow: "Đội ngũ",
        title: "Con người XDAILY",
        paragraphs: [
          "Đội ngũ vận hành, kho vận và chăm sóc khách hàng làm việc phối hợp chặt chẽ với đối tác sản xuất — để đơn hàng được xử lý nhanh, đóng gói cẩn thận và đến tay bạn đúng cam kết.",
        ],
        trailingImage: {
          alt: "Không gian làm việc và showroom XDAILY",
        },
      },
    ],
    cta: {
      title: "Cần tư vấn thêm?",
      subtitle:
        "Để lại tin nhắn hoặc gọi hotline — chúng tôi phản hồi trong giờ làm việc.",
      buttonLabel: "Liên hệ ngay",
      buttonHref: "/contact",
    },
  },
} as const;

export type DefaultSiteContent = typeof defaultSiteContent;
