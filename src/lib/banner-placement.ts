/**
 * Khớp enum Prisma `BannerPlacement`. Dùng ở client/router thay vì import enum từ `@prisma/client`
 * (tránh lỗi type khi client bundle / generate chưa đồng bộ).
 */
export const BannerPlacement = {
  HERO: "HERO",
  HOME_FOUR: "HOME_FOUR",
} as const;

export type BannerPlacementValue =
  (typeof BannerPlacement)[keyof typeof BannerPlacement];
