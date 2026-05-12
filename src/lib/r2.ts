import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  publicBaseUrl: string;
};

let cachedConfig: R2Config | null = null;
let cachedClient: S3Client | null = null;

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Thiếu biến môi trường ${name} để upload ảnh lên Cloudflare R2`);
  }
  return value;
}

function normalizePublicBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getR2Config() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const accountId = readRequiredEnv("R2_ACCOUNT_ID");

  cachedConfig = {
    accountId,
    accessKeyId: readRequiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: readRequiredEnv("R2_SECRET_ACCESS_KEY"),
    bucketName: readRequiredEnv("R2_BUCKET_NAME"),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    publicBaseUrl: normalizePublicBaseUrl(readRequiredEnv("R2_PUBLIC_BASE_URL")),
  };

  return cachedConfig;
}

export function getR2Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getR2Config();
  cachedClient = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}

export function getR2BucketName() {
  return getR2Config().bucketName;
}

export function getR2PublicUrl(objectKey: string) {
  const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");
  return `${getR2Config().publicBaseUrl}/${encodedKey}`;
}
