export type StorageBucket = "products" | "blogs" | "banners" | "collections";

/**
 * POST /api/upload — multipart: file + bucket (admin only).
 * Dùng XMLHttpRequest để có tiến trình upload.
 */
export function uploadImageWithProgress(
  file: File,
  bucket: StorageBucket,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);

    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as {
          url?: string;
          error?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && body.url) {
          resolve(body.url);
        } else {
          reject(new Error(body.error ?? "Upload thất bại"));
        }
      } catch {
        reject(new Error("Phản hồi không hợp lệ"));
      }
    };
    xhr.onerror = () => reject(new Error("Lỗi mạng"));
    xhr.send(form);
  });
}
