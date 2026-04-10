import { Header } from "@/components/storefront/header/header";
import { Footer } from "@/components/storefront/footer/footer";
import { CartDrawer } from "@/components/storefront/cart/cart-drawer";
import { StorefrontNavProvider } from "@/components/storefront/storefront-nav-context";
import { createCaller } from "@/lib/trpc/server";
import { getMergedSiteContent } from "@/lib/get-site-content";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trpc = await createCaller();
  const [storefrontNav, site] = await Promise.all([
    trpc.collection.getStorefrontNavTree(),
    getMergedSiteContent(),
  ]);
  const hotlineTel = `tel:${site.siteContact.hotlineDigits}`;

  return (
    <StorefrontNavProvider nav={storefrontNav}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Bỏ qua đến nội dung
      </a>
      <Header
        brandName={site.siteBrand.name}
        hotlineDisplay={site.siteContact.hotlineDisplay}
        hotlineTel={hotlineTel}
      />
      <main id="main-content" tabIndex={-1} className="min-h-screen outline-none">
        {children}
      </main>
      <Footer site={site} />
      <CartDrawer />
    </StorefrontNavProvider>
  );
}
