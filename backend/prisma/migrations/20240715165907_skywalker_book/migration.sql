/*
  Warnings:

  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "friends" INTEGER[];

-- DropTable
DROP TABLE "Friends";
