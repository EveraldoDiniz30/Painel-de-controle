-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AffiliateLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platform" TEXT,
    "url" TEXT NOT NULL,
    "source" TEXT,
    "campaignId" TEXT,
    "groupId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AffiliateLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AffiliateLink_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AffiliateLink" ("campaignId", "createdAt", "date", "groupId", "id", "platform", "productId", "slug", "source", "status", "url") SELECT "campaignId", "createdAt", "date", "groupId", "id", "platform", "productId", "slug", "source", "status", "url" FROM "AffiliateLink";
DROP TABLE "AffiliateLink";
ALTER TABLE "new_AffiliateLink" RENAME TO "AffiliateLink";
CREATE UNIQUE INDEX "AffiliateLink_slug_key" ON "AffiliateLink"("slug");
CREATE INDEX "AffiliateLink_productId_idx" ON "AffiliateLink"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
