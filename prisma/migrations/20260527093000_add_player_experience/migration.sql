ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "experience" INTEGER NOT NULL DEFAULT 0;

UPDATE "players"
SET
  "experience" = GREATEST("best_stage" - 1, 0) * 100,
  "level" = GREATEST(1, FLOOR((GREATEST("best_stage" - 1, 0) * 100)::numeric / 500)::integer + 1);
