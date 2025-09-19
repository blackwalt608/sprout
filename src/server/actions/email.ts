"use server";

import getBaseURL from "@/utils/base-url";
import { Resend } from "resend";

export const sendVerificationEmail = async (email: string, token: string) => {
  const resend = new Resend(process.env.resend_API_KEY);
  const domain = getBaseURL();
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: email,
    subject: "Confirm your email",
    html: `<p>Click to <a href="${confirmLink}"> confirm your email</a></p>`,
  });
  if (error) {
    return error;
  }

  if (data) return data;
};
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resend = new Resend(process.env.resend_API_KEY);
  const domain = getBaseURL();
  const confirmLink = `${domain}/auth/new-password?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: email,
    subject: "Reset Password Request",
    html: `<p>Click to <a href="${confirmLink}">reset your password</a></p>`,
  });
  if (error) {
    return error;
  }

  if (data) return data;
};

export const sendTwoFactorTokenByEmail = async (
  email: string,
  token: string
) => {
  const resend = new Resend(process.env.resend_API_KEY);
  const domain = getBaseURL();
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: email,
    subject: "Your Two Factor code",
    html: `<p>Your Confirmation Code: ${token}</p>`,
  });
  if (error) {
    return error;
  }

  if (data) return data;
};
