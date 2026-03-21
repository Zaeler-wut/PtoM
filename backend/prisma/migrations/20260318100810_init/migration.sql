/*
  Warnings:

  - The values [SENT] on the enum `BillStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deposit` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `deposit` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `roleAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `roleUser` on the `User` table. All the data in the column will be lost.
  - Made the column `slipUrl` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `securityDeposit` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `securityDeposit` to the `RoomType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "BillStatus_new" AS ENUM ('DRAFT', 'READY', 'PENDING', 'VERIFYING', 'PAID');
ALTER TABLE "Bill" ALTER COLUMN "status" TYPE "BillStatus_new" USING ("status"::text::"BillStatus_new");
ALTER TYPE "BillStatus" RENAME TO "BillStatus_old";
ALTER TYPE "BillStatus_new" RENAME TO "BillStatus";
DROP TYPE "public"."BillStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "slipUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "deposit",
ADD COLUMN     "securityDeposit" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "contractTerm" TEXT;

-- AlterTable
ALTER TABLE "RoomType" DROP COLUMN "deposit",
ADD COLUMN     "securityDeposit" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "roleAdmin",
DROP COLUMN "roleUser",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "citizenId" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "RoomTypeFee" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "RoomTypeFee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomTypeFee" ADD CONSTRAINT "RoomTypeFee_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
