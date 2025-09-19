"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductTags() {
  const router = useRouter();
  const params = useSearchParams();
  const tag = params.get("tag");
  const setFilter = (tag: string) => {
    if (tag) {
      router.push(`?tag=${tag}`);
    }
    if (!tag) {
      router.push("/");
    }
  };
  return (
    <div className="my-4 flex gap-4 items-center justify-center">
      <Badge
        className={cn(
          "cursor-pointer bg-muted-foreground transition-colors duration-150 hover:bg-black/75 hover:opacity-100",
          !tag ? "opacity-100" : "opacity-50"
        )}
        onClick={() => setFilter("")}
      >
        All
      </Badge>
      <Badge
        className={cn(
          "cursor-pointer bg-blue-500 transition-colors duration-150 hover:bg-blue-600 hover:opacity-100",
          !tag ? "opacity-100" : "opacity-50",
          tag === "blue" && tag ? "opacity-100" : "opacity-50"
        )}
        onClick={() => setFilter("blue")}
      >
        Blue
      </Badge>
      <Badge
        className={cn(
          "cursor-pointer bg-green-500 transition-colors duration-150 hover:bg-green-600 hover:opacity-100",
          !tag ? "opacity-100" : "opacity-50",
          tag === "green" && tag ? "opacity-100" : "opacity-50"
        )}
        onClick={() => setFilter("green")}
      >
        Green
      </Badge>
      <Badge
        className={cn(
          "cursor-pointer bg-purple-500 transition-colors duration-150 hover:bg-purple-600 hover:opacity-100",
          !tag ? "opacity-100" : "opacity-50",
          tag === "purple" && tag ? "opacity-100" : "opacity-50"
        )}
        onClick={() => setFilter("purple")}
      >
        Purple
      </Badge>
    </div>
  );
}
