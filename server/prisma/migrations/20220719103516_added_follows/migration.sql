-- CreateTable
CREATE TABLE "Follows" (
    "followerAddress" TEXT NOT NULL,
    "followingAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("followerAddress","followingAddress")
);

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerAddress_fkey" FOREIGN KEY ("followerAddress") REFERENCES "User"("stacksAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingAddress_fkey" FOREIGN KEY ("followingAddress") REFERENCES "User"("stacksAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
