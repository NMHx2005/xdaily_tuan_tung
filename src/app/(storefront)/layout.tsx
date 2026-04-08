import { Header } from "@/components/storefront/header/header";
import { Footer } from "@/components/storefront/footer/footer";
import { CartDrawer } from "@/components/storefront/cart/cart-drawer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
