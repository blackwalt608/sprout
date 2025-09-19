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
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "./auth-card";
import { NewPasswordSchema } from "@/types/new-password-schema";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";
import { useSearchParams } from "next/navigation";
import { newPassword } from "@/server/actions/new-password";

export const NewPasswordForm = () => {
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { execute, status } = useAction(newPassword, {
    onSuccess(result) {
      if ("error" in result) {
        setError(
          typeof result.error === "string" ? result.error : "Unknown error"
        );
        setSuccess(null);
      } else if ("success" in result) {
        setSuccess(typeof result.success === "string" ? result.success : "");
        setError(null);
      }
    },
    onError(err) {
      setError(typeof err === "string" ? err : "Something went wrong");
      setSuccess(null);
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    if (!token) {
      setError("Missing token in URL");
      setSuccess(null);
      return;
    }

    execute({ password: values.password, token });
  };

  return (
    <AuthCard
      cardTitle="Enter a new password"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      showSocials
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="*********"
                    type="password"
                    autoComplete="current-password"
                    disabled={status === "executing"}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Success / Error mesajları kesin render */}
          {success && <FormSuccess message={success} />}
          {error && <FormError message={error} />}

          <div className="flex justify-between items-center mt-2">
            <Button size="sm" variant="link" asChild>
              <Link href="/auth/reset">Forgot your password</Link>
            </Button>
            <Button
              type="submit"
              className={cn(
                "ml-auto",
                status === "executing" ? "animate-pulse" : ""
              )}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
};
