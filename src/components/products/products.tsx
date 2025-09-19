"use client";

import formatPrice from "@/lib/format-price";
import type { GetAllVariantsResult } from "@/utils/get-all-variants";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

type ProductsProps = {
  variants: GetAllVariantsResult;
};

export default function Products({ variants }: ProductsProps) {
  const params = useSearchParams();
  const paramTag = params.get("tag");

  // Filtered version of variants
  const filtered = useMemo(() => {
    if (paramTag && variants) {
      return variants.filter((variant) =>
        variant.variantTags.some((tag) => tag.tag === paramTag)
      );
    }
    return variants;
  }, [paramTag, variants]);

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-12 lg:grid-cols-3">
      {filtered.map((variant) => {
        const product = variant.product;
        const imageUrl = variant.variantImages[0]?.url;

        // Eğer product veya image yoksa ürünü atla
        if (!product || !imageUrl) return null;

        return (
          <Link
            className="py-4"
            key={variant.id}
            href={`/products/${variant.id}?id=${variant.id}&productID=${product.id}&price=${product.price}&title=${product.title}&type=${variant.productType}&image=${imageUrl}`}
          >
            <Image
              className="rounded-md pb-2"
              src={imageUrl}
              width={720}
              height={480}
              alt={product.title}
            />
            <div className="flex justify-between">
              <div>
                <h2>{product.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {variant.productType}
                </p>
              </div>
              <div>{formatPrice(product.price)}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
