import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { initializeDatabase, openDatabase, type MeowPayDatabase } from "../database/database.js";
import { seedDatabase } from "../database/seed.js";

describe("GET /api/wallet", () => {
  let database: MeowPayDatabase;

  beforeEach(() => {
    database = openDatabase(":memory:");
    initializeDatabase(database);
    seedDatabase(database);
  });

  afterEach(() => {
    database.close();
  });

  it("returns the current wallet", async () => {
    const response = await request(createApp(database)).get("/api/wallet");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, name: "Whiskers", balance: 250 });
  });

  it("returns 404 when the current wallet is missing", async () => {
    database.prepare("DELETE FROM cats WHERE id = 1").run();

    const response = await request(createApp(database)).get("/api/wallet");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("WALLET_NOT_FOUND");
  });
});
