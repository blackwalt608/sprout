"use server";

import { createSafeActionClient } from "next-safe-action";
import * as z from "zod";
import { products } from "../schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
const actionClient = createSafeActionClient();

export const deleteProduct = actionClient
  .inputSchema(
    z.object({
      id: z.number(),
    })
  )
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;
    try {
      const data = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      revalidatePath("/dashboard/products");
      return {
        success: `Product ${data[0].title} has been deleted succesfuly`,
      };
    } catch (error) {
      return { error: "Failed to delete product" };
    }
  });
