-- CreateTable
CREATE TABLE "Log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "odooId" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "record" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionTime" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Log_actionTime_idx" ON "Log"("actionTime");

-- CreateIndex
CREATE UNIQUE INDEX "Log_odooId_model_key" ON "Log"("odooId", "model");
