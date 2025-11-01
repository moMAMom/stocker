-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'TSE',
    "sector" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalIndicator" (
    "id" SERIAL NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "ma_5" DOUBLE PRECISION,
    "ma_20" DOUBLE PRECISION,
    "ma_50" DOUBLE PRECISION,
    "rsi_14" DOUBLE PRECISION,
    "macd" DOUBLE PRECISION,
    "macd_signal" DOUBLE PRECISION,
    "macd_histogram" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "close_price" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" SERIAL NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "signal" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "ma_5" DOUBLE PRECISION,
    "ma_20" DOUBLE PRECISION,
    "ma_50" DOUBLE PRECISION,
    "rsi_14" DOUBLE PRECISION,
    "macd" DOUBLE PRECISION,
    "macd_signal" DOUBLE PRECISION,
    "current_price" DOUBLE PRECISION NOT NULL,
    "analysis_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisJob" (
    "id" SERIAL NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stock_ids" TEXT NOT NULL,
    "tickers" TEXT NOT NULL,
    "total_count" INTEGER NOT NULL,
    "processed_count" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioEntry" (
    "id" SERIAL NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "purchase_price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "sale_price" DOUBLE PRECISION,
    "sale_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_symbol_key" ON "Stock"("symbol");

-- CreateIndex
CREATE INDEX "Stock_symbol_idx" ON "Stock"("symbol");

-- CreateIndex
CREATE INDEX "Stock_market_idx" ON "Stock"("market");

-- CreateIndex
CREATE INDEX "TechnicalIndicator_stock_id_idx" ON "TechnicalIndicator"("stock_id");

-- CreateIndex
CREATE INDEX "TechnicalIndicator_date_idx" ON "TechnicalIndicator"("date");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalIndicator_stock_id_date_key" ON "TechnicalIndicator"("stock_id", "date");

-- CreateIndex
CREATE INDEX "AnalysisResult_stock_id_idx" ON "AnalysisResult"("stock_id");

-- CreateIndex
CREATE INDEX "AnalysisResult_signal_idx" ON "AnalysisResult"("signal");

-- CreateIndex
CREATE INDEX "AnalysisResult_analysis_date_idx" ON "AnalysisResult"("analysis_date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisResult_stock_id_analysis_date_key" ON "AnalysisResult"("stock_id", "analysis_date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisJob_job_id_key" ON "AnalysisJob"("job_id");

-- CreateIndex
CREATE INDEX "AnalysisJob_job_id_idx" ON "AnalysisJob"("job_id");

-- CreateIndex
CREATE INDEX "AnalysisJob_status_idx" ON "AnalysisJob"("status");

-- CreateIndex
CREATE INDEX "AnalysisJob_started_at_idx" ON "AnalysisJob"("started_at");

-- CreateIndex
CREATE INDEX "Portfolio_user_id_idx" ON "Portfolio"("user_id");

-- CreateIndex
CREATE INDEX "PortfolioEntry_portfolio_id_idx" ON "PortfolioEntry"("portfolio_id");

-- CreateIndex
CREATE INDEX "PortfolioEntry_stock_id_idx" ON "PortfolioEntry"("stock_id");

-- CreateIndex
CREATE INDEX "PortfolioEntry_purchase_date_idx" ON "PortfolioEntry"("purchase_date");

-- AddForeignKey
ALTER TABLE "TechnicalIndicator" ADD CONSTRAINT "TechnicalIndicator_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioEntry" ADD CONSTRAINT "PortfolioEntry_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioEntry" ADD CONSTRAINT "PortfolioEntry_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
