/*
  Warnings:

  - Added the required column `cloudinaryUrl` to the `Posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "cloudinaryUrl" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL;
