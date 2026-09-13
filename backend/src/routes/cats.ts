import { Router } from "express";
import type { MeowPayDatabase } from "../database/database.js";
import { CURRENT_WALLET_ID } from "../database/seed.js";

export function createCatsRouter(database: MeowPayDatabase) {
  const router = Router();

  router.get("/", (_request, response) => {
    const cats = database
      .prepare("SELECT id, name FROM cats WHERE id <> ? ORDER BY name")
      .all(CURRENT_WALLET_ID);

    response.json(cats);
  });

  return router;
}
