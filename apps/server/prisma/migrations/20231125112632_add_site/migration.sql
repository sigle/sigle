-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_domain_key" ON "Site"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Site_userId_key" ON "Site"("userId");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
