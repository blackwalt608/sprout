"use server";
import { NewPasswordSchema } from "@/types/new-password-schema";
import { createSafeActionClient } from "next-safe-action";
import { getPasswordResetTokenByToken } from "./tokens";
import { db } from ".."; // Artık Pool + WebSocket tabanlı
import { eq } from "drizzle-orm";
import { passwordResetTokens, users } from "../schema"; // Schema import et
import bcrypt from "bcrypt";

const actionClient = createSafeActionClient();

export const newPassword = actionClient
  .inputSchema(NewPasswordSchema)
  .action(async ({ parsedInput: { password, token } }) => {
    try {
      if (!token) {
        return { error: "Missing token" };
      }

      const tokens = await getPasswordResetTokenByToken(token);
      if (!tokens || tokens.length === 0) {
        return { error: "Token not found" }; // Buraya girse UI'da görürsün
      }

      const existingToken = tokens[0];
      const hasExpired = new Date(existingToken.expires) < new Date();
      if (hasExpired) {
        return { error: "Token has expired" };
      }

      const findedUser = await db
        .select()
        .from(users)
        .where(eq(users.email, existingToken.email));

      if (findedUser.length === 0) {
        // length check ekle
        return { error: "User not found" };
      }

      const existingUser = findedUser[0];
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tx direkt db ile, Pool sayesinde çalışır
      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, existingUser.id));

        await tx
          .delete(passwordResetTokens)
          .where(eq(passwordResetTokens.id, existingToken.id));
      });

      return { success: "Password updated" };
    } catch (error) {
      console.error("newPassword full error:", error); // Detay log: message + stack
      return { error: "Something went wrong" };
    }
  });
