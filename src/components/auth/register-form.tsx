"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { AuthCard } from "./auth-card";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { emailSignIn } from "@/server/actions/email-signin";
import { useAction } from "next-safe-action/hooks";

import { cn } from "@/lib/utils";
import { use, useState } from "react";
import { RegisterSchema } from "@/types/register-schema";
import { emailRegister } from "@/server/actions/email-register";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";
type RegisterResponse = {
  error?: string;
  success?: string;
};
export const RegisterForm = () => {
  const form = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { execute, status } = useAction(emailRegister, {
    onSuccess(result) {
      if (result.data.error) {
        setFormStatus({ type: "error", message: result.data.error });
      }
      if (result.data.success) {
        setFormStatus({ type: "success", message: result.data.success });
      }
    },
    onError(error) {
      console.error("Server action error:", error);
      setFormStatus({ type: "error", message: "Beklenmeyen bir hata oluştu." });
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    execute(values);
  };
  return (
    <AuthCard
      cardTitle="Create an account"
      backButtonHref="/auth/login"
      backButtonLabel="Already have an account?"
      showSocials
    >
      <div>
        <Form {...form}>
          <form action="" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="blackwalt@gmail.com"
                        type="email"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        type="password"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mert" type="text" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button size={"sm"} variant={"link"} asChild>
                <Link href="/auth/reset">Forgot your password</Link>
              </Button>
            </div>
            {formStatus?.type === "success" && (
              <FormSuccess message={formStatus.message} />
            )}
            {formStatus?.type === "error" && (
              <FormError message={formStatus.message} />
            )}

            <Button
              type="submit"
              className={cn(
                "w-full",
                status === "executing" ? "animate-pulse" : ""
              )}
            >
              {"Register"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  );
};
