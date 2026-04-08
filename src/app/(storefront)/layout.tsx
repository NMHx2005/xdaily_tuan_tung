import { Header } from "@/components/storefront/header/header";
import { Footer } from "@/components/storefront/footer/footer";

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
    </>
  );
}
