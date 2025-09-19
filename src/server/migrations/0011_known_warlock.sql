CREATE TABLE "productVariants" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" text NOT NULL,
	"variantID" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "productVariants" ADD CONSTRAINT "productVariants_variantID_productVariants_id_fk" FOREIGN KEY ("variantID") REFERENCES "public"."productVariants"("id") ON DELETE cascade ON UPDATE no action;