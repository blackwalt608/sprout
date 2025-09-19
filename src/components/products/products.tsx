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
  //Filtered version of variants
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
      {filtered.map((variant) => (
        <Link
          className="py-4"
          key={variant.id}
          href={`/products/${variant.id}?id=${variant.id}&productID=${
            variant.product!.id
          }&price=${variant.product?.price}&title=${
            variant.product?.title
          }&type=${variant.productType}&image=${variant.variantImages[0].url}`}
        >
          <Image
            className="rounded-md pb-2"
            src={variant.variantImages[0].url}
            width={720}
            height={480}
            alt={variant.product?.title ?? "Product image"}
          />
          <div className="flex justify-between">
            <div>
              <h2>{variant.product!.title}</h2>
              <p className="text-sm text-muted-foreground">
                {variant.productType}
              </p>
            </div>
            <div>{formatPrice(variant.product?.price!)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
