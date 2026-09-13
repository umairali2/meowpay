import cors from "cors";
import express from "express";
import { database } from "./database/client.js";
import type { MeowPayDatabase } from "./database/database.js";
import { errorHandler } from "./errors.js";
import { createCatsRouter } from "./routes/cats.js";
import { healthRouter } from "./routes/health.js";
import { createTransfersRouter } from "./routes/transfers.js";
import { createWalletRouter } from "./routes/wallet.js";

export function createApp(appDatabase: MeowPayDatabase = database) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/health", healthRouter);
  app.use("/api/wallet", createWalletRouter(appDatabase));
  app.use("/api/cats", createCatsRouter(appDatabase));
  app.use("/api/transfers", createTransfersRouter(appDatabase));
  app.use(errorHandler);

  return app;
}

export const app = createApp();
