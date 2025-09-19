"use client";

import { InstantSearch, SearchBox, Hits } from "react-instantsearch";
import { SearchClient } from "algoliasearch";
import { searchClient } from "@/lib/algolia-client";
import Link from "next/link";
import Image from "next/image";
import { Card } from "../ui/card";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HitType = {
  objectID: string;
  id: number;
  price: number;
  title: string;
  productType: string;
  images: string[]; // dizi
  _highlightResult?: {
    title?: {
      value: string;
      matchLevel: string;
      fullyHighlighted: boolean;
      matchedWords: string[];
    };
    productType?: {
      value: string;
      matchLevel: string;
      fullyHighlighted: boolean;
      matchedWords: string[];
    };
  };
};

function Hit({ hit }: { hit: HitType }) {
  return (
    <div className="p-4 mb-2 hover:bg-secondary">
      <Link
        href={`/products/${hit.objectID}?id=${hit.objectID}&productID=${hit.id}&price=${hit.price}&title=${hit.title}&type=${hit.productType}&image=${hit.images[0]}&variantID=${hit.objectID}`}
      >
        <div className="flex w-full gap-12 items-center justify-between">
          <Image
            src={hit.images[0]}
            alt={hit.title || "title"}
            width={60}
            height={60}
          />
          <p
            dangerouslySetInnerHTML={{
              __html: hit._highlightResult?.title?.value ?? hit.title,
            }}
          ></p>
          <p
            dangerouslySetInnerHTML={{
              __html:
                hit._highlightResult?.productType?.value ?? hit.productType,
            }}
          ></p>
          <p className="font-medium">${hit.price}</p>
        </div>
      </Link>
    </div>
  );
}

export default function Algolia() {
  const [active, setActive] = useState(false);
  const MCard = useMemo(() => motion(Card), []);
  const [query, setQuery] = useState("");

  return (
    <InstantSearch
      searchClient={searchClient as SearchClient}
      indexName="products"
    >
      <div className="relative">
        <SearchBox
          onFocus={() => setActive(true)}
          onBlur={() => setTimeout(() => setActive(false), 100)}
          classNames={{
            input:
              "h-full w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            submitIcon: "hidden",
            form: "relative mb-4",
            resetIcon: "hidden",
          }}
        />
        <AnimatePresence>
          {active && (
            <MCard
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute w-full z-50 overflow-y-scroll h-96"
            >
              <Hits hitComponent={Hit} classNames={{ root: "rounded-md" }} />
            </MCard>
          )}
        </AnimatePresence>
      </div>
    </InstantSearch>
  );
}
