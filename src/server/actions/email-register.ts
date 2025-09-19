"use server";

import { createSafeActionClient } from "next-safe-action";
import bcrypt from "bcrypt";
import { users } from "../schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import { RegisterSchema } from "@/types/register-schema";
import { generateEmailVerificationToken } from "./tokens";
import { sendVerificationEmail } from "./email";

const action = createSafeActionClient();

export const emailRegister = action
  .schema(RegisterSchema)
  .action(async ({ parsedInput }) => {
    const { email, name, password } = parsedInput;

    // Şifre hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      const user = existingUser[0];
      if (!user.emailVerified) {
        const verificationToken = await generateEmailVerificationToken(email);
        await sendVerificationEmail(
          verificationToken.email,
          verificationToken.token
        );
        return { success: "Email confirmation resent" };
      }
      return { error: "Email is already in use" };
    }

    await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
    });

    const verificationToken = await generateEmailVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: "Confirmation email sent!" };
  });
