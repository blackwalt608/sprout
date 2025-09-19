CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"descipriton" text NOT NULL,
	"title" text NOT NULL,
	"created" timestamp DEFAULT now(),
	"price" real NOT NULL
);
