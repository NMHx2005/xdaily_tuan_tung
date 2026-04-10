import { createClient } from "@supabase/supabase-js";

/**
 * Client anon (browser / server). Cấu hình qua NEXT_PUBLIC_* trong .env.
 * Dùng placeholder khi thiếu env để build không lỗi — không gọi API thật khi chưa cấu hình.
 */
const supabaseAnonOrPublishable =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "https://placeholder.supabase.co",
  supabaseAnonOrPublishable ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder"
);
