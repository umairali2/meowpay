import { initializeDatabase, openDatabase } from "../database/database.js";

const database = openDatabase();
initializeDatabase(database);
database.close();

console.log("Database initialized");
