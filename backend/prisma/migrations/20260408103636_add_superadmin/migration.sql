-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERADMIN';

-- CreateTable
CREATE TABLE "AdminLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyLimit" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "AdminLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminLimit_userId_key" ON "AdminLimit"("userId");

-- AddForeignKey
ALTER TABLE "AdminLimit" ADD CONSTRAINT "AdminLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
