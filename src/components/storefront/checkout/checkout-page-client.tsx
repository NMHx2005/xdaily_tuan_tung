"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { shippingSchema } from "@/lib/validators";
import { trpc } from "@/lib/trpc/client";
import { useCart } from "@/hooks/use-cart";
import { ShippingForm } from "./shipping-form";
import { PaymentMethods } from "./payment-methods";
import { OrderReview } from "./order-review";
import { EmptyCart } from "@/components/storefront/cart/empty-cart";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type PaymentMethod = "COD" | "VNPAY" | "MOMO";

export function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentError = searchParams.get("error");

  const { items, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      note: "",
    },
  });

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      clearCart();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success("Đặt hàng thành công!");
        router.push(`/order-confirmation/${data.orderNumber}`);
      }
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: Record<string, string>) {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);

    createOrder.mutate({
      shipping: {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        address: values.address,
        city: values.city,
        district: values.district,
        ward: values.ward,
        note: values.note,
      },
      paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Thanh toán</h1>

      {paymentError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác.</p>
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-8">
              <ShippingForm />
              <PaymentMethods value={paymentMethod} onChange={setPaymentMethod} />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full text-base font-semibold"
              >
                {isSubmitting ? "Đang xử lý..." : "ĐẶT HÀNG"}
              </Button>
            </div>

            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <OrderReview />
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
