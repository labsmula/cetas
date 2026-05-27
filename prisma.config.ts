import "dotenv/config";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon: use the unpooled URL for migrations (direct connection)
    // Falls back to DATABASE_URL if DIRECT_URL not set
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
