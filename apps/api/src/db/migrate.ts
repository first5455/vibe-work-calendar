import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";

console.log("Migrating database...");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Database migrated!");
process.exit(0);
