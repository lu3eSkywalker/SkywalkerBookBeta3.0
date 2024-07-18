/*
  Warnings:

  - You are about to drop the column `friendId` on the `Friends` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_friendId_fkey";

-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "friendId";
