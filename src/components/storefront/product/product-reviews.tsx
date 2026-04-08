"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  purchaseStatus: string;
  createdAt: Date;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
}

const purchaseLabels: Record<string, string> = {
  purchased: "Đã mua",
  using: "Đang dùng",
  interested: "Đang quan tâm",
};

function Stars({
  rating,
  size = 16,
  interactive,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-neutral-200 text-neutral-200",
            interactive && "cursor-pointer hover:text-yellow-400 hover:fill-yellow-400"
          )}
          onClick={() => interactive && onRate?.(i + 1)}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productId, reviews: initialReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState<"purchased" | "using" | "interested">("interested");

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const createReview = trpc.review.create.useMutation({
    onSuccess: (newReview) => {
      setReviews((prev) => [newReview, ...prev]);
      setAuthor("");
      setRating(5);
      setContent("");
      setPurchaseStatus("interested");
      setShowForm(false);
      toast.success("Cảm ơn bạn đã đánh giá!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (author.trim().length < 2) {
      toast.error("Tên tối thiểu 2 ký tự");
      return;
    }
    if (content.trim().length < 3) {
      toast.error("Nội dung tối thiểu 3 ký tự");
      return;
    }
    createReview.mutate({
      productId,
      author: author.trim(),
      rating,
      content: content.trim(),
      purchaseStatus,
    });
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-xl font-bold">Đánh giá sản phẩm</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Stars rating={Math.round(avgRating)} />
              <span className="text-sm text-neutral-500">
                ({avgRating.toFixed(1)} / {reviews.length} đánh giá)
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Viết đánh giá"}
        </Button>
      </div>

      {/* Submit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-lg border p-4 space-y-4">
          <div>
            <Label htmlFor="review-author">Tên của bạn</Label>
            <Input
              id="review-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nhập tên..."
              required
              minLength={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Đánh giá</Label>
            <div className="mt-1">
              <Stars rating={rating} size={24} interactive onRate={setRating} />
            </div>
          </div>

          <div>
            <Label>Trạng thái</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["purchased", "using", "interested"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setPurchaseStatus(status)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    purchaseStatus === status
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-neutral-200 hover:border-neutral-400"
                  )}
                >
                  {purchaseLabels[status]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="review-content">Nội dung</Label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              required
              minLength={3}
              maxLength={1000}
              rows={4}
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={createReview.isPending}>
            {createReview.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </form>
      )}

      {/* Review list */}
      {reviews.length > 0 ? (
        <div className="mt-6 divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{review.author}</span>
                <Badge variant="secondary" className="text-xs">
                  {purchaseLabels[review.purchaseStatus] ?? review.purchaseStatus}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={review.rating} size={14} />
                <span className="text-xs text-neutral-400">
                  {formatDate(new Date(review.createdAt))}
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-700">{review.content}</p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="mt-4 text-sm text-neutral-500">
            Chưa có đánh giá. Hãy là người đầu tiên!
          </p>
        )
      )}
    </section>
  );
}
