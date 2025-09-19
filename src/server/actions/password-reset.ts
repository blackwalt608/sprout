"use server";
import { ResetSchema } from "@/types/reset-schema";
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { generatePasswordResetToken } from "./tokens";
import { sendPasswordResetEmail } from "./email";
const actionClient = createSafeActionClient();
export const reset = actionClient
  .inputSchema(ResetSchema)
  .action(async ({ parsedInput: { email } }) => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length === 0) {
      return { error: "User not found" };
    }
    const passwordResetToken = await generatePasswordResetToken(email);
    if (!passwordResetToken) {
      return { error: "Token not generated" };
    }
    await sendPasswordResetEmail(
      passwordResetToken[0].email,
      passwordResetToken[0].token
    );
    return { success: "Reset email sent" };
  });
