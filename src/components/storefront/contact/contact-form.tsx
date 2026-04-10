"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";

const contactSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().refine(
    (v) => {
      const t = v.trim();
      return t === "" || /^(0[35789])\d{8}$/.test(t);
    },
    { message: "Số điện thoại không hợp lệ" },
  ),
  message: z.string().min(10, "Nội dung tối thiểu 10 ký tự").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const submitMut = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success(
        "Đã ghi nhận tin nhắn. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
      );
      reset();
    },
    onError: (e) => {
      toast.error(e.message || "Không gửi được tin nhắn");
    },
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(data: ContactFormValues) {
    await submitMut.mutateAsync({
      name: data.name,
      email: data.email,
      phone: data.phone.trim() === "" ? undefined : data.phone,
      message: data.message,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div>
        <h2 className="font-heading text-lg font-bold text-neutral-900">
          Gửi tin nhắn
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Điền form bên dưới hoặc gọi hotline — chúng tôi luôn sẵn sàng hỗ trợ.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Họ và tên *</Label>
          <Input
            id="contact-name"
            {...register("name")}
            className="mt-1"
            placeholder="Nguyễn Văn A"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-err" : undefined}
          />
          {errors.name && (
            <p id="contact-name-err" className="mt-1 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="contact-phone">Số điện thoại</Label>
          <Input
            id="contact-phone"
            inputMode="numeric"
            {...register("phone")}
            className="mt-1"
            placeholder="0912345678 (tùy chọn)"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "contact-phone-err" : undefined}
          />
          {errors.phone && (
            <p id="contact-phone-err" className="mt-1 text-xs text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="contact-email">Email *</Label>
        <Input
          id="contact-email"
          type="email"
          {...register("email")}
          className="mt-1"
          placeholder="ban@email.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-err" : undefined}
        />
        {errors.email && (
          <p id="contact-email-err" className="mt-1 text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="contact-message">Nội dung *</Label>
        <Textarea
          id="contact-message"
          {...register("message")}
          rows={5}
          className="mt-1 resize-y"
          placeholder="Bạn cần tư vấn sản phẩm, báo giá, hoặc hợp tác…"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-err" : undefined}
        />
        {errors.message && (
          <p id="contact-message-err" className="mt-1 text-xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || submitMut.isPending}
        className="h-11 w-full bg-[#0066FF] text-base font-semibold hover:bg-[#0052CC] sm:w-auto sm:min-w-[180px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang gửi…
          </>
        ) : (
          "Gửi tin nhắn"
        )}
      </Button>
    </form>
  );
}
