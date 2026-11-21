CREATE TABLE "rate_limiter_flexible" (
	"key" text PRIMARY KEY,
	"points" double precision NOT NULL,
	"expire" timestamp(3)
);
