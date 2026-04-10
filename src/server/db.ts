import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getPrismaPgPoolConfig } from '@/lib/prisma-pg-pool-config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg(getPrismaPgPoolConfig());
  return new PrismaClient({ adapter });
}

/** Production: singleton. Dev: không gắn global để sau `prisma generate` chỉ cần restart dev (tránh giữ instance/engine cũ). */
export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ??= createPrismaClient())
    : createPrismaClient();
