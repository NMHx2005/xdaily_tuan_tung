/** Cây danh mục storefront (sidebar / mega menu) — đồng bộ với API `collection.getStorefrontNavTree` */

export type StorefrontNavChildLink = { label: string; slug: string };

export type StorefrontNavItem = {
  id: string;
  slug: string;
  name: string;
  /** Chuỗi rỗng = dùng `name` */
  navLabel: string | null;
  navIcon: string;
  children: StorefrontNavItem[];
};

/** Giá trị lưu DB / API — giữ khớp `navIcon` Prisma & map Lucide ở `category-sidebar` */
export const NAV_ICON_OPTION_VALUES = [
  "Percent",
  "Armchair",
  "Utensils",
  "Bed",
  "Briefcase",
  "Coffee",
  "Sparkles",
  "Package",
  "ShoppingBag",
  "Home",
  "Shirt",
  "Smartphone",
  "Headphones",
  "Baby",
  "Flower2",
  "Gift",
  "Star",
  "Zap",
  "Car",
  "TreePine",
  "BookOpen",
  "Wrench",
  "Dog",
  "Heart",
] as const;

export type NavIconValue = (typeof NAV_ICON_OPTION_VALUES)[number];

export const NAV_ICON_OPTIONS: { value: NavIconValue; label: string }[] = [
  { value: "Percent", label: "Giảm giá (%)" },
  { value: "Armchair", label: "Sofa / Armchair" },
  { value: "Utensils", label: "Bếp / Dao nĩa" },
  { value: "Bed", label: "Giường / Nệm" },
  { value: "Briefcase", label: "Văn phòng" },
  { value: "Coffee", label: "Cafe / Đồ uống" },
  { value: "Sparkles", label: "SPA / Làm đẹp" },
  { value: "Package", label: "Vật liệu / Gói hàng" },
  { value: "ShoppingBag", label: "Túi xách / Mua sắm" },
  { value: "Home", label: "Nhà cửa / Trang trí" },
  { value: "Shirt", label: "Thời trang" },
  { value: "Smartphone", label: "Điện thoại / Điện tử" },
  { value: "Headphones", label: "Âm thanh" },
  { value: "Baby", label: "Mẹ và bé" },
  { value: "Flower2", label: "Hoa / Cây cảnh" },
  { value: "Gift", label: "Quà tặng" },
  { value: "Star", label: "Nổi bật / Đánh giá" },
  { value: "Zap", label: "Điện / Flash sale" },
  { value: "Car", label: "Ô tô / Xe máy" },
  { value: "TreePine", label: "Ngoài trời / Dã ngoại" },
  { value: "BookOpen", label: "Sách / VPP" },
  { value: "Wrench", label: "Công cụ / Sửa chữa" },
  { value: "Dog", label: "Thú cưng" },
  { value: "Heart", label: "Sức khỏe / Yêu thích" },
];

export function displayNavLabel(item: Pick<StorefrontNavItem, "name" | "navLabel">): string {
  const t = item.navLabel?.trim();
  return t && t.length > 0 ? t : item.name;
}

function flattenNavChildren(parent: StorefrontNavItem): StorefrontNavChildLink[] {
  return parent.children.map((ch) => ({
    label: displayNavLabel(ch),
    slug: ch.slug,
  }));
}

function findNavPath(
  nodes: StorefrontNavItem[],
  collectionSlug: string,
): StorefrontNavItem[] | null {
  for (const n of nodes) {
    if (n.slug === collectionSlug) return [n];
    const sub = findNavPath(n.children, collectionSlug);
    if (sub) return [n, ...sub];
  }
  return null;
}

/**
 * Breadcrumb cho /collections/[slug] — null nếu slug không nằm trong cây menu.
 */
export function buildCollectionBreadcrumbTrail(
  tree: StorefrontNavItem[],
  collectionSlug: string,
): { label: string; href: string }[] | null {
  const path = findNavPath(tree, collectionSlug);
  if (!path?.length) return null;
  return path.map((n) => ({
    label: displayNavLabel(n),
    href: `/collections/${n.slug}`,
  }));
}

/** Một cột hoặc nhiều cột mega — null nếu không có danh mục con */
export function getMegaColumns(
  item: StorefrontNavItem,
): StorefrontNavChildLink[][] | null {
  if (!item.children?.length) return null;
  return [flattenNavChildren(item)];
}

export function flattenSubcategoryLinks(
  item: StorefrontNavItem,
): StorefrontNavChildLink[] | null {
  const cols = getMegaColumns(item);
  if (!cols) return null;
  const seen = new Set<string>();
  const out: StorefrontNavChildLink[] = [];
  for (const col of cols) {
    for (const ch of col) {
      if (seen.has(ch.slug)) continue;
      seen.add(ch.slug);
      out.push(ch);
    }
  }
  return out.length ? out : null;
}
