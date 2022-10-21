-- CreateTable
CREATE TABLE "GaiaUserSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT,
    "siteDescription" TEXT,
    "siteColor" TEXT,
    "siteLogo" TEXT,
    "siteUrl" TEXT,
    "siteTwitterHandle" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GaiaUserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GaiaUserSettings_userId_key" ON "GaiaUserSettings"("userId");

-- AddForeignKey
ALTER TABLE "GaiaUserSettings" ADD CONSTRAINT "GaiaUserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
