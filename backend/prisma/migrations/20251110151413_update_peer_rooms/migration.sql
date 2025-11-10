/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `description` on the `PeerRoom` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `PeerRoom` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PeerRoom` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PeerRoom` table. All the data in the column will be lost.
  - Added the required column `slug` to the `PeerRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `PeerRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_isFlagged_idx";

-- DropIndex
DROP INDEX "Message_userId_idx";

-- DropIndex
DROP INDEX "Message_roomId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Message";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PeerMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PeerMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PeerRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PeerMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PeerRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "isMinorSafe" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PeerRoom" ("createdAt", "id", "topic") SELECT "createdAt", "id", "topic" FROM "PeerRoom";
DROP TABLE "PeerRoom";
ALTER TABLE "new_PeerRoom" RENAME TO "PeerRoom";
CREATE UNIQUE INDEX "PeerRoom_slug_key" ON "PeerRoom"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PeerMessage_roomId_idx" ON "PeerMessage"("roomId");

-- CreateIndex
CREATE INDEX "PeerMessage_authorId_idx" ON "PeerMessage"("authorId");

-- CreateIndex
CREATE INDEX "PeerMessage_flagged_idx" ON "PeerMessage"("flagged");
