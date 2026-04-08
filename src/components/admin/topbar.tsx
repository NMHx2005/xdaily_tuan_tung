"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, Settings, ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminMobileSidebar } from "./sidebar";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Sản phẩm",
  "/admin/products/new": "Thêm sản phẩm",
  "/admin/collections": "Bộ sưu tập",
  "/admin/orders": "Đơn hàng",
  "/admin/blogs": "Bài viết",
  "/admin/blogs/new": "Thêm bài viết",
  "/admin/customers": "Khách hàng",
  "/admin/settings": "Cài đặt",
};

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/admin/products/")) return "Chi tiết sản phẩm";
  if (pathname.startsWith("/admin/orders/")) return "Chi tiết đơn hàng";
  if (pathname.startsWith("/admin/blogs/")) return "Chi tiết bài viết";
  if (pathname.startsWith("/admin/collections/")) return "Chi tiết bộ sưu tập";
  return "Admin";
}

export function AdminTopbar({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileSidebar />
        <div className="flex items-center gap-1 text-sm">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sale" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {(userName || "A").charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block font-medium">{userName || "Admin"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{userName || "Admin"}</p>
              <p className="text-xs font-normal text-muted-foreground">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/admin/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
