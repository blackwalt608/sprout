"use server";
import { settingsSchema } from "@/types/settings-schema";
import { createSafeActionClient } from "next-safe-action";
import { auth } from "../auth";
import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

const action = createSafeActionClient();
export const settings = action
  .inputSchema(settingsSchema)
  .action(async ({ parsedInput: values }) => {
    const user = await auth();
    if (!user) {
      return { error: "User not found" };
    }
    const foundedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.user.id));
    const dbUser = foundedUser[0];
    if (!dbUser) {
      return { error: "User not found" };
    }
    if (user.user.isOAuth) {
      values.email = undefined;
      values.password = undefined;
      values.newPassword = undefined;
      values.isTwoFactorEnable = undefined;
    }
    if (values.password && values.newPassword && dbUser.password) {
      const passwordMatch = await bcrypt.compare(
        values.password,
        dbUser.password
      );
      if (!passwordMatch) {
        return { error: "Password does not match" };
      }
      const samePassword = await bcrypt.compare(
        values.newPassword,
        dbUser.password
      );
      const hashedPassword = await bcrypt.hash(values.newPassword, 10);
      values.password = hashedPassword;
      values.newPassword = undefined;
    }
    const updatedUser = await db
      .update(users)
      .set({
        name: values.name,
        email: values.email,
        image: values.image,
        password: values.password,
        isTwoFactorEnabled: values.isTwoFactorEnable,
      })
      .where(eq(users.id, dbUser.id));
    revalidatePath("/dashboard/settings");
    return { success: "Values updated" };
  });
