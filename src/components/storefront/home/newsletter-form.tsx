"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().email("Email không hợp lệ");

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Đăng ký thành công!");
      setEmail("");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    subscribe.mutate({ email });
  }

  return (
    <section className="bg-neutral-100 py-12 lg:py-16">
      <div className="mx-auto max-w-md px-4 text-center">
        <h2 className="font-heading text-2xl font-bold">
          Đăng ký nhận tin
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Nhận thông tin sản phẩm mới và khuyến mãi
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            required
            className="flex-1"
          />
          <Button type="submit" disabled={subscribe.isPending}>
            {subscribe.isPending ? "Đang gửi..." : "Đăng ký"}
          </Button>
        </form>
      </div>
    </section>
  );
}
