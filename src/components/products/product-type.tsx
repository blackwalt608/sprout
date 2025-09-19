"use client";

import { VariantsWithImagesTags } from "@/lib/infer-type";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
export default function ProductType({
  variants,
}: {
  variants: VariantsWithImagesTags[];
}) {
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type") || variants[0];
  return variants.map((variants) => {
    if (variants.productType === selectedType) {
      return (
        <motion.div
          key={variants.id}
          animate={{ y: 0, opacity: 1 }}
          initial={{ opacity: 0, y: 6 }}
          className="text-secondary-foreground font-medium"
        >
          {variants.productType}
        </motion.div>
      );
    }
  });
}
