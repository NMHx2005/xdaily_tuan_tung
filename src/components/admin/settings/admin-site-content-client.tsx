"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { siteContentSchema, type SiteContentData } from "@/lib/site-content-schema";
import { defaultSiteContent } from "@/content/site-defaults";
import { AdminSiteContentQuickForm } from "@/components/admin/settings/admin-site-content-quick-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

export function AdminSiteContentClient() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.site.getAdmin.useQuery(undefined, {
    staleTime: 60_000,
  });
  const [text, setText] = React.useState("");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (data?.content) {
      setText(prettyJson(data.content));
      setDirty(false);
    }
  }, [data?.content, data?.updatedAt]);

  const updateMut = trpc.site.update.useMutation({
    onSuccess: async () => {
      toast.success("Đã lưu nội dung website");
      setDirty(false);
      await utils.site.getAdmin.invalidate();
      await utils.site.getPublic.invalidate();
    },
    onError: (e) => {
      toast.error(e.message || "Không lưu được");
    },
  });

  function applyTemplate() {
    setText(prettyJson(defaultSiteContent));
    setDirty(true);
    toast.message("Đã nạp bản mẫu — nhấn Lưu để áp dụng");
  }

  function handleSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error("JSON không hợp lệ (kiểm tra dấu phẩy, ngoặc)");
      return;
    }
    const result = siteContentSchema.safeParse(parsed);
    if (!result.success) {
      const first = result.error.issues[0];
      toast.error(
        first
          ? `${first.path.join(".")}: ${first.message}`
          : "Dữ liệu không đúng cấu trúc",
      );
      return;
    }
    updateMut.mutate({ content: result.data });
  }

  const baseForQuick = (data?.content ??
    defaultSiteContent) as SiteContentData;

  return (
    <div className="space-y-8">
      <AdminSiteContentQuickForm baseContent={baseForQuick} />
      <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Nội dung website (JSON nâng cao)</CardTitle>
          <CardDescription>
            Thương hiệu, liên hệ, trang Giới thiệu & Liên hệ. Chỉnh JSON bên dưới rồi{" "}
            <strong>Lưu</strong> — trang chủ cập nhật sau vài giây (ISR).
          </CardDescription>
          {data?.updatedAt ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Cập nhật lần cuối:{" "}
              {new Date(data.updatedAt).toLocaleString("vi-VN")}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Chưa có bản lưu trong database — đang dùng mặc định trong code.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={applyTemplate}>
            <RotateCcw className="mr-1 size-4" />
            Nạp mẫu
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}
        {error && (
          <p className="text-sm text-destructive">Không tải được: {error.message}</p>
        )}
        {!isLoading && !error && (
          <>
            <Label htmlFor="site-content-json">siteContent (JSON)</Label>
            <Textarea
              id="site-content-json"
              spellCheck={false}
              rows={28}
              className="min-h-[420px] font-mono text-xs leading-relaxed"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setDirty(true);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Khóa gốc: <code className="rounded bg-muted px-1">siteBrand</code>,{" "}
              <code className="rounded bg-muted px-1">siteContact</code>,{" "}
              <code className="rounded bg-muted px-1">contactPageContent</code>,{" "}
              <code className="rounded bg-muted px-1">aboutPageContent</code>. Icon cột trụ:{" "}
              <code className="rounded bg-muted px-1">factory</code>,{" "}
              <code className="rounded bg-muted px-1">sparkles</code>,{" "}
              <code className="rounded bg-muted px-1">heartHandshake</code>.
            </p>
            <Button
              type="button"
              disabled={updateMut.isPending || !dirty}
              onClick={handleSave}
            >
              <Save className="mr-2 size-4" />
              Lưu thay đổi
            </Button>
          </>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
