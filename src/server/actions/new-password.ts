"use server";

import { NewPasswordSchema } from "@/types/new-password-schema";
import { createSafeActionClient } from "next-safe-action";
import { getPasswordResetTokenByToken } from "./tokens";
import { db } from "..";
import { eq } from "drizzle-orm";
import { passwordResetTokens, users } from "../schema";
import bcrypt from "bcrypt";

const actionClient = createSafeActionClient();

export const newPassword = actionClient
  .inputSchema(NewPasswordSchema)
  .action(async ({ parsedInput: { password, token } }) => {
    try {
      if (!token) {
        return { error: "Missing token" };
      }

      const tokenObj = await getPasswordResetTokenByToken(token);
      if (!tokenObj) {
        return { error: "Token not found" };
      }

      const hasExpired = new Date(tokenObj.expires) < new Date();
      if (hasExpired) {
        return { error: "Token has expired" };
      }

      const findedUser = await db
        .select()
        .from(users)
        .where(eq(users.email, tokenObj.email));

      if (findedUser.length === 0) {
        return { error: "User not found" };
      }

      const existingUser = findedUser[0];
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, existingUser.id));

        await tx
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.id, tokenObj.id));
      });

      return { success: "Password updated" };
    } catch (error) {
      console.error("newPassword full error:", error);
      return { error: "Something went wrong" };
    }
  });
