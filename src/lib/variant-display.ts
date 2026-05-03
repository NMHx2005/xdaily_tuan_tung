/** Kích hoạt UI “chỉ chấm màu tròn” (legacy): không có thuộc tính ghép · và mọi biến thể đều có màu. */
export function legacySwatchOnlyVariants(
  variants: { name: string; colorHex: string }[]
): boolean {
  if (variants.length === 0) return false;
  if (variants.some((v) => v.name.includes(" · "))) return false;
  return variants.every((v) => (v.colorHex ?? "").trim() !== "");
}
