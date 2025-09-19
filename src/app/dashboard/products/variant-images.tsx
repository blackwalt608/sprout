"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { VariantSchema } from "@/types/variant-schema";
import { useFieldArray, useFormContext } from "react-hook-form";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadDropzone } from "@/app/api/uploadthing/uploadthing";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Reorder } from "framer-motion";
import { useState } from "react";

export default function VariantImages() {
  const { getValues, control, setError } =
    useFormContext<z.infer<typeof VariantSchema>>();
  const { fields, remove, append, update, move } = useFieldArray({
    control,
    name: "variantImages",
  });

  const [active, setActive] = useState(0);

  return (
    <div className="overflow-auto">
      <FormField
        control={control}
        name="variantImages"
        render={() => (
          <FormItem>
            <FormLabel>Variant Images</FormLabel>
            <FormControl>
              <UploadDropzone
                className="h-[15rem] w-full border-secondary hover:bg-primary/10 transition-all"
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                  setError("variantImages", {
                    type: "validate",
                    message: error.message,
                  });
                }}
                onBeforeUploadBegin={(files) => {
                  files.forEach((file) =>
                    append({
                      name: file.name,
                      size: file.size,
                      url: URL.createObjectURL(file), // geçici blob
                    })
                  );
                  return files;
                }}
                onClientUploadComplete={(files) => {
                  const images = getValues("variantImages");

                  images.forEach((image, imgIDX) => {
                    if (image.url.startsWith("blob:")) {
                      const uploadedFile = files.find(
                        (f) => f.name === image.name
                      );

                      if (uploadedFile) {
                        update(imgIDX, {
                          url: uploadedFile.url,
                          name: uploadedFile.name,
                          size: uploadedFile.size,
                          key: uploadedFile.key,
                        });
                      }
                    }
                  });
                }}
                config={{ mode: "auto" }}
                endpoint="variantUploader"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Reorder.Group
            as="tbody"
            values={fields}
            onReorder={(e) => {
              const activeElement = fields[active];
              e.forEach((item, index) => {
                if (item === activeElement) {
                  move(active, index);
                  setActive(index);
                }
              });
            }}
          >
            {fields.map((field, index) => (
              <Reorder.Item
                as="tr"
                key={field.id}
                id={field.id}
                value={field}
                onDragStart={() => setActive(index)}
                className={cn(
                  field.url.startsWith("blob:")
                    ? "animate-pulse transition-all"
                    : "",
                  "text-sm font-bold text-muted-foreground hover:text-primary"
                )}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{field.name}</TableCell>
                <TableCell>
                  {(field.size / (1024 * 1024)).toFixed(2)} MB
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Image
                      src={field.url}
                      alt={field.name ?? "variant image"}
                      className="rounded-md"
                      width={72}
                      height={48}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    className="scale-75"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      remove(index);
                    }}
                  >
                    <Trash className="h-4" />
                  </Button>
                </TableCell>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Table>
      </div>
    </div>
  );
}
