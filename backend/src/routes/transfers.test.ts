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
    expect(response.body.transfer.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
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

  it.each([undefined, 0, -1, 1.5, "25"])("rejects invalid amount %s", async (amount) => {
    const response = await request(createApp(database))
      .post("/api/transfers")
      .send({ recipientId: 2, amount });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_AMOUNT");
  });

  it("rejects an unknown recipient", async () => {
    const response = await request(createApp(database))
      .post("/api/transfers")
      .send({ recipientId: 99, amount: 25 });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RECIPIENT_NOT_FOUND");
  });

  it("rejects a transfer to the current wallet", async () => {
    const response = await request(createApp(database))
      .post("/api/transfers")
      .send({ recipientId: 1, amount: 25 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("SELF_TRANSFER_NOT_ALLOWED");
  });

  it("returns 404 when the current wallet is missing", async () => {
    database.prepare("DELETE FROM cats WHERE id = 1").run();

    const response = await request(createApp(database))
      .post("/api/transfers")
      .send({ recipientId: 2, amount: 25 });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("WALLET_NOT_FOUND");
  });

  it("prevents repeated requests from overdrawing the wallet", async () => {
    const app = createApp(database);
    const responses = await Promise.all([
      request(app).post("/api/transfers").send({ recipientId: 2, amount: 200 }),
      request(app).post("/api/transfers").send({ recipientId: 2, amount: 200 }),
    ]);

    const sender = database.prepare("SELECT balance FROM cats WHERE id = 1").get() as BalanceRow;
    const recipient = database.prepare("SELECT balance FROM cats WHERE id = 2").get() as BalanceRow;
    const transfers = database.prepare("SELECT COUNT(*) AS count FROM transfers").get() as CountRow;

    expect(responses.map(({ status }) => status).sort()).toEqual([201, 409]);
    expect(sender.balance).toBe(50);
    expect(recipient.balance).toBe(300);
    expect(transfers.count).toBe(1);
  });
});
