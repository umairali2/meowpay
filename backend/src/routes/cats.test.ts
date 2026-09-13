import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { initializeDatabase, openDatabase, type MeowPayDatabase } from "../database/database.js";
import { seedDatabase } from "../database/seed.js";

describe("GET /api/cats", () => {
  let database: MeowPayDatabase;

  beforeEach(() => {
    database = openDatabase(":memory:");
    initializeDatabase(database);
    seedDatabase(database);
  });

  afterEach(() => {
    database.close();
  });

  it("returns recipients without the current wallet", async () => {
    const response = await request(createApp(database)).get("/api/cats");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 3, name: "Luna" },
      { id: 2, name: "Mittens" },
      { id: 4, name: "Oliver" },
    ]);
    expect(response.body).not.toContainEqual({ id: 1, name: "Whiskers" });
  });
});
