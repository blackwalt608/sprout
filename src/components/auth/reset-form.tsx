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
import { ResetSchema } from "@/types/reset-schema";
import { reset } from "@/server/actions/password-reset";

export const ResetForm = () => {
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { execute, status } = useAction(reset, {
    onSuccess(result) {
      const data = result?.data as { success?: string; error?: string };

      if (data?.error) setError(data.error);
      if (data?.success) setSuccess(data.success);
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    execute(values);
  };

  return (
    <AuthCard
      cardTitle="Forgot your password?"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      showSocials
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    disabled={status === "executing"}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSuccess message={success} />
          <FormError message={error} />

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
