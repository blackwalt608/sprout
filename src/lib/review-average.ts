import { db } from "@/server";
import { reviews } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function getReviewAverage(productID: number) {
  const result = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(eq(reviews.productID, productID));

  if (result.length === 0) return null;
  const total = result.length;

  const average =
    result.reduce((acc, cur) => acc + cur.rating, 0) / result.length;

  return { average: Number(average.toFixed(1)), total };
}
