-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMINISTRADOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "sharePercentage" REAL NOT NULL DEFAULT 50,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "institution" TEXT,
    "lastFourDigits" TEXT,
    "creditLimit" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentMethod_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT,
    "amount" REAL NOT NULL,
    "paidById" TEXT NOT NULL,
    "paymentMethodId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PAGA',
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "projectName" TEXT,
    "campaignId" TEXT,
    "groupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expense_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "platform" TEXT,
    "source" TEXT,
    "grossAmount" REAL NOT NULL,
    "fees" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREVISTA',
    "categoryId" TEXT,
    "destinationAccountId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Revenue_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Revenue_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "PaymentMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "originDescription" TEXT,
    "destinationAccountId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contribution_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contribution_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "PaymentMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT,
    "accountId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Withdrawal_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Withdrawal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PaymentMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'WhatsApp',
    "foundedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "category" TEXT,
    "responsibleId" TEXT,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "participantLimit" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Group_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupMembershipHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMembershipHistory_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "platform" TEXT,
    "price" REAL,
    "promoPrice" REAL,
    "commissionValue" REAL,
    "commissionPercent" REAL,
    "originalUrl" TEXT,
    "imageUrl" TEXT,
    "supplier" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "platform" TEXT,
    "url" TEXT NOT NULL,
    "source" TEXT,
    "campaignId" TEXT,
    "groupId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AffiliateLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AffiliateLink_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliateLinkId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    CONSTRAINT "Click_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "AffiliateLink" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT,
    "productId" TEXT,
    "orderId" TEXT,
    "saleValue" REAL NOT NULL,
    "commissionValue" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREVISTA',
    "date" DATETIME NOT NULL,
    "expectedPaymentDate" DATETIME,
    "receivedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Commission_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "platform" TEXT,
    "objective" TEXT,
    "budget" REAL,
    "spent" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PLANEJADA',
    "groupId" TEXT,
    "productId" TEXT,
    "impressions" INTEGER,
    "reach" INTEGER,
    "clicks" INTEGER,
    "conversions" INTEGER,
    "revenue" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Campaign_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OUTRO',
    "uploadedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expenseId" TEXT,
    "revenueId" TEXT,
    "contributionId" TEXT,
    "withdrawalId" TEXT,
    "campaignId" TEXT,
    "productId" TEXT,
    "groupId" TEXT,
    CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_revenueId_fkey" FOREIGN KEY ("revenueId") REFERENCES "Revenue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "changes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NAO_CONFIGURADA',
    "config" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AiConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");

-- CreateIndex
CREATE INDEX "PaymentMethod_ownerId_idx" ON "PaymentMethod"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_type_parentId_key" ON "Category"("name", "type", "parentId");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_paidById_idx" ON "Expense"("paidById");

-- CreateIndex
CREATE INDEX "Revenue_date_idx" ON "Revenue"("date");

-- CreateIndex
CREATE INDEX "Contribution_date_idx" ON "Contribution"("date");

-- CreateIndex
CREATE INDEX "Contribution_partnerId_idx" ON "Contribution"("partnerId");

-- CreateIndex
CREATE INDEX "Withdrawal_date_idx" ON "Withdrawal"("date");

-- CreateIndex
CREATE INDEX "Withdrawal_partnerId_idx" ON "Withdrawal"("partnerId");

-- CreateIndex
CREATE INDEX "GroupMembershipHistory_groupId_date_idx" ON "GroupMembershipHistory"("groupId", "date");

-- CreateIndex
CREATE INDEX "AffiliateLink_productId_idx" ON "AffiliateLink"("productId");

-- CreateIndex
CREATE INDEX "Click_affiliateLinkId_createdAt_idx" ON "Click"("affiliateLinkId", "createdAt");

-- CreateIndex
CREATE INDEX "Commission_date_idx" ON "Commission"("date");

-- CreateIndex
CREATE INDEX "Commission_status_idx" ON "Commission"("status");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_provider_key" ON "Integration"("provider");

-- CreateIndex
CREATE INDEX "AiConversation_userId_idx" ON "AiConversation"("userId");
