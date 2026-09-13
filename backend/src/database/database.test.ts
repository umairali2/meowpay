import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initializeDatabase, openDatabase, type MeowPayDatabase } from "./database.js";
import { seedDatabase } from "./seed.js";

type CountRow = { count: number };
type BalanceRow = { balance: number };

describe("database", () => {
  let database: MeowPayDatabase;

  beforeEach(() => {
    database = openDatabase(":memory:");
    initializeDatabase(database);
  });

  afterEach(() => {
    database.close();
  });

  it("seeds the four cats without resetting existing balances", () => {
    seedDatabase(database);
    database.prepare("UPDATE cats SET balance = 225 WHERE id = 1").run();
    seedDatabase(database);

    const { count } = database.prepare("SELECT COUNT(*) AS count FROM cats").get() as CountRow;
    const { balance } = database.prepare("SELECT balance FROM cats WHERE id = 1").get() as BalanceRow;

    expect(count).toBe(4);
    expect(balance).toBe(225);
  });

  it("enforces balance, transfer, and relationship constraints", () => {
    seedDatabase(database);

    expect(() => database.prepare("UPDATE cats SET balance = -1 WHERE id = 1").run()).toThrow();
    expect(() => database.prepare("INSERT INTO transfers (sender_id, recipient_id, amount) VALUES (1, 2, 0)").run()).toThrow();
    expect(() => database.prepare("INSERT INTO transfers (sender_id, recipient_id, amount) VALUES (1, 1, 10)").run()).toThrow();
    expect(() => database.prepare("INSERT INTO transfers (sender_id, recipient_id, amount) VALUES (1, 99, 10)").run()).toThrow();
  });
});

describe("file persistence", () => {
  it("retains balances after reopening the database", () => {
    const directory = mkdtempSync(join(tmpdir(), "meowpay-"));
    const path = join(directory, "test.sqlite");
    const firstConnection = openDatabase(path);

    initializeDatabase(firstConnection);
    seedDatabase(firstConnection);
    firstConnection.prepare("UPDATE cats SET balance = 225 WHERE id = 1").run();
    firstConnection.close();

    const secondConnection = openDatabase(path);
    const { balance } = secondConnection.prepare("SELECT balance FROM cats WHERE id = 1").get() as BalanceRow;
    secondConnection.close();
    rmSync(directory, { recursive: true });

    expect(balance).toBe(225);
  });
});
