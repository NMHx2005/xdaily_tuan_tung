/**
 * Giá trị mặc định trong code (khi DB chưa có hoặc lỗi định dạng).
 *
 * Trên production: chỉnh tại **Quản trị → Trang Giới thiệu** hoặc **Website &amp; liên hệ**.
 * Nút **Nạp mẫu** trong admin lấy đúng cấu trúc này để sửa rồi **Lưu**.
 * Logo: upload lên Supabase Storage (bucket public) rồi dán URL trong Admin → Website &amp; liên hệ.
 */
export const defaultSiteContent = {
  siteBrand: {
    name: "Nội thất Tú Anh",
    /** Thay bằng URL ảnh trên Supabase sau khi upload (hoặc giữ đường dẫn `/...` trong public) */
    logoUrl: "/placeholders/cover.svg",
    footerTagline:
      "Nội thất Tú Anh — Không gian đẹp, giá trị bền lâu. Thiết kế tinh gọn, thi công tại Thạch Thất, Hà Nội.",
  },
  siteContact: {
    hotlineDigits: "0866876869",
    hotlineDisplay: "0866 876 869",
    email: "TUANHfurniture@gmail.com",
    address:
      "Xưởng 1: Làng Chàng, Thạch Xá, Thạch Thất, Hà Nội · Xưởng 2: Đồng Thạch, Hữu Bằng, Thạch Thất · Kho: 40 Đường Thái Hòa, Hữu Bằng, Thạch Thất, Hà Nội",
    openingHours: "Thứ 2 – Thứ 7: 8h00 – 18h00 · Chủ nhật: nghỉ",
  },
  contactPageContent: {
    meta: {
      title: "Liên hệ",
      description:
        "Liên hệ Nội thất Tú Anh — hotline 0866 876 869, email TUANHfurniture@gmail.com, xưởng & kho tại Thạch Thất, Hà Nội.",
      openGraphTitle: "Liên hệ | Nội thất Tú Anh",
    },
    hero: {
      title: "Liên hệ",
      lead:
        "Đội ngũ Tú Anh hỗ trợ tư vấn không gian, báo giá và lịch thi công. Gọi hotline, gửi email hoặc để lại tin nhắn — chúng tôi phản hồi trong giờ làm việc.",
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
        "Nội thất Tú Anh — thiết kế tinh gọn, xưởng sản xuất tại Thạch Thất, chủ động nguồn hàng và tiến độ. Không gian đẹp, giá trị bền lâu.",
      openGraphTitle: "Giới thiệu | Nội thất Tú Anh",
    },
    organizationJsonLd: {
      description:
        "Nội thất Tú Anh — thương hiệu nội thất tại Thạch Thất, Hà Nội: thiết kế riêng, thi công chính xác, hai xưởng sản xuất và hệ thống kho hàng.",
    },
    hero: {
      h1: "NỘI THẤT TÚ ANH",
      lead:
        "Không gian đẹp – Giá trị bền lâu\n\nBạn không chỉ mua nội thất. Bạn đang chọn cách sống mỗi ngày.",
      backgroundImageUrl: "",
    },
    stats: [
      { value: "2", label: "Xưởng sản xuất (Thạch Thất)" },
      { value: "1", label: "Kho hàng trung tâm" },
      { value: "100%", label: "Cam kết hoàn thiện tỉ mỉ" },
      { value: "Ưu tiên", label: "Đẹp thực tế — không chỉ trên ảnh studio" },
    ],
    story: {
      imageAlt: "Không gian nội thất Nội thất Tú Anh",
      imageUrl: "",
      eyebrow: "Về chúng tôi",
      title: "Hội tụ thiết kế tinh gọn — am hiểu không gian sống Việt",
      body:
        "Nội Thất Tú Anh – nơi hội tụ của những thiết kế tinh gọn, chất liệu được tuyển chọn và sự am hiểu sâu sắc về không gian sống Việt. Chúng tôi không làm tất cả, nhưng chúng tôi làm những gì thực sự đẹp, thực sử dụng được và thực sự xứng đáng với căn nhà của bạn.",
      primaryCta: { label: "Xem sản phẩm", href: "/collections" },
      secondaryCta: { label: "Liên hệ tư vấn", href: "/contact" },
    },
    pillars: [
      {
        icon: "factory" as const,
        title: "Hai xưởng & kho chủ động",
        text:
          "Với hai xưởng sản xuất tại Thạch Thất và hệ thống kho hàng rộng rãi, chúng tôi chủ động về nguồn hàng và tiến độ — để bạn yên tâm từ khâu chọn mẫu đến ngày bàn giao.",
      },
      {
        icon: "sparkles" as const,
        title: "Đẹp thực tế",
        text:
          "Từ phòng khách ấm cúng, phòng ngủ thư giãn, góc làm việc tối giản đến bếp gọn gàng — sản phẩm thiết kế riêng, thi công chính xác, không chỉ đẹp trên ảnh chụp studio.",
      },
      {
        icon: "heartHandshake" as const,
        title: "Đội ngũ có tâm",
        text:
          "Tư vấn đúng người, đúng việc — không đẩy hàng tồn. Linh hoạt theo ngân sách; thợ làm thật, hoàn thiện thật.",
      },
    ],
    sections: [
      {
        eyebrow: "Khách hàng",
        title: "Vì sao khách hàng tìm đến Tú Anh?",
        paragraphs: [
          "Bởi họ không muốn một căn nhộn nhịp, lộn xộn.",
          'Bởi họ cần sự tư vấn đúng người, đúng việc – không bán hàng kiểu "đẩy hàng tồn".',
          "Bởi họ trân trọng cái đẹp đúng nghĩa: không phô trương, không hào nhoáng rẻ tiền.",
        ],
      },
      {
        eyebrow: "Dịch vụ",
        title: "Chúng tôi làm gì?",
        paragraphs: [
          "Từ phòng khách ấm cúng, phòng ngủ thư giãn, góc làm việc tối giản cho đến không gian bếp gọn gàng – Tú Anh mang đến những sản phẩm nội thất thiết kế riêng, thi công chính xác, hoàn thiện tỉ mỉ.",
          "Với hai xưởng sản xuất tại Thạch Thất và hệ thống kho hàng rộng rãi, chúng tôi chủ động về nguồn hàng, chủ động về tiến độ – để bạn yên tâm từ khâu chọn mẫu đến ngày bàn giao.",
        ],
      },
      {
        eyebrow: "Khác biệt",
        title: "Tú Anh khác biệt thế nào?",
        paragraphs: [
          "Đẹp thực tế – không chỉ đẹp trên ảnh chụp studio",
          "Vừa vặn với không gian nhà bạn – không áp đặt mẫu mã",
          "Linh hoạt theo ngân sách – luôn có phương án phù hợp",
          "Đội ngũ thợ có tâm – làm thật, hoàn thiện thật",
        ],
      },
      {
        eyebrow: "Cam kết",
        title: "Gửi gắm của chúng tôi",
        paragraphs: [
          "Chúng tôi không hứa những điều viển vông.",
          "Chúng tôi chỉ hứa làm đúng, làm đẹp, và có trách nhiệm với từng sản phẩm mang tên Tú Anh.",
          '"Hãy đến Tú Anh khi bạn muốn ngôi nhà của mình được nâng niu đúng cách – không ảo tưởng, không chiêu trò."',
        ],
      },
      {
        eyebrow: "Thông tin",
        title: "Xưởng sản xuất nội thất Tú Anh",
        paragraphs: [
          "Hệ thống cơ sở sản xuất & kho hàng:",
          "· Xưởng sản xuất 1: Làng Chàng, Thạch Xá, Thạch Thất, Hà Nội",
          "· Xưởng sản xuất 2: Đồng Thạch, Hữu Bằng, Thạch Thất, Hà Nội",
          "· Kho hàng: 40 Đường Thái Hòa, Hữu Bằng, Thạch Thất, Hà Nội",
          "Hotline: 0866876869 · Email: TUANHfurniture@gmail.com",
        ],
      },
    ],
    cta: {
      title: "Cần tư vấn không gian?",
      subtitle:
        "Gọi hotline 0866 876 869 hoặc để lại tin — chúng tôi phản hồi trong giờ làm việc.",
      buttonLabel: "Liên hệ ngay",
      buttonHref: "/contact",
    },
  },
} as const;

export type DefaultSiteContent = typeof defaultSiteContent;
