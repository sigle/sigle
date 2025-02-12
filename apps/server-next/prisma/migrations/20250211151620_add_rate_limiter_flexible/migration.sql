-- CreateTable
CREATE TABLE "RateLimiterFlexible" (
    "key" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "expire" TIMESTAMP(3),

    CONSTRAINT "RateLimiterFlexible_pkey" PRIMARY KEY ("key")
);
