/*
  Warnings:

  - The `oldData` column on the `audits` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `newData` column on the `audits` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "audits" DROP COLUMN "oldData",
ADD COLUMN     "oldData" JSON,
DROP COLUMN "newData",
ADD COLUMN     "newData" JSON;
