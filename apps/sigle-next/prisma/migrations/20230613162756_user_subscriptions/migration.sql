-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PUBLISHER', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'BASIC',
    "upgraded_at" TIMESTAMP(3),
    "downgraded_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
