export const SITE_NAME = "TUANH";
export const SITE_DESCRIPTION = "Nhà máy nội thất TUANH - Ghế, bàn, sofa cao cấp";
/** Client-friendly base; server SEO should use `getSiteUrl()` from `@/lib/seo`. */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const COLLECTIONS = [
  { name: "Ghế ăn", slug: "ghe-an" },
  { name: "Ghế bar", slug: "ghe-bar" },
  { name: "Ghế văn phòng", slug: "ghe-chan-xoay" },
  { name: "Ghế thư giãn", slug: "ghe-thu-gian" },
  { name: "Sofa", slug: "sofa" },
  { name: "Giường ngủ", slug: "giuong-ngu" },
  { name: "Bàn ăn", slug: "ban-an" },
  { name: "Bàn trà", slug: "ban-tra" },
  { name: "Bộ bàn ghế", slug: "bo-ban-ghe" },
] as const;

export const SORT_OPTIONS = [
  { label: "Nổi bật", value: "featured" },
  { label: "Giá: Tăng dần", value: "price-asc" },
  { label: "Giá: Giảm dần", value: "price-desc" },
  { label: "Tên: A-Z", value: "name-asc" },
  { label: "Tên: Z-A", value: "name-desc" },
  { label: "Mới nhất", value: "newest" },
  { label: "Bán chạy", value: "bestselling" },
] as const;

export const PRODUCTS_PER_PAGE = 24;
export const FREE_SHIPPING_THRESHOLD = 5_000_000;
export const DEFAULT_SHIPPING_FEE = 30_000;
