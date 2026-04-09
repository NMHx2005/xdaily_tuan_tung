"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ComponentProps } from "react";

type PrefetchLinkProps = ComponentProps<typeof Link>;

/**
 * Disables eager prefetch; prefetches the route when the link enters the viewport (with margin).
 */
export function ViewportPrefetchLink({ href, children, ...rest }: PrefetchLinkProps) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const path = typeof href === "string" ? href : href.pathname ?? "";
    if (!path) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          router.prefetch(path);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [href, router]);

  return (
    <Link ref={ref} href={href} prefetch={false} {...rest}>
      {children}
    </Link>
  );
}
