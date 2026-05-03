/**
 * Chỉ bổ sung banner mặc định nếu nhóm HERO / HOME_FOUR còn trống.
 * Không xóa hay ghi đè dữ liệu khác (products, users, v.v.).
 *
 * Nếu gặp `Unknown argument placement` khi chạy: schema đã có `placement` nhưng
 * Prisma Client chưa generate — chạy `npx prisma migrate deploy` (hoặc `migrate dev`)
 * rồi `npx prisma generate`, sau đó chạy lại script này.
 */
import { PrismaClient } from '@prisma/client';
import { BannerPlacement } from '../src/lib/banner-placement';
import { PrismaPg } from '@prisma/adapter-pg';
import { getPrismaPgPoolConfig } from '../src/lib/prisma-pg-pool-config';

const adapter = new PrismaPg(getPrismaPgPoolConfig());
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🖼️  Seed chỉ banner (không đụng dữ liệu khác)...');

  const heroBannerCount = await prisma.banner.count({
    where: { placement: BannerPlacement.HERO },
  });
  if (heroBannerCount === 0) {
    console.log('🖼️  Bổ sung banner hero mặc định (DB chưa có banner HERO)...');
    await prisma.banner.createMany({
      data: [
        {
          image: '/placeholders/cover.svg',
          title: 'Bộ sưu tập ghế ăn',
          subtitle: 'Đa dạng kiểu dáng, chất lượng cao cấp',
          link: '/collections/ghe-an',
          position: 0,
          placement: BannerPlacement.HERO,
        },
        {
          image: '/placeholders/cover.svg',
          title: 'Ghế bar phong cách',
          subtitle: 'Điểm nhấn hoàn hảo cho quầy bar',
          link: '/collections/ghe-bar',
          position: 1,
          placement: BannerPlacement.HERO,
        },
        {
          image: '/placeholders/cover.svg',
          title: 'Bàn trà hiện đại',
          subtitle: 'Bộ sưu tập bàn trà cao cấp',
          link: '/collections/ban-tra',
          position: 2,
          placement: BannerPlacement.HERO,
        },
      ],
    });
  } else {
    console.log('🖼️  Giữ nguyên banner HERO hiện có — bỏ qua tạo mặc định.');
  }

  const homeFourCount = await prisma.banner.count({
    where: { placement: BannerPlacement.HOME_FOUR },
  });
  if (homeFourCount === 0) {
    console.log('🖼️  Bổ sung 4 banner HOME_FOUR mặc định (chưa có nhóm này)...');
    await prisma.banner.createMany({
      data: [
        {
          image: 'https://file.hstatic.net/1000400963/file/xdaily-105-den-mat-trang_large.jpg',
          title: 'Đèn mặt trăng',
          link: '/products/den-treo-mat-trang-xdaily',
          position: 0,
          placement: BannerPlacement.HOME_FOUR,
        },
        {
          image: 'https://file.hstatic.net/1000400963/file/xdaily-104-shell-chair_large.jpg',
          title: 'Shell chair',
          link: '/products/ghe-thu-gian-ghe-shell-tg1',
          position: 1,
          placement: BannerPlacement.HOME_FOUR,
        },
        {
          image: 'https://file.hstatic.net/1000400963/file/xdaily-tu-ke_large.jpg',
          title: 'Tủ trang trí',
          link: '/products/tu-tap-go-trang-tri-xdaily',
          position: 2,
          placement: BannerPlacement.HOME_FOUR,
        },
        {
          image: 'https://file.hstatic.net/1000400963/file/xdaily-106-rattan-coffe-table_large.jpg',
          title: 'Bàn trà Rattan',
          link: '/products/ban-tra-may-kinh-song-rattan-xdaily',
          position: 3,
          placement: BannerPlacement.HOME_FOUR,
        },
      ],
    });
  } else {
    console.log('🖼️  Giữ nguyên banner HOME_FOUR hiện có — bỏ qua tạo mặc định.');
  }

  console.log('✅ Seed banner xong.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
