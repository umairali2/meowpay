import { Router } from "express";
import type { MeowPayDatabase } from "../database/database.js";
import { createTransfer } from "../services/transfer.js";

export function createTransfersRouter(database: MeowPayDatabase) {
  const router = Router();

  router.post("/", (request, response) => {
    const { recipientId, amount } = request.body ?? {};
    const result = createTransfer(database, recipientId, amount);

    response.status(201).json(result);
  });

  return router;
}
