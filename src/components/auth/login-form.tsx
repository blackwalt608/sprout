"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { AuthCard } from "./auth-card";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/types/login-schema";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { emailSignIn } from "@/server/actions/email-signin";
import { useAction } from "next-safe-action/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const LoginForm = () => {
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "", // ✅ OTP için eklendi
    },
  });

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const { execute, status } = useAction(emailSignIn, {
    onSuccess: (result: any) => {
      if (result?.success) {
        setSuccess(result.success);
        setError("");
      }
      if (result?.data?.twoFactor || result?.twoFactor) {
        setShowTwoFactor(true);
        setError("");
        setSuccess("");
      }
      if (result?.error) {
        setError(result.error);
        setSuccess("");
      }
    },
    onError: () => {
      setError("Something went wrong");
      setSuccess("");
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    execute(values);
  };

  return (
    <AuthCard
      cardTitle="Welcome back!"
      backButtonHref="/auth/register"
      backButtonLabel="Create a new account"
      showSocials
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {showTwoFactor ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    We've sent you a two factor code to your email.
                  </FormLabel>
                  <FormControl>
                    <InputOTP
                      disabled={status === "executing"}
                      {...field}
                      maxLength={6}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormSuccess message={success} />
          <FormError message={error} />

          <Button size={"sm"} variant={"link"} asChild className="px-0 mb-2">
            <Link href="/auth/reset">Forgot your password?</Link>
          </Button>

          <Button
            type="submit"
            className={cn(
              "w-full",
              status === "executing" ? "animate-pulse" : ""
            )}
          >
            {showTwoFactor ? "Verify" : "Sign In"} {/* ✅ Buton text’i */}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};
