import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { schema } from "./schema.js";

export type MeowPayDatabase = Database.Database;

export function openDatabase(path = process.env.DATABASE_PATH ?? "./data/meowpay.sqlite") {
  const databasePath = path === ":memory:" ? path : resolve(path);

  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const database = new Database(databasePath);
  database.pragma("foreign_keys = ON");
  return database;
}

export function initializeDatabase(database: MeowPayDatabase) {
  database.exec(schema);
}
