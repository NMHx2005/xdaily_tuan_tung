import { randomBytes } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { auth } from "@/server/auth";
import { getR2BucketName, getR2Client, getR2PublicUrl } from "@/lib/r2";

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
  const objectKey = `${bucket}/${Date.now()}-${randomString}.${ext}`;

  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: getR2BucketName(),
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload thất bại";
    if (process.env.NODE_ENV === "development") {
      console.error("[api/upload:r2]", { objectKey, message, error });
    }
    return NextResponse.json(
      {
        error: message,
        hint: "Kiểm tra R2_ACCOUNT_ID, R2_BUCKET_NAME, access key và R2_PUBLIC_BASE_URL trong biến môi trường.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: getR2PublicUrl(objectKey) });
}
