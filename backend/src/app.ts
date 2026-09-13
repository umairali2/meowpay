import cors from "cors";
import express from "express";
import { database } from "./database/client.js";
import type { MeowPayDatabase } from "./database/database.js";
import { healthRouter } from "./routes/health.js";
import { createWalletRouter } from "./routes/wallet.js";

export function createApp(appDatabase: MeowPayDatabase = database) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/health", healthRouter);
  app.use("/api/wallet", createWalletRouter(appDatabase));

  return app;
}

export const app = createApp();
