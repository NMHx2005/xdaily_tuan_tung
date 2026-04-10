import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Service role — chỉ gọi trong API routes (sau khi đã kiểm tra env). */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  /** `service_role` JWT cũ hoặc `sb_secret_...` — một số template dùng `SUPABASE_SECRET_KEY`. */
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url?.trim() || !key) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (Secret key sb_secret_... trong Dashboard → API Keys)",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
