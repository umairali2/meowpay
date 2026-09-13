import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { initializeDatabase, openDatabase, type MeowPayDatabase } from "../database/database.js";
import { seedDatabase } from "../database/seed.js";

type BalanceRow = { balance: number };
type CountRow = { count: number };

describe("POST /api/transfers", () => {
  let database: MeowPayDatabase;

  beforeEach(() => {
    database = openDatabase(":memory:");
    initializeDatabase(database);
    seedDatabase(database);
  });

  afterEach(() => {
    database.close();
  });

  it("moves treats and records the transfer", async () => {
    const response = await request(createApp(database))
      .post("/api/transfers")
      .send({ recipientId: 2, amount: 25 });

    const sender = database.prepare("SELECT balance FROM cats WHERE id = 1").get() as BalanceRow;
    const recipient = database.prepare("SELECT balance FROM cats WHERE id = 2").get() as BalanceRow;
    const transfers = database.prepare("SELECT COUNT(*) AS count FROM transfers").get() as CountRow;

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      transfer: {
        id: 1,
        sender: { id: 1, name: "Whiskers" },
        recipient: { id: 2, name: "Mittens" },
        amount: 25,
      },
      remainingBalance: 225,
    });
    expect(sender.balance).toBe(225);
    expect(recipient.balance).toBe(125);
    expect(transfers.count).toBe(1);
  });

  it("leaves balances unchanged when funds are insufficient", async () => {
    const response = await request(createApp(database))
      .post("/api/transfers")
      .send({ recipientId: 2, amount: 251 });

    const sender = database.prepare("SELECT balance FROM cats WHERE id = 1").get() as BalanceRow;
    const recipient = database.prepare("SELECT balance FROM cats WHERE id = 2").get() as BalanceRow;
    const transfers = database.prepare("SELECT COUNT(*) AS count FROM transfers").get() as CountRow;

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("INSUFFICIENT_BALANCE");
    expect(sender.balance).toBe(250);
    expect(recipient.balance).toBe(100);
    expect(transfers.count).toBe(0);
  });
});
