"use server";
import { ProductSchema } from "@/types/product-schema";
import { createSafeActionClient, SafeActionClient } from "next-safe-action";
import { products } from "../schema";
import { eq } from "drizzle-orm";
import { db } from "..";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();
export const createProduct = actionClient
  .inputSchema(ProductSchema)
  .action(async ({ parsedInput: { description, price, title, id } }) => {
    try {
      if (id) {
        const currentProduct = (
          await db.select().from(products).where(eq(products.id, id))
        )[0];
        if (!currentProduct) return { error: "Product not found" };
        const editedProduct = await db
          .update(products)
          .set({ description, price, title, id })
          .where(eq(products.id, id))
          .returning();
        revalidatePath("/dashboard/products");
        return { success: `Product ${editedProduct[0].title} has been edited` };
      }
      if (!id) {
        const newProduct = await db
          .insert(products)
          .values({ description, price, title })
          .returning();
        return { success: `Product ${newProduct[0].title} has been created` };
      }
    } catch (error) {
      return { error: JSON.stringify(error) };
    }
  });
