import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from ".";
import Credentials from "next-auth/providers/credentials";
//providers
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { LoginSchema } from "@/types/login-schema";
import { accounts, users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import Stripe from "stripe";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  events: {
    createUser: async ({ user }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET!, {
        apiVersion: "2025-08-27.basil",
      });
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name!,
      });
      await db
        .update(users)
        .set({ customerID: customer.id })
        .where(eq(users.id, user.id!));
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session && token.sub) session.user.id = token.sub;
      if (session && token.role) session.user.role = token.role as string;
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.image = token.image as string;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const usersFound = await db
        .select()
        .from(users)
        .where(eq(users.id, token.sub));

      if (!usersFound.length) return token;

      const user = usersFound[0];

      const existingAccount = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id));

      token.isOAuth = existingAccount.length > 0;
      token.name = user.name;
      token.email = user.email;
      token.role = user.role;
      token.isTwoFactorEnabled = user.isTwoFactorEnabled;
      token.image = user.image;

      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      authorize: async (credentials) => {
        const validated = LoginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;

        // Kllanıcıyı bul
        const usersFound = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()));

        const user = usersFound[0];
        if (!user || !user.password) return null;

        // Email doğrulama kontrolü
        if (!user.emailVerified) return null;

        // Şifre kontrolü
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        // Başarılı kullanıcıyı minimal objeyle döndür
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});
