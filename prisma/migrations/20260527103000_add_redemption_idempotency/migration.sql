ALTER TABLE "point_redemptions"
  ADD COLUMN "idempotency_key" TEXT;

CREATE UNIQUE INDEX "point_redemptions_player_id_idempotency_key_key"
  ON "point_redemptions"("player_id", "idempotency_key");
