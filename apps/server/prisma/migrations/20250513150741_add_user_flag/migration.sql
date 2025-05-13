-- CreateEnum
CREATE TYPE "UserFlag" AS ENUM ('NONE', 'VERIFIED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "flag" "UserFlag" NOT NULL DEFAULT 'NONE';
