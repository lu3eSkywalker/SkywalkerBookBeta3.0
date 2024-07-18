/*
  Warnings:

  - You are about to drop the column `userId` on the `Friends` table. All the data in the column will be lost.
  - Added the required column `friendId` to the `Friends` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_userId_fkey";

-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "userId",
ADD COLUMN     "friendId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
