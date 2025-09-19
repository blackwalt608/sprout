import * as z from "zod";

export const VariantSchema = z.object({
  productID: z.number(),
  id: z.number().optional(),
  editMode: z.boolean(),
  productType: z
    .string()
    .min(3, { message: "Product type must be 3 characters long at least" }),
  color: z
    .string()
    .min(3, { message: "Color must be 3 characters long at least" }),
  tags: z.array(z.string()).min(1, {
    message: "You must provide 1 tag at least",
  }),
  variantImages: z
    .array(
      z.object({
        url: z.string().refine((url) => url.search("blob:") !== 0, {
          message: "Please wait for the image to upload",
        }),
        size: z.number(),
        key: z.string().optional(),
        id: z.number().optional(),
        name: z.string().optional(),
      })
    )
    .min(1, { message: "You must provide at least one image" }),
});
