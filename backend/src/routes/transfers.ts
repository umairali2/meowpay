import { Router } from "express";
import type { MeowPayDatabase } from "../database/database.js";
import { createTransfer, TransferError, type TransferErrorCode } from "../services/transfer.js";

const errors: Record<TransferErrorCode, { status: number; message: string }> = {
  INVALID_AMOUNT: { status: 400, message: "Amount must be a positive whole number." },
  RECIPIENT_NOT_FOUND: { status: 404, message: "Recipient was not found." },
  SELF_TRANSFER_NOT_ALLOWED: { status: 400, message: "You cannot send treats to yourself." },
  WALLET_NOT_FOUND: { status: 404, message: "Current wallet was not found." },
  INSUFFICIENT_BALANCE: { status: 409, message: "Insufficient treat balance." },
};

export function createTransfersRouter(database: MeowPayDatabase) {
  const router = Router();

  router.post("/", (request, response) => {
    const { recipientId, amount } = request.body ?? {};

    try {
      const result = createTransfer(database, recipientId, amount);
      response.status(201).json(result);
    } catch (error) {
      if (!(error instanceof TransferError)) {
        throw error;
      }

      const details = errors[error.code];
      response.status(details.status).json({
        error: {
          code: error.code,
          message: details.message,
        },
      });
    }
  });

  return router;
}
