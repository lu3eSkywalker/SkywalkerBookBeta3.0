/*
  Warnings:

  - Added the required column `userId` to the `Friends` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friends" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
