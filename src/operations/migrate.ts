import { client } from "../db/client";
import { green, red } from "../lib/chalk";
import fs from "fs";
import { migrationTable } from "../sql/migration_table";
import { dirname } from "..";

export default async function () {
  if (!fs.existsSync(`${dirname}/ternat.config.cjs`)) {
    console.log(red("ternat.config.cjs is missing"));
    return;
  }

  const { config } = await import(`${dirname}/ternat.config.cjs`);

  if (!config) {
    console.log(red("No config file found"));
    return;
  }
  const db = client(config);

  try {
    await db.connect();

    const databaseNameResult = await db.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${config.database}')`
    );

    if (databaseNameResult.rows.length === 0) {
      await db.query(`CREATE DATABASE ${config.database}`);
    }

    const migrationTableCheck = await db.query(
      `SELECT tablename FROM pg_catalog.pg_tables Where tablename = 'migrations'`
    );

    if (migrationTableCheck.rows.length === 0) {
      await db.query(migrationTable);
    }

    const { rows: migrations } = await db.query(`SELECT name FROM migrations`);

    const migrationFiles = fs.readdirSync(`${dirname}/migrations`);

    for (const migration of migrationFiles) {
      if (!migrations.some((m: { name: string }) => m.name === migration)) {
        const content = fs.readFileSync(`${dirname}/migrations/${migration}`, "utf8");
        if (!content) {
          console.log(red(`Content of migration ${migration} is empty`));
          break;
        }
        await db.query(content);
        await db.query(`INSERT INTO migrations (name) VALUES ($1)`, [migration]);
        console.log(green(`successfully migrated ${migration}`));
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await db.end();
  }
}
