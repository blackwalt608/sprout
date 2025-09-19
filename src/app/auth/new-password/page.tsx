"use client";

import { NewPasswordForm } from "@/components/auth/new-password-form";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function NewPass() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordForm />
    </Suspense>
  );
}
