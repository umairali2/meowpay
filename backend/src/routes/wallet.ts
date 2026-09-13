import { Router } from "express";
import type { MeowPayDatabase } from "../database/database.js";
import { CURRENT_WALLET_ID } from "../database/seed.js";
import { apiErrors } from "../errors.js";

type WalletRow = {
  id: number;
  name: string;
  balance: number;
};

export function createWalletRouter(database: MeowPayDatabase) {
  const router = Router();

  router.get("/", (_request, response, next) => {
    const wallet = database
      .prepare("SELECT id, name, balance FROM cats WHERE id = ?")
      .get(CURRENT_WALLET_ID) as WalletRow | undefined;

    if (!wallet) {
      next(apiErrors.walletNotFound());
      return;
    }

    response.json(wallet);
  });

  return router;
}
