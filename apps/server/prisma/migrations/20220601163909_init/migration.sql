-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "stacksAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stacksAddress_key" ON "User"("stacksAddress");
