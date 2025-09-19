"use client";

import { Toaster as Toasty } from "sonner";
import { useTheme } from "next-themes";

export default function Toaster() {
  const { theme, resolvedTheme } = useTheme();

  const currentTheme = theme || resolvedTheme || "light";

  return <Toasty richColors theme={currentTheme as "light" | "dark"} />;
}
