import type { MeowPayDatabase } from "../database/database.js";
import { CURRENT_WALLET_ID } from "../database/seed.js";
import { apiErrors } from "../errors.js";

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
    throw apiErrors.invalidAmount();
  }

  if (!Number.isInteger(recipientId)) {
    throw apiErrors.recipientNotFound();
  }

  if (recipientId === CURRENT_WALLET_ID) {
    throw apiErrors.selfTransfer();
  }

  return database.transaction(() => {
    const sender = database
      .prepare("SELECT id, name, balance FROM cats WHERE id = ?")
      .get(CURRENT_WALLET_ID) as CatRow | undefined;
    const recipient = database
      .prepare("SELECT id, name, balance FROM cats WHERE id = ?")
      .get(recipientId) as CatRow | undefined;

    if (!sender) {
      throw apiErrors.walletNotFound();
    }

    if (!recipient) {
      throw apiErrors.recipientNotFound();
    }

    const deduction = database
      .prepare("UPDATE cats SET balance = balance - ? WHERE id = ? AND balance >= ?")
      .run(amount, sender.id, amount);

    if (deduction.changes !== 1) {
      throw apiErrors.insufficientBalance();
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
