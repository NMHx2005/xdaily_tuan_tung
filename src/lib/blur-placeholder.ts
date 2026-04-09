/**
 * Tiny neutral blur for `next/image` `placeholder="blur"` (≈10×10 scaled display).
 * Replace with per-image blur hashes later if needed.
 */
export const TINY_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mN8Y2H5z0AEYBxVSF+XAAAX0QEQHa288QAAAABJRU5ErkJggg==";

/** @deprecated Use TINY_BLUR_DATA_URL */
export function generateBlurDataUrl(): string {
  return TINY_BLUR_DATA_URL;
}
