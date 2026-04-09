import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/storefront/collection/breadcrumbs";

export const dynamic = "force-static";

const title = "Giới thiệu";
const description =
  "Về XDAILY — thương hiệu nội thất cho mọi gia đình, định hướng phát triển và sứ mệnh phục vụ khách hàng.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Giới thiệu | XDAILY",
    description,
    type: "website",
    url: "/about",
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: "XDAILY" }],
  },
};

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-neutral-200 pt-12 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-2xl font-bold text-neutral-900">
        {title}
      </h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-600">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const base = getSiteUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: base },
      { "@type": "ListItem", position: 2, name: "Giới thiệu", item: `${base}/about` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <Breadcrumbs
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Giới thiệu" },
          ]}
        />

        <header className="mt-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Giới thiệu
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">
            XDAILY — đồng hành cùng không gian sống hiện đại của bạn.
          </p>
        </header>

        <div className="relative mt-12 aspect-21/9 overflow-hidden rounded-2xl bg-neutral-200">
          <Image
            src={DEFAULT_OG_IMAGE_PATH}
            alt="XDAILY — không gian trưng bày nội thất"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
          />
        </div>

        <div className="mt-16 space-y-16">
          <Section eyebrow="Về chúng tôi" title="XDAILY là ai?">
            <p>
              XDAILY là thương hiệu nội thất dành cho mọi gia đình người Việt. Chúng
              tôi mang đến những sản phẩm nội thất phù hợp với không gian bạn mong muốn.
              Là một trong những đơn vị thiết kế và thi công nội ngoại thất tại Việt Nam,
              XDAILY nhận được sự tin tưởng của đông đảo khách hàng trên khắp cả nước.
            </p>
            <p>
              Thương hiệu được biết đến với hệ thống nhà xưởng sản xuất quy mô, tiêu
              chuẩn cao, cùng mạng lưới nhập khẩu thiết bị nội thất. XDAILY có thể cung
              cấp trọn gói từ thiết kế, thi công nội thất đến xây mới, cải tạo và trang
              trí — mang đến trải nghiệm đầy đủ trong lĩnh vực thiết kế và thi công nội
              ngoại thất.
            </p>
          </Section>

          <Section eyebrow="Định hướng" title="Hướng đến cộng đồng">
            <p>
              XDAILY hướng tới một môi trường nội và ngoại thất phong phú — nơi cộng
              đồng nghĩ đến ngay khi nhắc tới lĩnh vực này. Chúng tôi không ngừng đổi
              mới và phát triển, với mong muốn mang đến những giá trị tốt đẹp nhất về
              nội và ngoại thất.
            </p>
          </Section>

          <Section eyebrow="Phát triển" title="Quy mô và hệ thống">
            <p>
              Trong hành trình hình thành và phát triển, XDAILY đã mở rộng với nhiều
              lĩnh vực hoạt động chính: đào tạo, thiết kế, thi công, thương mại và sản
              xuất — cùng hệ thống showroom trưng bày trên khắp cả nước.
            </p>
          </Section>

          <Section eyebrow="Sứ mệnh" title="Cam kết với khách hàng">
            <p>
              Sứ mệnh của XDAILY là không ngừng nâng cao chất lượng dịch vụ và sản
              phẩm; tạo ra giải pháp đồng bộ trong kiến trúc nội và ngoại thất, để mang
              đến trải nghiệm trọn vẹn và đầy đủ nhất cho cộng đồng.
            </p>
          </Section>

          <Section eyebrow="Đội ngũ" title="Con người XDAILY">
            <p>
              Với tinh thần đoàn kết và cống hiến của toàn thể đội ngũ, XDAILY kết nối
              mạng lưới đối tác và đại lý rộng khắp, cùng nhau phục vụ khách hàng tận
              tâm và chuyên nghiệp.
            </p>
            <div className="relative mt-8 aspect-video overflow-hidden rounded-xl bg-neutral-200">
              <Image
                src={DEFAULT_OG_IMAGE_PATH}
                alt="Đội ngũ XDAILY — placeholder"
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 768px) 100vw, 48rem"
              />
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
