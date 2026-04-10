"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export function AdminImageDomainsClient() {
  const utils = trpc.useUtils();
  const { data: rows, isLoading, error } = trpc.imageHost.list.useQuery(undefined, {
    staleTime: 30_000,
  });

  const createMut = trpc.imageHost.create.useMutation({
    onSuccess: async () => {
      toast.success("Đã thêm domain");
      await utils.imageHost.list.invalidate();
      await utils.imageHost.listPublic.invalidate();
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message || "Không thêm được"),
  });

  const updateMut = trpc.imageHost.update.useMutation({
    onSuccess: async () => {
      toast.success("Đã cập nhật");
      await utils.imageHost.list.invalidate();
      await utils.imageHost.listPublic.invalidate();
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message || "Không lưu được"),
  });

  const deleteMut = trpc.imageHost.delete.useMutation({
    onSuccess: async () => {
      toast.success("Đã xóa");
      await utils.imageHost.list.invalidate();
      await utils.imageHost.listPublic.invalidate();
    },
    onError: (e) => toast.error(e.message || "Không xóa được"),
  });

  const emptyForm = { hostname: "", note: "" };
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(row: { id: string; hostname: string; note: string }) {
    setEditId(row.id);
    setForm({ hostname: row.hostname, note: row.note });
    setOpen(true);
  }

  function submit() {
    const hostname = form.hostname.trim();
    if (!hostname) {
      toast.error("Nhập hostname hoặc URL");
      return;
    }
    if (editId) {
      updateMut.mutate({
        id: editId,
        hostname,
        note: form.note.trim(),
      });
    } else {
      createMut.mutate({
        hostname,
        note: form.note.trim(),
      });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Domain ảnh được phép</CardTitle>
          <CardDescription>
            Khi danh sách <strong>có ít nhất một dòng</strong>, chỉ ảnh từ các domain (hoặc mẫu{" "}
            <code className="rounded bg-muted px-1">*.tenmien.com</code>) này mới hiển thị trên
            trang Giới thiệu và logo cửa hàng (ảnh ngoài). Đường dẫn trong site (bắt đầu bằng{" "}
            <code className="rounded bg-muted px-1">/</code>) luôn được phép.{" "}
            <strong>Để trống danh sách = không chặn domain nào.</strong>
          </CardDescription>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload ảnh qua admin (Supabase) thường dùng host{" "}
            <code className="rounded bg-muted px-1">*.supabase.co</code> — thêm dòng{" "}
            <code className="rounded bg-muted px-1">*.supabase.co</code> nếu bạn bật chế độ chặn.
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          Thêm domain
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}
        {error && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
        {!isLoading && !error && (
          <>
            {rows?.length === 0 ? (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                Chưa cấu hình — mọi domain ảnh đều được hiển thị. Thêm dòng để bắt đầu hạn chế.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-3 py-2 font-medium">Hostname / pattern</th>
                      <th className="px-3 py-2 font-medium">Ghi chú</th>
                      <th className="w-[120px] px-3 py-2 font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows?.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-3 py-2 font-mono text-xs">{r.hostname}</td>
                        <td className="max-w-md px-3 py-2 text-muted-foreground">
                          {r.note || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="outline"
                              onClick={() => openEdit(r)}
                              aria-label="Sửa"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm(`Xóa ${r.hostname}?`)) {
                                  deleteMut.mutate({ id: r.id });
                                }
                              }}
                              aria-label="Xóa"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Liên quan:{" "}
              <Link href="/admin/about-content" className="text-primary underline">
                Nội dung trang Giới thiệu
              </Link>
              {" · "}
              <Link href="/admin/website" className="text-primary underline">
                Website &amp; liên hệ
              </Link>
            </p>
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Sửa domain" : "Thêm domain"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="im-host">Hostname hoặc dán full URL</Label>
              <Input
                id="im-host"
                className="mt-1 font-mono text-sm"
                placeholder="file.hstatic.net hoặc *.supabase.co"
                value={form.hostname}
                onChange={(e) => setForm((f) => ({ ...f, hostname: e.target.value }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ví dụ: <code className="rounded bg-muted px-1">cdn.shop.com</code> hoặc{" "}
                <code className="rounded bg-muted px-1">*.hstatic.net</code> (mọi subdomain).
              </p>
            </div>
            <div>
              <Label htmlFor="im-note">Ghi chú (tuỳ chọn)</Label>
              <Textarea
                id="im-note"
                rows={2}
                className="mt-1"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={createMut.isPending || updateMut.isPending}
              onClick={submit}
            >
              {editId ? "Lưu thay đổi" : "Thêm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
