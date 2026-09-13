import { initializeDatabase, openDatabase } from "../database/database.js";
import { seedDatabase } from "../database/seed.js";

const database = openDatabase();
initializeDatabase(database);
seedDatabase(database);
database.close();

console.log("Database seeded");
