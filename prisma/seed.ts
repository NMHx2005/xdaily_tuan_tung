import { PrismaClient, type Prisma } from '@prisma/client';
import { BannerPlacement } from '../src/lib/banner-placement';
import { siteContentSchema } from '../src/lib/site-content-schema';
import { defaultSiteContent } from '../src/content/site-defaults';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { getPrismaPgPoolConfig } from '../src/lib/prisma-pg-pool-config';

const adapter = new PrismaPg(getPrismaPgPoolConfig());
const prisma = new PrismaClient({ adapter });

const XDAILY_BASE_URL = 'https://xdaily.vn';
const XDAILY_COLLECTION_FEEDS = [
  'ghe-an',
  'ghe-bar',
  'ban-tra',
  'sofa',
  'ban-an',
  'giuong-ngu',
  'bo-ban-ghe',
] as const;

type XdailyProductJson = {
  handle?: string;
  image?: { src?: string | null } | null;
  images?: { src?: string | null }[] | null;
};

type XdailyImagePools = {
  byHandle: Map<string, string[]>;
  byCollection: Map<string, string[]>;
};

type SeedProductImagePickInput = {
  slug: string;
  collectionSlug: string;
  position: number;
};

function normalizeRemoteImageUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  const withProtocol = value.startsWith('//')
    ? `https:${value}`
    : value.startsWith('/')
      ? `${XDAILY_BASE_URL}${value}`
      : value;
  const httpsValue = withProtocol.replace(/^http:\/\//i, 'https://');
  try {
    const url = new URL(httpsValue);
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function dedupeNonEmpty(items: Array<string | null | undefined>): string[] {
  return [...new Set(items.filter((item): item is string => Boolean(item && item.trim())))];
}

async function fetchXdailyCollectionProducts(
  collectionSlug: string,
): Promise<XdailyProductJson[]> {
  const endpoint = `${XDAILY_BASE_URL}/collections/${collectionSlug}/products.json?limit=250`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; xdaily-clone-seed/1.0)',
      },
    });
    if (!res.ok) {
      console.warn(`⚠️  Không lấy được feed ảnh ${collectionSlug}: HTTP ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { products?: XdailyProductJson[] };
    return json.products ?? [];
  } catch (error) {
    console.warn(`⚠️  Không lấy được feed ảnh ${collectionSlug}:`, error);
    return [];
  }
}

async function loadXdailyImagePools(): Promise<XdailyImagePools> {
  const byHandle = new Map<string, string[]>();
  const byCollection = new Map<string, string[]>();

  for (const collectionSlug of XDAILY_COLLECTION_FEEDS) {
    const products = await fetchXdailyCollectionProducts(collectionSlug);
    const pool: string[] = [];

    for (const p of products) {
      const productImages = dedupeNonEmpty([
        p.image?.src ? normalizeRemoteImageUrl(p.image.src) : null,
        ...(p.images ?? []).map((img) => normalizeRemoteImageUrl(img.src ?? null)),
      ]);
      if (productImages.length > 0) {
        pool.push(...productImages);
      }
      const handle = p.handle?.trim().toLowerCase();
      if (handle && productImages.length > 0) {
        byHandle.set(handle, productImages.slice(0, 6));
      }
    }

    byCollection.set(collectionSlug, dedupeNonEmpty(pool));
  }

  return { byHandle, byCollection };
}

function pickSeedProductImages(
  input: SeedProductImagePickInput,
  pools: XdailyImagePools,
): [string, string, string] {
  const fallback: [string, string, string] = [
    '/placeholders/product.svg',
    '/placeholders/product.svg',
    '/placeholders/product.svg',
  ];

  // Ưu tiên khớp trực tiếp theo handle nếu slug trong seed trùng website.
  const exact = pools.byHandle.get(input.slug.trim().toLowerCase());
  if (exact && exact.length > 0) {
    const safe = exact.slice(0, 3);
    while (safe.length < 3) safe.push(safe[0]!);
    return [safe[0]!, safe[1]!, safe[2]!];
  }

  // Nếu không match được, lấy ảnh thật theo pool của collection để tránh ảnh fake/ảnh vỡ.
  const pool = pools.byCollection.get(input.collectionSlug) ?? [];
  if (pool.length === 0) return fallback;

  const base = Math.max(0, input.position - 1) % pool.length;
  return [
    pool[base]!,
    pool[(base + 1) % pool.length]!,
    pool[(base + 2) % pool.length]!,
  ];
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.flashSaleItem.deleteMany();
  await prisma.flashSale.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productCollection.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  /** Không xóa Banner — giữ / chỉ bổ sung mặc định ở khối BANNERS bên dưới */
  await prisma.blogPost.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.allowedImageHost.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ── USERS ──
  console.log('👤 Creating users...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const customerHash = await bcrypt.hash('test123', 10);

  await prisma.user.create({
    data: { email: 'admin@xdaily.vn', name: 'TUANH Admin', passwordHash: adminHash, role: 'ADMIN' },
  });
  const customer = await prisma.user.create({
    data: { email: 'customer@test.com', name: 'Nguyễn Văn A', passwordHash: customerHash, role: 'CUSTOMER', phone: '0912345678' },
  });

  // ── COLLECTIONS ──
  console.log('📁 Creating collections...');
  const collectionsData = [
    { slug: 'ghe-an', name: 'Ghế ăn', description: 'Bộ sưu tập ghế ăn cao cấp với đa dạng kiểu dáng hiện đại.', position: 1 },
    { slug: 'ghe-bar', name: 'Ghế bar', description: 'Ghế bar phong cách, phù hợp quầy bar và đảo bếp.', position: 2 },
    { slug: 'ghe-chan-xoay', name: 'Ghế văn phòng', description: 'Ghế văn phòng ergonomic, thoải mái suốt ngày dài.', position: 3 },
    { slug: 'ghe-thu-gian', name: 'Ghế thư giãn', description: 'Ghế thư giãn êm ái cho không gian nghỉ ngơi.', position: 4 },
    { slug: 'sofa', name: 'Sofa', description: 'Sofa cao cấp, thiết kế sang trọng cho phòng khách.', position: 5 },
    { slug: 'giuong-ngu', name: 'Giường ngủ', description: 'Giường ngủ chắc chắn, thiết kế tối giản hiện đại.', position: 6 },
    { slug: 'ban-an', name: 'Bàn ăn', description: 'Bàn ăn gỗ tự nhiên và kim loại cho phòng ăn.', position: 7 },
    { slug: 'ban-tra', name: 'Bàn trà', description: 'Bàn trà phòng khách đa dạng kiểu dáng.', position: 8 },
    { slug: 'bo-ban-ghe', name: 'Bộ bàn ghế', description: 'Combo bàn ghế tiết kiệm, đồng bộ phong cách.', position: 9 },
    {
      slug: 'noi-that-phong-bep',
      name: 'Nội thất phòng bếp',
      description: 'Danh mục nhóm phòng bếp — bàn ăn, ghế bar, ghế ăn.',
      position: 10,
    },
    {
      slug: 'noi-that-cafe',
      name: 'Nội thất cafe, nhà hàng',
      description: 'Thiết kế không gian F&B — ghế bar, bàn cafe.',
      position: 11,
    },
  ];

  const collections: Record<string, string> = {};
  for (const c of collectionsData) {
    const col = await prisma.collection.create({ data: c });
    collections[c.slug] = col.id;
  }

  console.log('📐 Storefront menu (phân cấp + nav)...');
  const sofaId = collections['sofa']!;
  const phongBepId = collections['noi-that-phong-bep']!;
  const phongCafeId = collections['noi-that-cafe']!;

  await prisma.$transaction([
    prisma.collection.update({
      where: { id: collections['ghe-an'] },
      data: {
        navLabel: 'GIẢM GIÁ',
        showInStorefrontNav: true,
        navIcon: 'Percent',
        position: 0,
        parentId: null,
      },
    }),
    prisma.collection.update({
      where: { id: sofaId },
      data: {
        showInStorefrontNav: true,
        navIcon: 'Armchair',
        position: 1,
        parentId: null,
      },
    }),
    prisma.collection.update({
      where: { id: collections['ban-tra'] },
      data: {
        parentId: sofaId,
        position: 0,
        showInStorefrontNav: true,
        navIcon: 'Package',
      },
    }),
    prisma.collection.update({
      where: { id: phongBepId },
      data: {
        showInStorefrontNav: true,
        navIcon: 'Utensils',
        position: 2,
        parentId: null,
      },
    }),
    prisma.collection.update({
      where: { id: collections['ban-an'] },
      data: {
        parentId: phongBepId,
        position: 0,
        showInStorefrontNav: true,
        navIcon: 'Package',
      },
    }),
    prisma.collection.update({
      where: { id: collections['ghe-bar'] },
      data: {
        parentId: phongBepId,
        position: 1,
        showInStorefrontNav: true,
        navIcon: 'Package',
      },
    }),
    prisma.collection.update({
      where: { id: collections['giuong-ngu'] },
      data: {
        showInStorefrontNav: true,
        navIcon: 'Bed',
        position: 3,
        parentId: null,
      },
    }),
    prisma.collection.update({
      where: { id: collections['ghe-chan-xoay'] },
      data: {
        showInStorefrontNav: true,
        navIcon: 'Briefcase',
        position: 4,
        parentId: null,
      },
    }),
    prisma.collection.update({
      where: { id: phongCafeId },
      data: {
        showInStorefrontNav: true,
        navIcon: 'Coffee',
        position: 5,
        parentId: null,
      },
    }),
    prisma.collection.update({
      where: { id: collections['ghe-thu-gian'] },
      data: {
        navLabel: 'SPA',
        showInStorefrontNav: true,
        navIcon: 'Sparkles',
        position: 6,
        parentId: null,
      },
    }),
    prisma.collection.update({
      where: { id: collections['bo-ban-ghe'] },
      data: {
        navLabel: 'Vật liệu',
        showInStorefrontNav: true,
        navIcon: 'Package',
        position: 7,
        parentId: null,
      },
    }),
  ]);

  const homeCategoryStripSeed: {
    slug: string;
    homeStripPosition: number;
    image: string;
    homeStripLabel?: string;
  }[] = [
      {
        slug: 'ghe-an',
        homeStripPosition: 0,
        image:
          'https://file.hstatic.net/1000400963/file/ghe-an-xdaily-valle-chair-01__3__compact.jpg',
      },
      {
        slug: 'ghe-bar',
        homeStripPosition: 1,
        image: 'https://file.hstatic.net/1000400963/file/xdaily-kink-bar_compact.jpg',
      },
      {
        slug: 'ghe-chan-xoay',
        homeStripPosition: 2,
        image:
          'https://file.hstatic.net/1000400963/file/ghe-van-phong-xdaily-gx882__2__compact.jpg',
      },
      {
        slug: 'ghe-thu-gian',
        homeStripPosition: 3,
        image:
          'https://file.hstatic.net/1000400963/file/mat-truoc-ghe-shell-chair_compact.jpg',
      },
      {
        slug: 'sofa',
        homeStripPosition: 4,
        image: 'https://file.hstatic.net/1000400963/file/sofa-xdaily-fly-01_compact.jpg',
      },
      {
        slug: 'giuong-ngu',
        homeStripPosition: 5,
        image:
          'https://file.hstatic.net/1000400963/file/giuong-ngu-xdaily-bed-italia__1__compact.jpg',
      },
      {
        slug: 'ban-an',
        homeStripPosition: 6,
        image:
          'https://file.hstatic.net/1000400963/file/24062_n_wedge-dining-01-scont_compact.jpg',
      },
      {
        slug: 'noi-that-cafe',
        homeStripPosition: 7,
        image:
          'https://file.hstatic.net/1000400963/file/ban-cafe-nhua-duc-xdaily-bl1__2__compact.jpg',
        homeStripLabel: 'Bộ sưu tập chân bàn cafe',
      },
      {
        slug: 'bo-ban-ghe',
        homeStripPosition: 8,
        image:
          'https://file.hstatic.net/1000400963/file/ghe-an-xdaily-valle-chair__8__compact.jpg',
      },
    ];
  for (const row of homeCategoryStripSeed) {
    await prisma.collection.updateMany({
      where: { slug: row.slug },
      data: {
        image: row.image,
        showOnHomeCategoryStrip: true,
        homeStripPosition: row.homeStripPosition,
        ...(row.homeStripLabel ? { homeStripLabel: row.homeStripLabel } : {}),
      },
    });
  }

  // ── PRODUCTS ──
  console.log('📦 Creating products...');
  console.log('🛰️  Syncing real product images from xdaily.vn feeds...');
  const xdailyImagePools = await loadXdailyImagePools();
  const totalFetchedImages = Array.from(xdailyImagePools.byCollection.values())
    .reduce((sum, list) => sum + list.length, 0);
  console.log(`🖼️  Loaded ${totalFetchedImages} remote images from collections.`);

  interface ProductSeed {
    slug: string; name: string; price: number; compareAtPrice?: number;
    sku: string; badge?: string; isFeatured?: boolean; shortDescription?: string;
    collectionSlug: string; position: number; stockQuantity?: number;
    variants?: { name: string; colorHex: string; price: number; sku: string; compareAtPrice?: number }[];
    specifications?: { key: string; value: string }[];
  }

  const products: ProductSeed[] = [
    // ── GHẾ ĂN (15) ──
    { slug: 'ghe-an-granite-chair', name: 'Ghế ăn GRANITE CHAIR', price: 2100000, compareAtPrice: 2800000, sku: 'XD-GAN-001', badge: 'bestseller', isFeatured: true, shortDescription: 'Ghế ăn cao cấp với khung thép sơn tĩnh điện, đệm bọc da PU.', collectionSlug: 'ghe-an', position: 1, stockQuantity: 50, variants: [{ name: 'Đen', colorHex: '#000000', price: 2100000, sku: 'XD-GAN-001-BK' }, { name: 'Trắng', colorHex: '#FFFFFF', price: 2100000, sku: 'XD-GAN-001-WH' }, { name: 'Nâu', colorHex: '#8B4513', price: 2200000, sku: 'XD-GAN-001-BR' }], specifications: [{ key: 'Chất liệu', value: 'Thép sơn tĩnh điện + Da PU' }, { key: 'Kích thước', value: '45 x 52 x 82 cm' }, { key: 'Tải trọng', value: '120 kg' }] },
    { slug: 'ghe-an-kink-chair', name: 'Ghế ăn Kink Chair', price: 2100000, sku: 'XD-GAN-002', shortDescription: 'Thiết kế cong mềm mại, phù hợp phòng ăn hiện đại.', collectionSlug: 'ghe-an', position: 2, stockQuantity: 30 },
    { slug: 'ghe-an-tolix-a', name: 'Ghế ăn Tolix A', price: 700000, sku: 'XD-GAN-003', isFeatured: true, shortDescription: 'Ghế Tolix phong cách công nghiệp, nhiều màu sắc.', collectionSlug: 'ghe-an', position: 3, stockQuantity: 100, variants: [{ name: 'Đen', colorHex: '#000000', price: 700000, sku: 'XD-GAN-003-BK' }, { name: 'Trắng', colorHex: '#FFFFFF', price: 700000, sku: 'XD-GAN-003-WH' }, { name: 'Đỏ', colorHex: '#DC2626', price: 700000, sku: 'XD-GAN-003-RD' }, { name: 'Xanh', colorHex: '#2563EB', price: 700000, sku: 'XD-GAN-003-BL' }, { name: 'Vàng', colorHex: '#EAB308', price: 700000, sku: 'XD-GAN-003-YL' }] },
    { slug: 'ghe-an-piago-iron', name: 'Ghế ăn Piago Chair Iron', price: 1400000, compareAtPrice: 1700000, sku: 'XD-GAN-004', shortDescription: 'Khung sắt sơn tĩnh điện kết hợp đệm êm ái.', collectionSlug: 'ghe-an', position: 4, stockQuantity: 40 },
    { slug: 'ghe-an-katana', name: 'Ghế ăn Katana Chair', price: 1200000, compareAtPrice: 1300000, sku: 'XD-GAN-005', badge: 'bestseller', shortDescription: 'Kiểu dáng thanh lịch, gọn nhẹ.', collectionSlug: 'ghe-an', position: 5, stockQuantity: 60 },
    { slug: 'ghe-an-rom', name: 'Ghế ăn ROM Chair', price: 3100000, compareAtPrice: 3200000, sku: 'XD-GAN-006', shortDescription: 'Ghế ROM cao cấp, bọc da thật.', collectionSlug: 'ghe-an', position: 6, stockQuantity: 20 },
    { slug: 'ghe-an-perla-z6', name: 'Ghế ăn Perla Z6', price: 1200000, sku: 'XD-GAN-007', shortDescription: 'Thiết kế tối giản, phù hợp mọi không gian.', collectionSlug: 'ghe-an', position: 7, stockQuantity: 45 },
    { slug: 'ghe-sung-bo', name: 'Ghế sừng bò đệm vuông', price: 1100000, compareAtPrice: 1200000, sku: 'XD-GAN-008', badge: 'bestseller', shortDescription: 'Ghế sừng bò iconic, đệm vuông thoải mái.', collectionSlug: 'ghe-an', position: 8, stockQuantity: 70, variants: [{ name: 'Đen', colorHex: '#000000', price: 1100000, sku: 'XD-GAN-008-BK' }, { name: 'Nâu', colorHex: '#8B4513', price: 1100000, sku: 'XD-GAN-008-BR' }, { name: 'Xám', colorHex: '#808080', price: 1100000, sku: 'XD-GAN-008-GR' }] },
    { slug: 'ghe-bull-italy-z1', name: 'Ghế ăn Bull Italy Z1', price: 1800000, compareAtPrice: 2000000, sku: 'XD-GAN-009', badge: 'bestseller', isFeatured: true, shortDescription: 'Phong cách Ý, đường nét tinh tế.', collectionSlug: 'ghe-an', position: 9, stockQuantity: 35 },
    { slug: 'ghe-chu-a-v9', name: 'Ghế chữ A V9', price: 1100000, sku: 'XD-GAN-010', shortDescription: 'Ghế chữ A thanh mảnh, gọn gàng.', collectionSlug: 'ghe-an', position: 10, stockQuantity: 55, variants: [{ name: 'Gỗ tự nhiên', colorHex: '#D2691E', price: 1100000, sku: 'XD-GAN-010-NT' }, { name: 'Walnut', colorHex: '#5C4033', price: 1200000, sku: 'XD-GAN-010-WN' }] },
    { slug: 'ghe-an-windsor', name: 'Ghế ăn Windsor', price: 1500000, sku: 'XD-GAN-011', badge: 'new', shortDescription: 'Ghế Windsor cổ điển, chất liệu gỗ ash.', collectionSlug: 'ghe-an', position: 11, stockQuantity: 25 },
    { slug: 'ghe-an-eames', name: 'Ghế ăn Eames Chair', price: 900000, sku: 'XD-GAN-012', isFeatured: true, shortDescription: 'Ghế Eames nhựa PP cao cấp, chân gỗ sồi.', collectionSlug: 'ghe-an', position: 12, stockQuantity: 80, variants: [{ name: 'Trắng', colorHex: '#FFFFFF', price: 900000, sku: 'XD-GAN-012-WH' }, { name: 'Đen', colorHex: '#000000', price: 900000, sku: 'XD-GAN-012-BK' }, { name: 'Xám', colorHex: '#808080', price: 900000, sku: 'XD-GAN-012-GR' }] },
    { slug: 'ghe-an-tulip', name: 'Ghế ăn Tulip', price: 1300000, compareAtPrice: 1500000, sku: 'XD-GAN-013', shortDescription: 'Ghế Tulip xoay 360 độ, đệm bọc nỉ.', collectionSlug: 'ghe-an', position: 13, stockQuantity: 30 },
    { slug: 'ghe-an-belly', name: 'Ghế ăn Belly Chair', price: 1600000, sku: 'XD-GAN-014', shortDescription: 'Lưng ghế ôm cong, cực kỳ thoải mái.', collectionSlug: 'ghe-an', position: 14, stockQuantity: 20 },
    { slug: 'ghe-an-wishbone', name: 'Ghế ăn Wishbone', price: 2500000, compareAtPrice: 2800000, sku: 'XD-GAN-015', badge: 'new', isFeatured: true, shortDescription: 'Ghế Wishbone gỗ sồi, đan dây thừng tay.', collectionSlug: 'ghe-an', position: 15, stockQuantity: 15 },

    // ── BÀN TRÀ (10) ──
    { slug: 'ban-tra-bts8', name: 'Bàn trà BTS8', price: 3500000, compareAtPrice: 4000000, sku: 'XD-BT-001', badge: 'bestseller', isFeatured: true, shortDescription: 'Bàn trà mặt đá sintered stone, chân thép.', collectionSlug: 'ban-tra', position: 1, stockQuantity: 20 },
    { slug: 'ban-tra-sabi', name: 'Bàn trà Sabi', price: 2800000, sku: 'XD-BT-002', shortDescription: 'Bàn trà phong cách Nhật Bản, gỗ tự nhiên.', collectionSlug: 'ban-tra', position: 2, stockQuantity: 15 },
    { slug: 'ban-tra-tobi-ishi', name: 'Bàn trà Tobi Ishi', price: 4200000, compareAtPrice: 4800000, sku: 'XD-BT-003', shortDescription: 'Thiết kế độc đáo lấy cảm hứng từ sỏi đá.', collectionSlug: 'ban-tra', position: 3, stockQuantity: 10 },
    { slug: 'ban-tra-wedge', name: 'Bàn trà Wedge', price: 2200000, sku: 'XD-BT-004', isFeatured: true, shortDescription: 'Bàn trà hình nêm, phong cách Bắc Âu.', collectionSlug: 'ban-tra', position: 4, stockQuantity: 25 },
    { slug: 'ban-tra-erip', name: 'Bàn trà Erip', price: 1800000, sku: 'XD-BT-005', shortDescription: 'Bàn trà nhỏ gọn, phù hợp căn hộ.', collectionSlug: 'ban-tra', position: 5, stockQuantity: 35 },
    { slug: 'ban-tra-solo', name: 'Bàn trà Solo', price: 1500000, sku: 'XD-BT-006', shortDescription: 'Bàn trà đơn, chân kim loại mảnh.', collectionSlug: 'ban-tra', position: 6, stockQuantity: 40 },
    { slug: 'ban-tra-bow', name: 'Bàn trà BOW', price: 3200000, sku: 'XD-BT-007', badge: 'new', shortDescription: 'Bàn trà BOW mặt kính cường lực.', collectionSlug: 'ban-tra', position: 7, stockQuantity: 12 },
    { slug: 'ban-tra-2plus', name: 'Bàn trà 2 PLUS', price: 2600000, sku: 'XD-BT-008', shortDescription: 'Bàn trà đôi xếp lồng, tiện dụng.', collectionSlug: 'ban-tra', position: 8, stockQuantity: 18 },
    { slug: 'ban-tra-kaizen', name: 'Bàn trà Kaizen', price: 3800000, compareAtPrice: 4200000, sku: 'XD-BT-009', shortDescription: 'Bàn trà Kaizen mặt gỗ óc chó.', collectionSlug: 'ban-tra', position: 9, stockQuantity: 8 },
    { slug: 'ban-tra-boomerang', name: 'Bàn trà Boomerang', price: 2900000, sku: 'XD-BT-010', shortDescription: 'Bàn trà hình boomerang độc đáo.', collectionSlug: 'ban-tra', position: 10, stockQuantity: 14 },

    // ── GHẾ BAR (10) ──
    { slug: 'ghe-bar-pinstol', name: 'Ghế bar PINSTOL', price: 1800000, compareAtPrice: 2000000, sku: 'XD-GB-001', badge: 'bestseller', isFeatured: true, shortDescription: 'Ghế bar cao, đệm tròn xoay 360 độ.', collectionSlug: 'ghe-bar', position: 1, stockQuantity: 30, variants: [{ name: 'Đen', colorHex: '#000000', price: 1800000, sku: 'XD-GB-001-BK' }, { name: 'Nâu', colorHex: '#8B4513', price: 1800000, sku: 'XD-GB-001-BR' }] },
    { slug: 'ghe-bar-piago', name: 'Ghế bar Piago Stool', price: 1600000, sku: 'XD-GB-002', shortDescription: 'Ghế bar Piago chân sắt mảnh.', collectionSlug: 'ghe-bar', position: 2, stockQuantity: 25 },
    { slug: 'ghe-bar-kink', name: 'Ghế bar Kink', price: 2200000, sku: 'XD-GB-003', shortDescription: 'Ghế bar Kink cao cấp, lưng cong.', collectionSlug: 'ghe-bar', position: 3, stockQuantity: 20 },
    { slug: 'ghe-bar-tolix', name: 'Ghế bar Tolix', price: 850000, sku: 'XD-GB-004', shortDescription: 'Ghế bar Tolix phong cách công nghiệp.', collectionSlug: 'ghe-bar', position: 4, stockQuantity: 60, variants: [{ name: 'Đen', colorHex: '#000000', price: 850000, sku: 'XD-GB-004-BK' }, { name: 'Trắng', colorHex: '#FFFFFF', price: 850000, sku: 'XD-GB-004-WH' }, { name: 'Đỏ', colorHex: '#DC2626', price: 850000, sku: 'XD-GB-004-RD' }] },
    { slug: 'ghe-bar-box-fillet', name: 'Ghế bar BOX FILLET', price: 2400000, compareAtPrice: 2800000, sku: 'XD-GB-005', shortDescription: 'Ghế bar BOX FILLET bọc da cao cấp.', collectionSlug: 'ghe-bar', position: 5, stockQuantity: 15 },
    { slug: 'ghe-bar-hit', name: 'Ghế bar HIT', price: 1400000, sku: 'XD-GB-006', badge: 'new', shortDescription: 'Ghế bar HIT gọn nhẹ, dễ di chuyển.', collectionSlug: 'ghe-bar', position: 6, stockQuantity: 35 },
    { slug: 'ghe-bar-tube', name: 'Ghế bar Tube', price: 1900000, sku: 'XD-GB-007', shortDescription: 'Ghế bar ống thép, mặt ngồi gỗ.', collectionSlug: 'ghe-bar', position: 7, stockQuantity: 22 },
    { slug: 'ghe-bar-arch', name: 'Ghế bar Arch', price: 2100000, sku: 'XD-GB-008', shortDescription: 'Ghế bar Arch lưng vòm thanh lịch.', collectionSlug: 'ghe-bar', position: 8, stockQuantity: 18 },
    { slug: 'ghe-bar-minimal', name: 'Ghế bar Minimal', price: 1200000, sku: 'XD-GB-009', shortDescription: 'Ghế bar tối giản, chân inox.', collectionSlug: 'ghe-bar', position: 9, stockQuantity: 40 },
    { slug: 'ghe-bar-wave', name: 'Ghế bar Wave', price: 1700000, compareAtPrice: 1900000, sku: 'XD-GB-010', shortDescription: 'Ghế bar Wave mặt lượn sóng.', collectionSlug: 'ghe-bar', position: 10, stockQuantity: 28 },

    // ── SOFA (5) ──
    { slug: 'sofa-nordic-2seat', name: 'Sofa Nordic 2 chỗ', price: 8500000, compareAtPrice: 9500000, sku: 'XD-SF-001', badge: 'bestseller', isFeatured: true, shortDescription: 'Sofa Bắc Âu 2 chỗ, bọc vải nỉ.', collectionSlug: 'sofa', position: 1, stockQuantity: 10 },
    { slug: 'sofa-cloud-3seat', name: 'Sofa Cloud 3 chỗ', price: 12000000, sku: 'XD-SF-002', shortDescription: 'Sofa Cloud êm ái, đệm mút memory foam.', collectionSlug: 'sofa', position: 2, stockQuantity: 8 },
    { slug: 'sofa-daybed-lazy', name: 'Sofa Daybed Lazy', price: 6500000, sku: 'XD-SF-003', shortDescription: 'Sofa giường đa năng, tiện ích.', collectionSlug: 'sofa', position: 3, stockQuantity: 12 },
    { slug: 'sofa-lshape-modern', name: 'Sofa chữ L Modern', price: 15000000, compareAtPrice: 17000000, sku: 'XD-SF-004', badge: 'new', shortDescription: 'Sofa góc chữ L cho phòng khách rộng.', collectionSlug: 'sofa', position: 4, stockQuantity: 5 },
    { slug: 'sofa-single-accent', name: 'Sofa đơn Accent', price: 4500000, sku: 'XD-SF-005', shortDescription: 'Sofa đơn accent, điểm nhấn phòng khách.', collectionSlug: 'sofa', position: 5, stockQuantity: 15, variants: [{ name: 'Xanh rêu', colorHex: '#556B2F', price: 4500000, sku: 'XD-SF-005-GR' }, { name: 'Cam đất', colorHex: '#CD853F', price: 4500000, sku: 'XD-SF-005-OR' }] },

    // ── BÀN ĂN (5) ──
    { slug: 'ban-an-rectangle-oak', name: 'Bàn ăn Rectangle Oak', price: 5800000, compareAtPrice: 6500000, sku: 'XD-BA-001', isFeatured: true, shortDescription: 'Bàn ăn gỗ sồi hình chữ nhật 6 chỗ.', collectionSlug: 'ban-an', position: 1, stockQuantity: 10 },
    { slug: 'ban-an-round-marble', name: 'Bàn ăn tròn Marble', price: 7200000, sku: 'XD-BA-002', badge: 'new', shortDescription: 'Bàn ăn tròn mặt đá marble trắng.', collectionSlug: 'ban-an', position: 2, stockQuantity: 8 },
    { slug: 'ban-an-minimal-4', name: 'Bàn ăn Minimal 4 chỗ', price: 3800000, sku: 'XD-BA-003', shortDescription: 'Bàn ăn nhỏ 4 chỗ, phù hợp căn hộ.', collectionSlug: 'ban-an', position: 3, stockQuantity: 20 },
    { slug: 'ban-an-extend-walnut', name: 'Bàn ăn mở rộng Walnut', price: 9500000, sku: 'XD-BA-004', shortDescription: 'Bàn ăn mở rộng gỗ óc chó, 4-8 chỗ.', collectionSlug: 'ban-an', position: 4, stockQuantity: 6 },
    { slug: 'ban-an-steel-leg', name: 'Bàn ăn Steel Leg', price: 4500000, sku: 'XD-BA-005', shortDescription: 'Bàn ăn mặt gỗ, chân thép chữ X.', collectionSlug: 'ban-an', position: 5, stockQuantity: 15 },

    // ── GIƯỜNG NGỦ (3) ──
    { slug: 'giuong-platform-oak', name: 'Giường Platform Oak', price: 8000000, compareAtPrice: 9000000, sku: 'XD-GN-001', isFeatured: true, shortDescription: 'Giường bệt gỗ sồi, kiểu dáng Nhật Bản.', collectionSlug: 'giuong-ngu', position: 1, stockQuantity: 8 },
    { slug: 'giuong-storage-modern', name: 'Giường ngăn kéo Modern', price: 10500000, sku: 'XD-GN-002', badge: 'new', shortDescription: 'Giường có 4 ngăn kéo lưu trữ.', collectionSlug: 'giuong-ngu', position: 2, stockQuantity: 5 },
    { slug: 'giuong-upholstered', name: 'Giường bọc nỉ Upholstered', price: 12000000, sku: 'XD-GN-003', shortDescription: 'Giường bọc nỉ cao cấp, đầu giường êm ái.', collectionSlug: 'giuong-ngu', position: 3, stockQuantity: 6 },

    // ── BỘ BÀN GHẾ (3) ──
    { slug: 'bo-ban-ghe-cafe', name: 'Bộ bàn ghế Cafe', price: 3500000, compareAtPrice: 4200000, sku: 'XD-BBG-001', badge: 'bestseller', shortDescription: '1 bàn tròn + 2 ghế Tolix, phù hợp quán cafe.', collectionSlug: 'bo-ban-ghe', position: 1, stockQuantity: 20 },
    { slug: 'bo-ban-ghe-an-4', name: 'Bộ bàn ăn 4 chỗ Nordic', price: 7800000, compareAtPrice: 8500000, sku: 'XD-BBG-002', shortDescription: '1 bàn chữ nhật + 4 ghế Eames.', collectionSlug: 'bo-ban-ghe', position: 2, stockQuantity: 10 },
    { slug: 'bo-ban-ghe-an-6', name: 'Bộ bàn ăn 6 chỗ Premium', price: 14500000, sku: 'XD-BBG-003', badge: 'new', shortDescription: '1 bàn gỗ sồi lớn + 6 ghế Wishbone.', collectionSlug: 'bo-ban-ghe', position: 3, stockQuantity: 5 },
  ];

  const createdProductIds: string[] = [];

  for (const p of products) {
    const { collectionSlug, variants, specifications, ...productData } = p;
    const [img1, img2, img3] = pickSeedProductImages(
      {
        slug: productData.slug,
        collectionSlug,
        position: productData.position,
      },
      xdailyImagePools,
    );
    const product = await prisma.product.create({
      data: {
        ...productData,
        description: `<p>${productData.shortDescription}</p><p>Sản phẩm ${productData.name} được thiết kế và sản xuất tại nhà máy TUANH với tiêu chuẩn cao nhất. Chất liệu được chọn lọc kỹ lưỡng, đảm bảo độ bền và tính thẩm mỹ lâu dài.</p><h3>Đặc điểm nổi bật</h3><ul><li>Thiết kế hiện đại, phù hợp mọi không gian</li><li>Chất liệu cao cấp, bền bỉ theo thời gian</li><li>Dễ dàng vệ sinh và bảo quản</li><li>Bảo hành 12 tháng tại nhà máy</li></ul>`,
        specifications: specifications ?? [],
        images: {
          create: [
            { url: img1, alt: productData.name, position: 0 },
            { url: img2, alt: `${productData.name} - Góc 2`, position: 1 },
            { url: img3, alt: `${productData.name} - Chi tiết`, position: 2 },
          ],
        },
        variants: variants ? { create: variants.map((v, i) => ({ ...v, position: i })) } : undefined,
        collections: { create: { collectionId: collections[collectionSlug], position: productData.position } },
      },
    });
    createdProductIds.push(product.id);
  }

  // ── BANNERS ── (chỉ bổ sung nếu chưa có — không ghi đè/xóa banner đang có trên DB)
  const heroBannerCount = await prisma.banner.count({
    where: { placement: BannerPlacement.HERO },
  });
  if (heroBannerCount === 0) {
    console.log('🖼️  Bổ sung banner hero mặc định (DB chưa có banner HERO)...');
    await prisma.banner.createMany({
      data: [
        { image: '/placeholders/cover.svg', title: 'Bộ sưu tập ghế ăn', subtitle: 'Đa dạng kiểu dáng, chất lượng cao cấp', link: '/collections/ghe-an', position: 0, placement: BannerPlacement.HERO },
        { image: '/placeholders/cover.svg', title: 'Ghế bar phong cách', subtitle: 'Điểm nhấn hoàn hảo cho quầy bar', link: '/collections/ghe-bar', position: 1, placement: BannerPlacement.HERO },
        { image: '/placeholders/cover.svg', title: 'Bàn trà hiện đại', subtitle: 'Bộ sưu tập bàn trà cao cấp', link: '/collections/ban-tra', position: 2, placement: BannerPlacement.HERO },
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

  // ── FLASH SALE ──
  console.log('⚡ Creating flash sale...');
  const flashSaleProductIndices = [0, 2, 4, 7, 15]; // granite, tolix-a, katana, sung-bo, bts8
  await prisma.flashSale.create({
    data: {
      name: 'Flash Sale Tháng 4',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      items: {
        create: flashSaleProductIndices.map((idx, pos) => ({
          productId: createdProductIds[idx],
          salePrice: Math.round(products[idx].price * 0.8),
          position: pos,
        })),
      },
    },
  });

  // ── BLOG POSTS ──
  console.log('📝 Creating blog posts...');
  const blogs = [
    { slug: 'nhua-pvc-la-gi', title: 'Nhựa PVC là gì? Những ứng dụng không thể thiếu của nhựa PVC', excerpt: 'Tìm hiểu về nhựa PVC - loại vật liệu phổ biến trong ngành nội thất và ứng dụng rộng rãi trong đời sống hàng ngày.', tags: ['vật liệu', 'kiến thức'] },
    { slug: 'da-pu-ung-dung', title: 'Tổng quan về da PU và những ứng dụng của vật liệu này trong đời sống', excerpt: 'Da PU là gì? Ưu nhược điểm và cách phân biệt da PU với da thật trong nội thất.', tags: ['vật liệu', 'kiến thức', 'da PU'] },
    { slug: 'da-nhan-tao-la-gi', title: 'Da nhân tạo là gì?', excerpt: 'Tổng hợp kiến thức về các loại da nhân tạo phổ biến: da PU, da PVC, da microfiber và ứng dụng.', tags: ['vật liệu', 'kiến thức'] },
    { slug: 'luu-y-ve-sinh-do-go', title: '7 Lưu ý khi vệ sinh và bảo quản đồ gỗ nội thất', excerpt: 'Hướng dẫn chi tiết cách vệ sinh và bảo quản đồ gỗ nội thất đúng cách để kéo dài tuổi thọ sản phẩm.', tags: ['bảo quản', 'mẹo vặt', 'gỗ'] },
    { slug: 'vat-lieu-mdf', title: 'Vật Liệu MDF: Sáng tạo trong thiết kế nội thất', excerpt: 'MDF là vật liệu gỗ công nghiệp được sử dụng rộng rãi. Tìm hiểu ưu nhược điểm và ứng dụng.', tags: ['vật liệu', 'MDF', 'thiết kế'] },
    { slug: 'phong-cach-indochine', title: 'Phong Cách Nội Thất Indochine', excerpt: 'Khám phá phong cách nội thất Đông Dương - sự kết hợp tinh tế giữa văn hóa Á Đông và Pháp.', tags: ['phong cách', 'thiết kế', 'Indochine'] },
  ];

  for (let i = 0; i < blogs.length; i++) {
    const b = blogs[i];
    await prisma.blogPost.create({
      data: {
        ...b,
        content: `<h2>${b.title}</h2><p>${b.excerpt}</p><p>Trong ngành công nghiệp nội thất hiện đại, việc hiểu rõ về các loại vật liệu là vô cùng quan trọng. Điều này giúp người tiêu dùng có thể đưa ra quyết định mua sắm thông minh và phù hợp với nhu cầu sử dụng.</p><h3>Giới thiệu</h3><p>Bài viết này sẽ cung cấp cho bạn những thông tin chi tiết và hữu ích nhất về chủ đề này. Hãy cùng TUANH tìm hiểu nhé!</p><h3>Kết luận</h3><p>Hy vọng bài viết đã cung cấp cho bạn những kiến thức bổ ích. Đừng quên ghé thăm showroom TUANH để trải nghiệm trực tiếp các sản phẩm nội thất cao cấp.</p>`,
        thumbnail: '/placeholders/cover.svg',
        author: 'TUANH',
        isPublished: true,
        publishedAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000),
        seoTitle: b.title,
        seoDescription: b.excerpt,
      },
    });
  }

  // ── REVIEWS ──
  console.log('⭐ Creating reviews...');
  const reviewData = [
    { productIdx: 0, author: 'Minh Tuấn', rating: 5, content: 'Ghế rất đẹp, chắc chắn. Đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng!', purchaseStatus: 'purchased' },
    { productIdx: 0, author: 'Thu Hà', rating: 4, content: 'Chất lượng tốt, đúng như mô tả. Màu sắc hơi khác so với hình một chút nhưng vẫn đẹp.', purchaseStatus: 'purchased' },
    { productIdx: 2, author: 'Văn Đức', rating: 5, content: 'Giá rẻ mà chất lượng tốt bất ngờ. Mua 4 cái cho phòng ăn, ai cũng khen.', purchaseStatus: 'purchased' },
    { productIdx: 8, author: 'Thanh Nga', rating: 4, content: 'Ghế đẹp, phong cách Ý. Đệm ngồi êm, lưng tựa thoải mái. Recommend!', purchaseStatus: 'using' },
    { productIdx: 15, author: 'Hoàng Long', rating: 5, content: 'Bàn trà rất đẹp, mặt đá sang trọng. Đặt trong phòng khách rất hợp.', purchaseStatus: 'purchased' },
  ];

  for (const r of reviewData) {
    await prisma.review.create({
      data: {
        productId: createdProductIds[r.productIdx],
        userId: customer.id,
        author: r.author,
        rating: r.rating,
        content: r.content,
        purchaseStatus: r.purchaseStatus,
      },
    });
  }

  console.log('🌐 Seeding site content (logo, liên hệ, trang Giới thiệu & Liên hệ)...');
  const sitePayload = siteContentSchema.parse(
    JSON.parse(JSON.stringify(defaultSiteContent)),
  );
  await prisma.siteContent.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      payload: sitePayload as unknown as Prisma.InputJsonValue,
    },
    update: {
      payload: sitePayload as unknown as Prisma.InputJsonValue,
    },
  });

  console.log('✅ Seed completed!');
  console.log(`   ${products.length} products`);
  console.log(`   ${collectionsData.length} collections`);
  console.log(`   Banner: chỉ bổ sung hero / HOME_FOUR mặc định nếu nhóm đó đang trống`);
  console.log(`   1 flash sale (${flashSaleProductIndices.length} items)`);
  console.log(`   ${blogs.length} blog posts`);
  console.log(`   ${reviewData.length} reviews`);
  console.log(`   2 users (admin + customer)`);
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('   Admin:    admin@xdaily.vn / admin123');
  console.log('   Customer: customer@test.com / test123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
