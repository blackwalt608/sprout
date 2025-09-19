CREATE TABLE "variantImages" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"size" real NOT NULL,
	"name" text NOT NULL,
	"order" real NOT NULL,
	"variantID" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variantTags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" text NOT NULL,
	"variantID" serial NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "productVariants" DROP CONSTRAINT "productVariants_variantID_productVariants_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "email_tokens" ADD CONSTRAINT "email_tokens_id_token_pk" PRIMARY KEY("id","token");--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_id_token_pk" PRIMARY KEY("id","token");--> statement-breakpoint
ALTER TABLE "two_factor_tokens" ADD CONSTRAINT "two_factor_tokens_id_token_pk" PRIMARY KEY("id","token");--> statement-breakpoint
ALTER TABLE "productVariants" ADD COLUMN "color" text NOT NULL;--> statement-breakpoint
ALTER TABLE "productVariants" ADD COLUMN "productType" text NOT NULL;--> statement-breakpoint
ALTER TABLE "productVariants" ADD COLUMN "updated" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "productVariants" ADD COLUMN "productID" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "customerID" text;--> statement-breakpoint
ALTER TABLE "variantImages" ADD CONSTRAINT "variantImages_variantID_productVariants_id_fk" FOREIGN KEY ("variantID") REFERENCES "public"."productVariants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variantTags" ADD CONSTRAINT "variantTags_variantID_productVariants_id_fk" FOREIGN KEY ("variantID") REFERENCES "public"."productVariants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productVariants" ADD CONSTRAINT "productVariants_productID_products_id_fk" FOREIGN KEY ("productID") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productVariants" DROP COLUMN "tag";--> statement-breakpoint
ALTER TABLE "productVariants" DROP COLUMN "variantID";