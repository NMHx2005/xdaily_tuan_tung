import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(24),
});

export const sortSchema = z.enum([
  "featured", "price-asc", "price-desc",
  "name-asc", "name-desc", "newest", "bestselling",
]).default("featured");

export const productCreateSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được trống"),
  slug: z.string().min(1),
  shortDescription: z.string().max(200, "Tối đa 200 ký tự").default(""),
  description: z.string().default(""),
  price: z.number().int().positive("Giá phải lớn hơn 0"),
  compareAtPrice: z.number().int().positive().nullable().default(null),
  sku: z.string().min(1, "SKU không được trống"),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  badge: z.enum(["bestseller", "new"]).nullable().default(null),
  position: z.number().int().default(0),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
  images: z.array(z.object({
    url: z.string().min(1, "Ảnh không hợp lệ"),
    alt: z.string().default(""),
    position: z.number().int().default(0),
  })).default([]),
  variants: z.array(z.object({
    name: z.string().min(1),
    colorHex: z.string().default(""),
    price: z.number().int().positive(),
    compareAtPrice: z.number().int().positive().nullable().default(null),
    sku: z.string().min(1),
    inStock: z.boolean().default(true),
    image: z.string().nullable().default(null),
    position: z.number().int().default(0),
  })).default([]),
  collectionIds: z.array(z.string()).default([]),
});

/** Form UI: badge "none" → map sang null trước khi gọi API */
export const adminProductFormSchema = productCreateSchema
  .omit({ badge: true })
  .extend({
    badge: z.enum(["none", "bestseller", "new"]).default("none"),
  });

/** Chỉ field form (không gồm ảnh/biến thể/collections) — dùng với react-hook-form */
export const adminProductScalarSchema = productCreateSchema
  .pick({
    name: true,
    slug: true,
    shortDescription: true,
    description: true,
    price: true,
    compareAtPrice: true,
    sku: true,
    inStock: true,
    stockQuantity: true,
    isFeatured: true,
    position: true,
    specifications: true,
    seoTitle: true,
    seoDescription: true,
  })
  .extend({
    badge: z.enum(["none", "bestseller", "new"]).default("none"),
  });

export const shippingSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^(0[35789])\d{8}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  address: z
    .string()
    .min(5, "Địa chỉ tối thiểu 5 ký tự")
    .max(500, "Địa chỉ tối đa 500 ký tự"),
  note: z.string().default(""),
});

export const reviewSchema = z.object({
  author: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(3, "Nội dung tối thiểu 3 ký tự").max(1000),
  purchaseStatus: z.enum(["purchased", "using", "interested"]).default("interested"),
});
