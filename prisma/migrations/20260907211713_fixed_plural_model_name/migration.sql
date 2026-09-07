/*
  Warnings:

  - You are about to drop the `TaskAssignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskAssignments" DROP CONSTRAINT "TaskAssignments_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignments" DROP CONSTRAINT "TaskAssignments_userId_fkey";

-- DropTable
DROP TABLE "TaskAssignments";

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskId","userId")
);

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
