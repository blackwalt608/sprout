"use server";

import { reviewSchema } from "@/types/reviews-schema";
import { createSafeActionClient } from "next-safe-action";
import { auth } from "../auth";
import { db } from "..";
import { reviews } from "../schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();
export const addReview = actionClient
  .inputSchema(reviewSchema)
  .action(async ({ parsedInput: { productID, rating, comment } }) => {
    try {
      const session = await auth();
      if (!session) return { error: "Please sign in" };

      // review kontrolü
      const reviewExists = await db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.productID, productID),
            eq(reviews.userID, session.user.id)
          )
        );

      if (reviewExists.length > 0)
        return { error: "You have already reviewed this product" };

      // insert
      const newReview = await db
        .insert(reviews)
        .values({
          productID,
          rating,
          comment,
          userID: session.user.id,
        })
        .returning();

      revalidatePath(`/products/${productID}`);

      return { success: "Your review has been submitted" };
    } catch (error) {
      return { error: "Something went wrong" };
      console.error(error);
    }
  });
