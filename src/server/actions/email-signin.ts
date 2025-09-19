"use server";

import { LoginSchema } from "@/types/login-schema";
import { createSafeActionClient } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { twoFactorTokens, users } from "../schema";
import {
  generateEmailVerificationToken,
  generateTwoFactorToken,
  getTwoFactorTokenByEmail,
} from "./tokens";
import { sendTwoFactorTokenByEmail, sendVerificationEmail } from "./email";
import { signIn } from "../auth";
import { AuthError } from "next-auth";

const actionClient = createSafeActionClient();

// ✅ Server action return tipleri
export type EmailSignInResponse =
  | { success: string }
  | { error: string }
  | { twoFactor: string };

export const emailSignIn = actionClient
  .inputSchema(LoginSchema)
  .action<EmailSignInResponse>(
    async ({ parsedInput: { email, password, code } }) => {
      try {
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        const user = existingUsers[0];

        if (!user) return { error: "Email not found" };

        // Eğer email doğrulanmamışsa
        if (!user.emailVerified) {
          const verificationToken = await generateEmailVerificationToken(
            user.email!
          );
          await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token
          );
          return { success: "Confirmation email sent" };
        }

        // Two-factor aktifse
        if (user.isTwoFactorEnabled && user.email) {
          if (code) {
            // Kod varsa doğrula
            const twoFactorToken = await getTwoFactorTokenByEmail(user.email);
            if (!twoFactorToken) return { error: "Invalid Token" };
            if (twoFactorToken.token !== code)
              return { error: "Invalid Token" };
            if (new Date(twoFactorToken.expires) < new Date())
              return { error: "Token has expired" };

            // Token başarılı, sil
            await db
              .delete(twoFactorTokens)
              .where(eq(twoFactorTokens.id, twoFactorToken.id));

            // ✅ Kod doğru, login yap
            await signIn("credentials", { email, password, redirectTo: "/" });
            return { success: "Logged in" };
          } else {
            // Kod yoksa token gönder, login yapma
            const token = await generateTwoFactorToken(user.email);
            if (!token) return { error: "Token not generated!" };

            await sendTwoFactorTokenByEmail(token[0].email, token[0].token);
            return { twoFactor: "Two Factor Token Sent" };
          }
        }

        // Two-factor devre dışıysa direkt login
        await signIn("credentials", { email, password, redirectTo: "/" });
        return { success: "Logged in" };
      } catch (error) {
        console.error(error);
        if (error instanceof AuthError) {
          switch (error.type) {
            case "CredentialsSignin":
              return { error: "Email or Password Incorrect" };
            case "AccessDenied":
            case "OAuthSignInError":
              return { error: error.message };
            default:
              return { error: "Something went wrong" };
          }
        }
        throw error;
      }
    }
  );
