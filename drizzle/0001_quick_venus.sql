CREATE TABLE "analysis_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"result" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "screenshots" (
	"url" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
