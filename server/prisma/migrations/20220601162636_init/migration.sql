-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "stacksAddress" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stacksAddress_key" ON "User"("stacksAddress");
