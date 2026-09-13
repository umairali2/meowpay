import type { MeowPayDatabase } from "./database.js";

export const CURRENT_WALLET_ID = 1;

const cats = [
  { id: CURRENT_WALLET_ID, name: "Whiskers", balance: 250 },
  { id: 2, name: "Mittens", balance: 100 },
  { id: 3, name: "Luna", balance: 175 },
  { id: 4, name: "Oliver", balance: 80 },
];

export function seedDatabase(database: MeowPayDatabase) {
  const insert = database.prepare(`
    INSERT INTO cats (id, name, balance)
    VALUES (@id, @name, @balance)
    ON CONFLICT DO NOTHING
  `);

  database.transaction(() => {
    for (const cat of cats) {
      insert.run(cat);
    }
  })();
}
