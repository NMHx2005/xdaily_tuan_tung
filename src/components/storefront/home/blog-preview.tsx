import Image from "next/image";
import Link from "next/link";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { SITE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string | null;
  author: string;
  publishedAt: Date | null;
}

interface BlogPreviewProps {
  posts: BlogPost[];
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold lg:text-3xl">
            Tin tức mới
          </h2>
          <Link
            href="/blogs"
            className="text-sm text-brand transition-colors hover:underline"
          >
            Xem tất cả &raquo;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group block"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-100">
                {post.thumbnail ? (
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={TINY_BLUR_DATA_URL}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-400">
                    {SITE_NAME}
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-sm font-medium text-neutral-800 line-clamp-2 group-hover:text-brand transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              {post.publishedAt && (
                <p className="mt-1.5 text-xs text-neutral-400">
                  {formatDate(new Date(post.publishedAt))}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
