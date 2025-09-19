"use server";
import { z } from "zod";
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { productVariants } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { algoliasearch } from "algoliasearch";

const actionClient = createSafeActionClient();

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_ID!,
  process.env.ALGOLIA_ADMIN!
);

export const deleteVariant = actionClient
  .inputSchema(z.object({ id: z.number() }))
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;
    try {
      const deletedVariant = await db
        .delete(productVariants)
        .where(eq(productVariants.id, id))
        .returning();

      revalidatePath("/dashboard/products");
      await client.deleteObject({
        indexName: "products",
        objectID: id.toString(),
      });

      return {
        success: `Deleted ${deletedVariant[0]?.productType ?? "variant"}`,
      };
    } catch (error) {
      return { error: "Failed to delete variant" };
    }
  });
