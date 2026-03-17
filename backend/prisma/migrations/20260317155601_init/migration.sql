/*
  Warnings:

  - You are about to drop the column `electricCost` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `otherCost` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `waterCost` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `contractTerm` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `PropertyImage` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `RoomTypeImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomId,moveInDate]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Facility` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[propertyId,facilityId]` on the table `PropertyFacility` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[propertyId,roomNumber]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomTypeId,facilityId]` on the table `RoomFacility` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Made the column `billId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_billId_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "electricCost",
DROP COLUMN "otherCost",
DROP COLUMN "waterCost",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "month" DROP NOT NULL,
ALTER COLUMN "year" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "billId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "contractTerm";

-- AlterTable
ALTER TABLE "PropertyImage" DROP COLUMN "sortOrder";

-- AlterTable
ALTER TABLE "RoomTypeImage" DROP COLUMN "sortOrder";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "BillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_roomId_moveInDate_key" ON "Booking"("roomId", "moveInDate");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_name_key" ON "Facility"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFacility_propertyId_facilityId_key" ON "PropertyFacility"("propertyId", "facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_propertyId_roomNumber_key" ON "Room"("propertyId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RoomFacility_roomTypeId_facilityId_key" ON "RoomFacility"("roomTypeId", "facilityId");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveOutBill" ADD CONSTRAINT "MoveOutBill_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveOutBill" ADD CONSTRAINT "MoveOutBill_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveOutBill" ADD CONSTRAINT "MoveOutBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
