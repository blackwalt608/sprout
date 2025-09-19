"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { products } from "../schema";

export async function getProduct(id: number) {
  try {
    const product = await db.select().from(products).where(eq(products.id, id));
    if (!product || product.length === 0) {
      return { error: "Product not found" };
    }

    return {
      success: product[0],
    };
  } catch (error) {
    return { error: "Failed to get product" };
  }
}
