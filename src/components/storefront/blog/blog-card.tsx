import Image from "next/image";
import Link from "next/link";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  author: string;
  publishedAt: Date | null;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  thumbnail,
  author,
  publishedAt,
}: BlogCardProps) {
  return (
    <Link href={`/blogs/${slug}`} className="group block">
      <article>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-100">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL={TINY_BLUR_DATA_URL}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1.5">
          <h3 className="text-lg font-medium leading-snug line-clamp-2 transition-colors group-hover:text-primary/70">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm leading-relaxed text-neutral-500 line-clamp-3">
              {excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>{author}</span>
            {publishedAt && (
              <>
                <span>·</span>
                <time dateTime={new Date(publishedAt).toISOString()}>
                  {formatDate(new Date(publishedAt))}
                </time>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
