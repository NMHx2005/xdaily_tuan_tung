import type { ProductCardData } from "@/types";
import { ProductSection } from "@/components/storefront/home/product-section";

const mockProducts: ProductCardData[] = [
  {
    id: "1",
    slug: "granite-chair",
    name: "Ghế ăn XDAILY - GRANITE CHAIR | Ghế ăn gỗ cao cấp",
    price: 2100000,
    compareAtPrice: 2800000,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=GRANITE",
    hoverImage: null,
    variantCount: 3,
    variantColors: ["#000000", "#FFFFFF", "#8B4513"],
    badge: "bestseller",
  },
  {
    id: "2",
    slug: "nordic-chair",
    name: "Ghế ăn XDAILY - NORDIC CHAIR | Phong cách Bắc Âu",
    price: 1850000,
    compareAtPrice: null,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=NORDIC",
    hoverImage: null,
    variantCount: 2,
    variantColors: ["#2C3E50", "#ECF0F1"],
    badge: "new",
  },
  {
    id: "3",
    slug: "sofa-monaco",
    name: "Sofa XDAILY - MONACO | Sofa da cao cấp 3 chỗ",
    price: 15900000,
    compareAtPrice: 19500000,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=MONACO",
    hoverImage: null,
    variantCount: 4,
    variantColors: ["#1a1a1a", "#8B6914", "#4A4A4A", "#C0C0C0"],
    badge: "bestseller",
  },
  {
    id: "4",
    slug: "bar-chair-oslo",
    name: "Ghế bar XDAILY - OSLO | Chân thép sơn tĩnh điện",
    price: 1450000,
    compareAtPrice: null,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=OSLO",
    hoverImage: null,
    variantCount: 2,
    variantColors: ["#000000", "#D4A574"],
    badge: null,
  },
  {
    id: "5",
    slug: "dining-table-luna",
    name: "Bàn ăn XDAILY - LUNA TABLE | Mặt đá sintered",
    price: 8900000,
    compareAtPrice: 11200000,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=LUNA",
    hoverImage: null,
    variantCount: 1,
    variantColors: ["#333333"],
    badge: null,
  },
  {
    id: "6",
    slug: "bed-aurora",
    name: "Giường ngủ XDAILY - AURORA | Khung gỗ sồi tự nhiên",
    price: 12500000,
    compareAtPrice: null,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=AURORA",
    hoverImage: null,
    variantCount: 2,
    variantColors: ["#DEB887", "#8B7355"],
    badge: "new",
  },
  {
    id: "7",
    slug: "coffee-table-zen",
    name: "Bàn trà XDAILY - ZEN TABLE | Phong cách Nhật Bản",
    price: 3200000,
    compareAtPrice: 4100000,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=ZEN",
    hoverImage: null,
    variantCount: 0,
    variantColors: [],
    badge: null,
  },
  {
    id: "8",
    slug: "office-chair-ergo",
    name: "Ghế văn phòng XDAILY - ERGO PRO | Công thái học",
    price: 4500000,
    compareAtPrice: 5200000,
    thumbnail: "https://via.placeholder.com/400x400/f5f5f5/333?text=ERGO",
    hoverImage: null,
    variantCount: 3,
    variantColors: ["#1a1a1a", "#2C3E50", "#7F8C8D"],
    badge: "bestseller",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero placeholder */}
      <section className="bg-neutral-100">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold lg:text-5xl">
              Nội thất cao cấp
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Thiết kế hiện đại — Chất lượng quốc tế — Giá tốt nhất
            </p>
          </div>
        </div>
      </section>

      <ProductSection
        title="Sản phẩm bán chạy"
        viewAllLink="/collections/ghe-an"
        products={mockProducts.filter((p) => p.badge === "bestseller")}
      />

      <ProductSection
        title="Sản phẩm mới"
        viewAllLink="/collections/ghe-an"
        products={mockProducts.filter((p) => p.badge === "new")}
      />

      <ProductSection
        title="Tất cả sản phẩm"
        viewAllLink="/search"
        products={mockProducts}
      />
    </>
  );
}
