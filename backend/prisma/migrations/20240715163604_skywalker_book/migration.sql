-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_friendId_fkey";

-- AlterTable
ALTER TABLE "Friends" ALTER COLUMN "friendId" DROP NOT NULL;
