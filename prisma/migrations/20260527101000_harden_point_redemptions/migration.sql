ALTER TABLE "point_redemptions"
  ADD COLUMN IF NOT EXISTS "wallet_address" TEXT,
  ADD COLUMN IF NOT EXISTS "token_amount_wei" BIGINT,
  ADD COLUMN IF NOT EXISTS "chain_id" INTEGER,
  ADD COLUMN IF NOT EXISTS "token_address" TEXT,
  ADD COLUMN IF NOT EXISTS "submitted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "confirmed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "failed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "failure_reason" TEXT;

UPDATE "point_redemptions" pr
SET
  "wallet_address" = p."wallet_address",
  "token_amount_wei" = (pr."points"::BIGINT * 100000000000000)
FROM "players" p
WHERE pr."player_id" = p."id"
  AND (pr."wallet_address" IS NULL OR pr."token_amount_wei" IS NULL);

ALTER TABLE "point_redemptions"
  ALTER COLUMN "wallet_address" SET NOT NULL,
  ALTER COLUMN "token_amount_wei" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "point_redemptions_tx_hash_key"
  ON "point_redemptions"("tx_hash");
