import Image from "next/image";
import { cn } from "@/lib/utils";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import {
  normalizeAboutImageUrl,
  resolveAboutDisplaySrc,
} from "@/lib/about-image-url";
import { isImageUrlAllowedByRules } from "@/lib/image-allowlist";

export { normalizeAboutImageUrl, resolveAboutDisplaySrc } from "@/lib/about-image-url";

function useNativeImgTag(src: string): boolean {
  if (src.startsWith("data:")) return true;
  if (src.startsWith("//")) return true;
  return /^https?:\/\//i.test(src);
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  /** Rỗng = cho phép mọi domain (mặc định). Có phần tử = chỉ hiển thị ảnh khớp allowlist. */
  allowedHosts?: string[];
};

/**
 * Ảnh trang Giới thiệu: URL ngoài / data URL dùng `<img>`.
 * Đường dẫn `/...` trong site dùng `next/image`.
 */
export function AboutPageImage({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_OG_IMAGE_PATH,
  fill,
  sizes,
  priority,
  allowedHosts = [],
}: Props) {
  const raw = normalizeAboutImageUrl(src);
  const blocked =
    allowedHosts.length > 0 &&
    raw !== "" &&
    !isImageUrlAllowedByRules(raw, allowedHosts);

  const resolved = blocked
    ? fallbackSrc
    : resolveAboutDisplaySrc(src, fallbackSrc);

  if (useNativeImgTag(resolved)) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full", className)}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
