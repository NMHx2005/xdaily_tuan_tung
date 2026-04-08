export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  thumbnail: string;
  hoverImage: string | null;
  variantCount: number;
  variantColors: string[];
  badge: "bestseller" | "new" | null;
}

export interface BlogCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string | null;
  author: string;
  publishedAt: Date;
}

export interface CollectionSummary {
  id: string;
  slug: string;
  name: string;
}
