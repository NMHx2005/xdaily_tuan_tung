/**
 * Class Tailwind dùng biến CSS trực tiếp — chuỗi giống nhau trên SSR và client,
 * tránh hydration mismatch khi preset `bg-brand` / `text-brand` lệch giữa hai bundle (Turbopack cache).
 * Màu: `globals.css` `:root` `--brand`, `--brand-hover`, `--brand-active`.
 */
export const brandClass = {
  bg: "bg-[var(--brand)]",
  bgHover: "hover:bg-[var(--brand-hover)]",
  bgActive: "active:bg-[var(--brand-active)]",
  text: "text-[var(--brand)]",
  textHover: "hover:text-[var(--brand)]",
  ringOffset: "ring-offset-[var(--brand)]",
  border: "border-[var(--brand)]",
  ring40: "ring-[var(--brand)]/40",
} as const;
