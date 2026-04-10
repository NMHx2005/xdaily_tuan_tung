"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  ExternalLink,
  Menu,
  Mail,
  Globe,
  BookOpen,
  Shield,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Sản phẩm", href: "/admin/products", icon: Package },
  { label: "Bộ sưu tập", href: "/admin/collections", icon: FolderOpen },
  { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Bài viết", href: "/admin/blogs", icon: FileText },
  { label: "Khách hàng", href: "/admin/customers", icon: Users },
  { label: "Liên hệ", href: "/admin/contact-messages", icon: Mail },
  { label: "Website", href: "/admin/website", icon: Globe },
  { label: "Trang Giới thiệu", href: "/admin/about-content", icon: BookOpen },
  { label: "Domain ảnh", href: "/admin/image-domains", icon: Shield },
  { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

function NavContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight" onClick={onNav}>
          XDAILY <span className="text-muted-foreground font-normal text-sm">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Điều hướng quản trị">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/5 font-semibold text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Về cửa hàng
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r bg-background">
      <NavContent pathname={pathname} />
    </aside>
  );
}

export function AdminMobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent pathname={pathname} onNav={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
