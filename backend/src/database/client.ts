import { initializeDatabase, openDatabase } from "./database.js";

export const database = openDatabase();
initializeDatabase(database);
