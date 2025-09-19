"use server";

import { createOrderSchema } from "@/types/order-schema";
import { createSafeActionClient } from "next-safe-action";
import { auth } from "../auth";
import { db } from "..";
import { orderProduct, orders } from "../schema";
const actionClient = createSafeActionClient();

export const createOrder = actionClient
  .inputSchema(createOrderSchema)
  .action(
    async ({ parsedInput: { products, status, total, paymentIntentID } }) => {
      const user = await auth();
      if (!user) return { error: "User not found" };
      const order = await db
        .insert(orders)
        .values({
          status,
          total,
          paymentIntentID,
          userID: user.user.id,
        })
        .returning();
      const orderProducts = products.map(
        async ({ productID, quantity, variantID }) => {
          const newOrderProduct = await db.insert(orderProduct).values({
            quantity,
            orderID: order[0].id,
            productID: productID,
            productVariantID: variantID,
          });
        }
      );
      return { success: "Order has been added" };
    }
  );
