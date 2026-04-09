import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createCaller } from "@/lib/trpc/server";
import { formatDate } from "@/lib/utils";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";
import { TINY_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";
import { BlogContent } from "@/components/storefront/blog/blog-content";
import { ShareButtons } from "@/components/storefront/blog/share-buttons";
import { Badge } from "@/components/ui/badge";

export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const trpc = await createCaller();
    const post = await trpc.blog.getBySlug({ slug });
    const title = post.seoTitle || post.title;
    const description = post.seoDescription || post.excerpt || post.title;
    const ogImage = post.thumbnail ? absoluteUrl(post.thumbnail) : absoluteUrl(DEFAULT_OG_IMAGE_PATH);
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: `/blogs/${slug}`,
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.author],
        images: [{ url: ogImage, alt: title }],
      },
      alternates: {
        canonical: `/blogs/${slug}`,
      },
    };
  } catch {
    return { title: "Bài viết" };
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const trpc = await createCaller();

  let post;
  try {
    post = await trpc.blog.getBySlug({ slug });
  } catch {
    notFound();
  }

  const recentPosts = await trpc.blog.getRecent({ limit: 5 });

  const postUrl = `${getSiteUrl()}/blogs/${slug}`;
  const tags = (post.tags as string[]) || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnail ? absoluteUrl(post.thumbnail) : undefined,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "XDAILY", url: getSiteUrl() },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "Tin tức", item: `${getSiteUrl()}/blogs` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/blogs" },
          { label: post.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        {/* Main content */}
        <article className="lg:col-span-8">
          <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-sm text-neutral-500">
            <span>{post.author}</span>
            {post.publishedAt && (
              <>
                <span>·</span>
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {formatDate(new Date(post.publishedAt))}
                </time>
              </>
            )}
          </div>

          {post.thumbnail && (
            <div className="relative mt-6 aspect-video overflow-hidden rounded-lg">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL={TINY_BLUR_DATA_URL}
              />
            </div>
          )}

          <div className="mt-8">
            <BlogContent html={post.content} />
          </div>

          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-heading text-lg font-bold">
                Bài viết gần đây
              </h3>
              <div className="mt-4 space-y-4">
                {recentPosts
                  .filter((p) => p.slug !== slug)
                  .slice(0, 4)
                  .map((p) => (
                    <Link
                      key={p.id}
                      href={`/blogs/${p.slug}`}
                      className="group flex gap-3"
                    >
                      {p.thumbnail && (
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                          <Image
                            src={p.thumbnail}
                            alt={p.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug line-clamp-2 transition-colors group-hover:text-primary/70">
                          {p.title}
                        </p>
                        {p.publishedAt && (
                          <p className="mt-1 text-xs text-neutral-400">
                            {formatDate(new Date(p.publishedAt))}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
