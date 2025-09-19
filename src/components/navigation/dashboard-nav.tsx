"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav({
  allLinks,
}: {
  allLinks: { label: string; path: string; icon: React.ReactNode }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="py-2 overflow-auto mb-4">
      <ul className="flex gap-6 text-xs font-semibold ">
        <AnimatePresence>
          {allLinks.map((link, i) => (
            <motion.li whileTap={{ scale: 0.95 }} key={i}>
              <Link
                className={cn(
                  "flex gap-1  flex-col items-center relative",
                  pathname === link.path && "text-primary"
                )}
                href={link.path}
              >
                {link.icon}
                {link.label}
                {pathname === link.path ? (
                  <motion.div
                    className="h-[3px] w-full rounded-full absolute bg-primary z-0 left-0 -bottom-1"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    layoutId="underline"
                    transition={{ type: "spring", stiffness: 35 }}
                  />
                ) : null}
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </nav>
  );
}
