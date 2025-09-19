"use server";

import { db } from "..";
import {
  emailTokens,
  passwordResetTokens,
  twoFactorTokens,
  users,
} from "../schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { DevBundlerService } from "next/dist/server/lib/dev-bundler-service";

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db
      .select()
      .from(emailTokens)
      .where(eq(emailTokens.email, email));

    return verificationToken[0] || null;
  } catch (error) {
    console.error("Error fetching verification token:", error);
    return null;
  }
};

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db
      .select()
      .from(emailTokens)
      .where(eq(emailTokens.token, token));

    return verificationToken[0] || null;
  } catch (error) {
    console.error("Error fetching verification token:", error);
    return null;
  }
};

export const generateEmailVerificationToken = async (email: string) => {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 saat geçerli

  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db.delete(emailTokens).where(eq(emailTokens.email, email));
  }

  const [verificationToken] = await db
    .insert(emailTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return verificationToken;
};

export const newVerification = async (token: string) => {
  // DB'den token bul
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token not found" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, existingToken.email));

  if (!existingUser || existingUser.length === 0) {
    return { error: "Email does not exist" };
  }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, existingToken.email));

  await db.delete(emailTokens).where(eq(emailTokens.id, existingToken.id));

  return { success: "Email verified successfully" };
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return passwordResetToken[0];
  } catch (error) {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await db
      .select()
      .from(users)
      .where(eq(passwordResetTokens.email, email));
    return passwordResetToken[0];
  } catch (error) {
    return null;
  }
};

export const generatePasswordResetToken = async (email: string) => {
  try {
    const token = crypto.randomUUID();
    //Hour Expiry
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    const existingToken = await getPasswordResetTokenByEmail(email);
    if (existingToken) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, existingToken.id));
    }
    const passwordResetToken = await db
      .insert(passwordResetTokens)
      .values({
        email,
        token,
        expires,
      })
      .returning();
    return passwordResetToken;
  } catch (error) {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await db
      .select()
      .from(twoFactorTokens)
      .where(eq(twoFactorTokens.email, email));
    return twoFactorToken[0];
  } catch (error) {
    return null;
  }
};

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await db
      .select()
      .from(twoFactorTokens)
      .where(eq(passwordResetTokens.token, token));
    return twoFactorToken[0];
  } catch (error) {
    return null;
  }
};

export const generateTwoFactorToken = async (email: string) => {
  try {
    const token = crypto.randomInt(100_000, 1_000_000).toString();
    //Hour Expiry
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    const existingToken = await getTwoFactorTokenByEmail(email);
    if (existingToken) {
      await db
        .delete(twoFactorTokens)
        .where(eq(twoFactorTokens.id, existingToken.id));
    }
    const twoFactorToken = await db
      .insert(twoFactorTokens)
      .values({
        email,
        token,
        expires,
      })
      .returning();
    return twoFactorToken;
  } catch (error) {
    return null;
  }
};
