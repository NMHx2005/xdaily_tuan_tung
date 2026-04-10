import { z } from "zod";

import { NAV_ICON_OPTION_VALUES } from "@/lib/storefront-nav";

export const collectionNavIconSchema = z.enum(NAV_ICON_OPTION_VALUES);

/** Form tạo / sửa danh mục (admin) */
export const collectionAdminFormSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  isVisible: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  parentId: z.string().nullable(),
  navLabel: z.string(),
  navIcon: collectionNavIconSchema,
  showInStorefrontNav: z.boolean(),
  position: z.number().int(),
  showOnHomeCategoryStrip: z.boolean(),
  homeStripPosition: z.number().int(),
  homeStripLabel: z.string(),
});

export type CollectionAdminFormValues = z.infer<typeof collectionAdminFormSchema>;
