import { db } from "@/server";
import {
  products as productsTable,
  productVariants,
  variantImages,
  variantTags,
} from "@/server/schema";
import { desc, eq } from "drizzle-orm";
import placeholder from "@/public/placeholder_small.jpg";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function Products() {
  // Tüm ürünleri çek
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.id));

  if (!products || products.length === 0) console.error("No products found");

  // Her ürün için variant, image ve tagları çek
  const dataTable = await Promise.all(
    products.map(async (product) => {
      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productID, product.id));

      const variantsWithDetails = await Promise.all(
        variants.map(async (variant) => {
          const images = await db
            .select()
            .from(variantImages)
            .where(eq(variantImages.variantID, variant.id));
          const tags = await db
            .select()
            .from(variantTags)
            .where(eq(variantTags.variantID, variant.id));
          return { ...variant, variantImages: images, variantTags: tags };
        })
      );

      // İlk variant’ın ilk image’i fallback olarak
      const firstVariant = variantsWithDetails[0];
      const image = firstVariant?.variantImages?.[0]?.url ?? placeholder.src;

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        variants: variantsWithDetails,
        image,
      };
    })
  );

  return (
    <div>
      <DataTable columns={columns} data={dataTable} />
    </div>
  );
}
