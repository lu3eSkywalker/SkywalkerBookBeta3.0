-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profilePicture" DROP NOT NULL,
ALTER COLUMN "profilePicture" SET DATA TYPE TEXT;
