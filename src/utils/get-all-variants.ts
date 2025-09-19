// src/server/queries/getAllVariants.ts
import { db } from "@/server";
import {
  productVariants,
  products,
  variantImages,
  variantTags,
} from "@/server/schema";
import { asc, eq } from "drizzle-orm";

export async function getAllVariants() {
  const rows = await db
    .select({
      variant: productVariants,
      product: products,
      image: variantImages,
      tag: variantTags,
    })
    .from(productVariants)
    .leftJoin(products, eq(products.id, productVariants.productID))
    .leftJoin(variantImages, eq(variantImages.variantID, productVariants.id))
    .leftJoin(variantTags, eq(variantTags.variantID, productVariants.id))
    .orderBy(asc(productVariants.id), asc(variantImages.order));
  const map = new Map<
    number,
    {
      id: number;
      color: string;
      productType: string;
      updated: Date | null;
      product: typeof products.$inferSelect | null;
      variantImages: (typeof variantImages.$inferSelect)[];
      variantTags: (typeof variantTags.$inferSelect)[];
    }
  >();

  for (const row of rows) {
    const v = row.variant;
    if (!map.has(v.id)) {
      map.set(v.id, {
        ...v,
        product: row.product,
        variantImages: [],
        variantTags: [],
      });
    }
    if (row.image) {
      map.get(v.id)!.variantImages.push(row.image);
    }
    if (row.tag) {
      map.get(v.id)!.variantTags.push(row.tag);
    }
  }

  return Array.from(map.values());
}
export type GetAllVariantsResult = Awaited<ReturnType<typeof getAllVariants>>;
