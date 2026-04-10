import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const BUCKETS = new Set(["products", "blogs", "banners", "collections"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 });
  }

  const rawBucket = formData.get("bucket");
  const bucket = typeof rawBucket === "string" ? rawBucket : "";
  if (!BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Bucket không hợp lệ" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
  }

  const ext = MIME_TO_EXT.get(file.type);
  if (!ext || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Chỉ JPEG, PNG, WebP — tối đa 5MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const randomString = randomBytes(8).toString("hex");
  const objectPath = `${Date.now()}-${randomString}.${ext}`;

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Thiếu biến môi trường Supabase",
      },
      { status: 500 }
    );
  }

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(objectPath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Upload thất bại" },
      { status: 500 }
    );
  }

  const { data: pub } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(objectPath);

  return NextResponse.json({ url: pub.publicUrl });
}
