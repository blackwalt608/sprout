"use client";

import { useForm } from "react-hook-form";
import { ProductSchema, zProductSchema } from "@/types/product-schema";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { DollarSign } from "lucide-react";
import Tiptap from "./tiptap";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProduct } from "@/server/actions/create-product";
import { FormSuccess } from "@/components/auth/form-success";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getProduct } from "@/server/actions/get-product";

export default function ProductForm() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");
  const checkProduct = async (id: number) => {
    if (editMode) {
      const result = await getProduct(id);
      if (result.error) {
        toast.error(result.error);
        router.push("/dashboard/products");
        return;
      }
      if (result.success) {
        const id = parseInt(editMode);
        form.setValue("title", result.success.title);
        form.setValue("description", result.success.description);
        form.setValue("price", result.success.price);
        form.setValue("id", result.success.id);
      }
    }
  };
  useEffect(() => {
    if (editMode) {
      checkProduct(parseInt(editMode));
    }
  }, []);

  // AFTER HERE FORM SETTINGS THAT YOU CAN COPY SOMETHING LOLOL
  const form = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
    mode: "onChange",
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  const { execute, status } = useAction(createProduct, {
    onSuccess: (res) => {
      if (res.data?.success) {
        setSuccess(res.data.success);
        setError(undefined);
        router.push("/dashboard/products");
        toast.success(res.data.success);
      }
    },
    onError: (err) => {
      if (typeof err === "string") {
        setError(err);
      } else if (err.error.serverError) {
        setError(err.error.serverError);
      } else {
        setError("An unexpected error occurred");
      }
      toast.error(error);
      setSuccess(undefined);
    },
  });

  async function onSubmit(values: zProductSchema) {
    execute(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? "Edit Product" : "Create Product"}</CardTitle>
        <CardDescription>
          {editMode
            ? "Make Changes to existing product"
            : "Add a brand new product"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Saekdong Stripe" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Tiptap value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün Fiyatı</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <DollarSign
                        size={34}
                        className="p-2 bg-muted rounded-md"
                      />
                      <Input
                        placeholder="Fiyatınızı USD cinsinden girin"
                        type="number"
                        step="0.1"
                        min={0}
                        value={
                          typeof field.value === "number" ? field.value : ""
                        }
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSuccess message={success} />
            <FormSuccess message={error} />
            <Button
              type="submit"
              className="w-full"
              disabled={
                status === "executing" ||
                !form.formState.isValid ||
                !form.formState.isDirty
              }
            >
              {editMode ? "Save Changes" : "Create Product"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
