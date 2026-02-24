/*
  Warnings:

  - A unique constraint covering the columns `[address,chain_id]` on the table `walletAddress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "walletAddress_address_chain_id_key" ON "public"."walletAddress"("address", "chain_id");
