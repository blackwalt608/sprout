"use client";

import { newVerification } from "@/server/actions/tokens";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthCard } from "./auth-card";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";

export const EmailVerificationForm = () => {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    if (!t) {
      router.push("/");
    }
  }, []);

  const handleVerification = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError("Token not found in the URL");
      return;
    }

    newVerification(token).then((data) => {
      if (data.error) {
        setError(data.error);
      }
      if (data.success) {
        setSuccess(data.success);
        router.push("/auth/login");
      }
    });
  }, [token, success, error, router]);

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token, handleVerification]);

  return (
    <AuthCard
      cardTitle="Verify your account"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center flex-col w-full justify-center">
        {!success && !error && <p>Verifying email...</p>}
        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </AuthCard>
  );
};
