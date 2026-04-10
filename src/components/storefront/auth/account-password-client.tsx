"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function AccountPasswordClient() {
  const [show, setShow] = useState<Record<string, boolean>>({});
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery();

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changeMut = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu");
      form.reset();
    },
    onError: (e) => toast.error(e.message || "Đổi mật khẩu thất bại"),
  });

  function onSubmit(values: PasswordValues) {
    changeMut.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  }

  function toggle(key: keyof typeof show) {
    setShow((s) => ({ ...s, [key]: !s[key] }));
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-[#0066FF]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Về tài khoản
      </Link>

      <h1 className="font-heading text-2xl font-bold">Đổi mật khẩu</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Dùng mật khẩu mạnh và không chia sẻ với người khác.
      </p>

      {isLoading || !profile ? (
        <div className="mt-8 w-full max-w-3xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !profile.canChangePassword ? (
        <p className="mt-8 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Bạn đăng nhập bằng Google. Mật khẩu do Google quản lý — không đổi tại đây.
        </p>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 w-full max-w-3xl space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="cur-pw">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Input
                id="cur-pw"
                type={show.cur ? "text" : "password"}
                autoComplete="current-password"
                {...form.register("currentPassword")}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100"
                onClick={() => toggle("cur")}
                aria-label={show.cur ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {show.cur ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pw">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={show.new ? "text" : "password"}
                autoComplete="new-password"
                {...form.register("newPassword")}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100"
                onClick={() => toggle("new")}
                aria-label={show.new ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {show.new ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-pw">Xác nhận mật khẩu mới</Label>
            <Input
              id="cf-pw"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={changeMut.isPending}>
            {changeMut.isPending ? "Đang xử lý…" : "Đổi mật khẩu"}
          </Button>
        </form>
      )}
    </div>
  );
}
