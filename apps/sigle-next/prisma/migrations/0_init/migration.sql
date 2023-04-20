-- Generated following this guide
-- https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/add-prisma-migrate-to-a-project

-- CreateTable
CREATE TABLE "ceramic_config" (
    "option" VARCHAR(1024) NOT NULL,
    "value" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(1024)
);

-- CreateTable
CREATE TABLE "ceramic_models" (
    "model" VARCHAR(1024) NOT NULL,
    "is_indexed" BOOLEAN NOT NULL DEFAULT true,
    "enable_historical_sync" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(1024) NOT NULL,

    CONSTRAINT "ceramic_models_pkey" PRIMARY KEY ("model")
);

-- CreateTable
CREATE TABLE "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv" (
    "stream_id" VARCHAR(255) NOT NULL,
    "controller_did" VARCHAR(1024) NOT NULL,
    "stream_content" JSONB NOT NULL,
    "tip" VARCHAR(255) NOT NULL,
    "last_anchored_at" TIMESTAMPTZ(6),
    "first_anchored_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_ckkrpoklqv_pkey" PRIMARY KEY ("stream_id")
);

-- CreateTable
CREATE TABLE "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays" (
    "stream_id" VARCHAR(255) NOT NULL,
    "controller_did" VARCHAR(1024) NOT NULL,
    "stream_content" JSONB NOT NULL,
    "tip" VARCHAR(255) NOT NULL,
    "last_anchored_at" TIMESTAMPTZ(6),
    "first_anchored_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_if9edmoays_pkey" PRIMARY KEY ("stream_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "constr_config_option_unique" ON "ceramic_config"("option");

-- CreateIndex
CREATE UNIQUE INDEX "ceramic_models_model_unique" ON "ceramic_models"("model");

-- CreateIndex
CREATE INDEX "idx_ceramic_is_indexed" ON "ceramic_models"("is_indexed");

-- CreateIndex
CREATE UNIQUE INDEX "constr_ckkrpoklqv_unique" ON "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv"("stream_id");

-- CreateIndex
CREATE INDEX "idx_ckkrpoklqv_created_at" ON "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv"("created_at");

-- CreateIndex
CREATE INDEX "idx_ckkrpoklqv_first_anchored_at" ON "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv"("first_anchored_at");

-- CreateIndex
CREATE INDEX "idx_ckkrpoklqv_last_anchored_at" ON "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv"("last_anchored_at");

-- CreateIndex
CREATE INDEX "idx_ckkrpoklqv_last_anchored_at_created_at" ON "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv"("last_anchored_at", "created_at");

-- CreateIndex
CREATE INDEX "idx_ckkrpoklqv_stream_id" ON "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv"("stream_id");

-- CreateIndex
CREATE INDEX "idx_ckkrpoklqv_updated_at" ON "kjzl6hvfrbw6c6qxiv8jr3gbrdtbcb2bq4475sgbssui6jj4kf4r9ckkrpoklqv"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "constr_if9edmoays_unique" ON "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays"("stream_id");

-- CreateIndex
CREATE INDEX "idx_if9edmoays_created_at" ON "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays"("created_at");

-- CreateIndex
CREATE INDEX "idx_if9edmoays_first_anchored_at" ON "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays"("first_anchored_at");

-- CreateIndex
CREATE INDEX "idx_if9edmoays_last_anchored_at" ON "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays"("last_anchored_at");

-- CreateIndex
CREATE INDEX "idx_if9edmoays_last_anchored_at_created_at" ON "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays"("last_anchored_at", "created_at");

-- CreateIndex
CREATE INDEX "idx_if9edmoays_stream_id" ON "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays"("stream_id");

-- CreateIndex
CREATE INDEX "idx_if9edmoays_updated_at" ON "kjzl6hvfrbw6c9nddzeeiqpwtdfldp4w7vi8zuvzhb1pqk02bc6gtif9edmoays"("updated_at");

