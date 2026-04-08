"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Tab = "login" | "register";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function handleLogin(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email hoặc mật khẩu không đúng");
      } else {
        toast.success("Đăng nhập thành công");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Đăng ký thất bại");
        return;
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
        setTab("login");
      } else {
        toast.success("Đăng ký thành công");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-center font-heading text-2xl font-bold">
          {tab === "login" ? "Đăng nhập" : "Đăng ký"}
        </h1>

        <div className="mt-6 flex rounded-lg bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              tab === "login"
                ? "bg-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              tab === "register"
                ? "bg-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            Đăng ký
          </button>
        </div>

        {tab === "login" ? (
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="mt-6 space-y-4"
          >
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                {...loginForm.register("email")}
                placeholder="email@example.com"
                className="mt-1"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="login-password">Mật khẩu</Label>
              <div className="relative mt-1">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  {...loginForm.register("password")}
                  placeholder="••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full text-base"
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-neutral-400">
                hoặc
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="h-11 w-full text-base"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Đăng nhập bằng Google
            </Button>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="mt-6 space-y-4"
          >
            <div>
              <Label htmlFor="reg-name">Họ và tên</Label>
              <Input
                id="reg-name"
                {...registerForm.register("name")}
                placeholder="Nguyễn Văn A"
                className="mt-1"
              />
              {registerForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                {...registerForm.register("email")}
                placeholder="email@example.com"
                className="mt-1"
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reg-password">Mật khẩu</Label>
              <Input
                id="reg-password"
                type="password"
                {...registerForm.register("password")}
                placeholder="Tối thiểu 6 ký tự"
                className="mt-1"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reg-confirm">Xác nhận mật khẩu</Label>
              <Input
                id="reg-confirm"
                type="password"
                {...registerForm.register("confirmPassword")}
                placeholder="Nhập lại mật khẩu"
                className="mt-1"
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full text-base"
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
