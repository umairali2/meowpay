import { Router } from "express";
import type { MeowPayDatabase } from "../database/database.js";
import { CURRENT_WALLET_ID } from "../database/seed.js";

type WalletRow = {
  id: number;
  name: string;
  balance: number;
};

export function createWalletRouter(database: MeowPayDatabase) {
  const router = Router();

  router.get("/", (_request, response) => {
    const wallet = database
      .prepare("SELECT id, name, balance FROM cats WHERE id = ?")
      .get(CURRENT_WALLET_ID) as WalletRow | undefined;

    if (!wallet) {
      response.status(404).json({
        error: {
          code: "WALLET_NOT_FOUND",
          message: "Current wallet was not found.",
        },
      });
      return;
    }

    response.json(wallet);
  });

  return router;
}
