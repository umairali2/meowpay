import type { MeowPayDatabase } from "../database/database.js";
import { CURRENT_WALLET_ID } from "../database/seed.js";

export type TransferErrorCode =
  | "INVALID_AMOUNT"
  | "RECIPIENT_NOT_FOUND"
  | "SELF_TRANSFER_NOT_ALLOWED"
  | "WALLET_NOT_FOUND"
  | "INSUFFICIENT_BALANCE";

export class TransferError extends Error {
  constructor(public readonly code: TransferErrorCode) {
    super(code);
  }
}

type CatRow = {
  id: number;
  name: string;
  balance: number;
};

type TransferRow = {
  id: number;
  createdAt: string;
};

export function createTransfer(database: MeowPayDatabase, recipientId: number, amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new TransferError("INVALID_AMOUNT");
  }

  if (!Number.isInteger(recipientId)) {
    throw new TransferError("RECIPIENT_NOT_FOUND");
  }

  if (recipientId === CURRENT_WALLET_ID) {
    throw new TransferError("SELF_TRANSFER_NOT_ALLOWED");
  }

  return database.transaction(() => {
    const sender = database
      .prepare("SELECT id, name, balance FROM cats WHERE id = ?")
      .get(CURRENT_WALLET_ID) as CatRow | undefined;
    const recipient = database
      .prepare("SELECT id, name, balance FROM cats WHERE id = ?")
      .get(recipientId) as CatRow | undefined;

    if (!sender) {
      throw new TransferError("WALLET_NOT_FOUND");
    }

    if (!recipient) {
      throw new TransferError("RECIPIENT_NOT_FOUND");
    }

    const deduction = database
      .prepare("UPDATE cats SET balance = balance - ? WHERE id = ? AND balance >= ?")
      .run(amount, sender.id, amount);

    if (deduction.changes !== 1) {
      throw new TransferError("INSUFFICIENT_BALANCE");
    }

    database.prepare("UPDATE cats SET balance = balance + ? WHERE id = ?").run(amount, recipient.id);
    const transfer = database
      .prepare(`
        INSERT INTO transfers (sender_id, recipient_id, amount)
        VALUES (?, ?, ?)
        RETURNING id, created_at AS createdAt
      `)
      .get(sender.id, recipient.id, amount) as TransferRow;

    return {
      transfer: {
        id: transfer.id,
        sender: { id: sender.id, name: sender.name },
        recipient: { id: recipient.id, name: recipient.name },
        amount,
        createdAt: transfer.createdAt,
      },
      remainingBalance: sender.balance - amount,
    };
  })();
}
