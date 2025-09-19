"use server";

import { VariantSchema } from "@/types/variant-schema";
import { createSafeActionClient } from "next-safe-action";
import {
  products,
  productVariants,
  variantImages,
  variantTags,
} from "../schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { algoliasearch } from "algoliasearch";

const actionClient = createSafeActionClient();

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_ID!,
  process.env.ALGOLIA_ADMIN!
);

export const createVariant = actionClient
  .inputSchema(VariantSchema)
  .action(async ({ parsedInput }) => {
    const {
      color,
      editMode,
      id,
      productID,
      productType,
      tags,
      variantImages: newImages,
    } = parsedInput;

    try {
      if (editMode && id) {
        // EDIT VARIANT
        const editVariant = await db
          .update(productVariants)
          .set({ color, productType, updated: new Date() })
          .where(eq(productVariants.id, id))
          .returning();

        const variantId = editVariant[0].id;

        await db
          .delete(variantTags)
          .where(eq(variantTags.variantID, variantId));
        await db
          .insert(variantTags)
          .values(tags.map((tag) => ({ tag, variantID: variantId })));

        await db
          .delete(variantImages)
          .where(eq(variantImages.variantID, variantId));
        await db.insert(variantImages).values(
          newImages.map((img, idx) => ({
            name: img.name ?? "",
            size: img.size,
            url: img.url,
            variantID: variantId,
            order: idx,
          }))
        );
        await client.partialUpdateObject({
          indexName: "products",
          objectID: editVariant[0].id.toString(),

          attributesToUpdate: {
            productType,
            color,
            tags,
            images: newImages.map((img) => img.url),
          },
        });

        revalidatePath("/dashboard/products");
        return { success: `Edited ${productType}` };
      }

      // CREATE NEW VARIANT
      const newVariant = await db
        .insert(productVariants)
        .values({ color, productType, productID })
        .returning();

      const variantId = newVariant[0].id;

      await db
        .insert(variantTags)
        .values(tags.map((tag) => ({ tag, variantID: variantId })));
      await db.insert(variantImages).values(
        newImages.map((img, idx) => ({
          name: img.name ?? "",
          size: img.size,
          url: img.url,
          variantID: variantId,
          order: idx,
        }))
      );

      // Algolia kaydı
      const productArray = await db
        .select()
        .from(products)
        .where(eq(products.id, productID));
      const product = productArray[0];

      if (product) {
        await client.saveObject({
          indexName: "products",
          body: {
            objectID: variantId.toString(),
            id: productID,
            name: product.title,
            price: product.price,
            productType,
            color,
            tags,
            images: newImages.map((img) => img.url),
          },
        });
      }

      revalidatePath("/dashboard/products");
      return { success: `Added ${productType}` };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create variant");
    }
  });
