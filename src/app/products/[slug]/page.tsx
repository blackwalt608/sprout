import ProductType from "@/components/products/product-type";
import { db } from "@/server";
import {
  products,
  productVariants,
  variantImages as variantImagesTable,
  variantTags as variantTagsTable,
} from "@/server/schema";
import { eq } from "drizzle-orm";
import { Separator } from "@/components/ui/separator";
import formatPrice from "@/lib/format-price";
import ProductPick from "@/components/products/product-pick";
import ProductShowcase from "@/components/products/product-showcase";
import Reviews from "@/components/reviews/reviews";
import { getReviewAverage } from "@/lib/review-average";
import Stars from "@/components/reviews/stars";
import AddCart from "@/components/cart/add-cart";

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const variantId = Number(params.slug);

  const selectedVariant = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);

  if (!selectedVariant[0]) return <div>Variant bulunamadı</div>;

  const productId = selectedVariant[0].productID;

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)
    .then((res) => res[0]);

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productID, productId));

  const variantsWithRelations = await Promise.all(
    variants.map(async (variant) => {
      const variantImages = await db
        .select()
        .from(variantImagesTable)
        .where(eq(variantImagesTable.variantID, variant.id));

      const variantTags = await db
        .select()
        .from(variantTagsTable)
        .where(eq(variantTagsTable.variantID, variant.id));

      return { ...variant, variantImages, variantTags };
    })
  );

  const result = { product, variants: variantsWithRelations };
  const reviewStats = await getReviewAverage(product.id);
  if (result.variants) {
    return (
      <main>
        <section className="flex flex-col gap-4 lg:gap-12">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-12">
            <div className="flex-1">
              <ProductShowcase variants={result.variants} />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-2xl font-bold">{result.product.title}</h2>
              <div>
                <ProductType variants={result.variants} />
                <Stars
                  rating={reviewStats?.average ?? 0}
                  totalReviews={reviewStats?.total ?? 0}
                />
              </div>
              <Separator className="my-2" />
              <p className="text-2xl font-medium py-2">
                {formatPrice(result.product.price)}
              </p>
              <div
                dangerouslySetInnerHTML={{ __html: result.product.description }}
              ></div>
              <p className="text-secondary-foreground font-medium my-2">
                Available Colors
              </p>
              <div className="flex gap-4">
                {result.variants.map((prodVariant) => (
                  <ProductPick
                    key={prodVariant.id}
                    id={prodVariant.id}
                    color={prodVariant.color}
                    productType={prodVariant.productType}
                    title={result.product.title}
                    price={result.product.price}
                    productID={prodVariant.productID}
                    image={prodVariant.variantImages[0].url}
                  />
                ))}
              </div>
              <AddCart />
            </div>
          </div>

          {/* Reviews alt satırda */}
          <Reviews productID={product.id} />
        </section>
      </main>
    );
  }
}
