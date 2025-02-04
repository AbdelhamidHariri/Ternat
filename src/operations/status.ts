import fs from "fs";
import { yellow, red } from "../lib/chalk";
import { client } from "../db/client";
import { dirname } from "..";

export default async function () {
  if (!fs.existsSync(`${dirname}/ternat.config.cjs`)) {
    console.log(red("ternat.config.cjs is missing"));
    return;
  }

  const { default: config } = await import(`${dirname}/ternat.config.cjs`);

  if (!config) {
    console.log(red("No config file found"));
    return;
  }

  if (!fs.existsSync(`${dirname}/migrations`)) {
    console.log(red("No migration folder found"));
    return;
  }

  const migrationFiles = fs.readdirSync(`${dirname}/migrations`);
  if (migrationFiles.length === 0) {
    console.log(yellow("No changes"));
    return;
  }

  const db = client(config);

  try {
    await db.connect();
    const migrationTableCheck = await db.query(
      `SELECT tablename FROM pg_catalog.pg_tables Where tablename = 'migrations'`
    );

    if (migrationTableCheck.rows.length === 0) {
      console.log("Pending migrations...");
      migrationFiles.forEach((migration) => console.log(yellow(migration)));
      return;
    }

    const { rows: migrations } = await db.query(`SELECT name FROM migrations`);

    const pendingMigrations: Array<string> = [];

    migrationFiles.forEach((migration) => {
      if (!migrations.some((m: { name: string }) => m.name === migration)) {
        pendingMigrations.push(migration);
      }
    });

    if (pendingMigrations.length === 0) {
      console.log("Migrations up to data");
      return;
    }

    console.log("Pending migrations:\n");
    pendingMigrations.forEach((migration) => console.log(yellow(migration)));
    console.log("\nRun migrate to migrate the changes to database");
  } catch (error) {
    console.log(error);
  } finally {
    await db.end();
  }
}
