-- CreateTable
CREATE TABLE "DismissableFlags" (
    "id" TEXT NOT NULL,
    "onboarding" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DismissableFlags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DismissableFlags_userId_key" ON "DismissableFlags"("userId");

-- AddForeignKey
ALTER TABLE "DismissableFlags" ADD CONSTRAINT "DismissableFlags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
