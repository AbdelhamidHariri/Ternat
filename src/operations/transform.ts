import { client } from "../db/client";
import { green, red } from "../lib/chalk";
import fs from "fs";
import { dirname } from "..";
import { transformationTable } from "../sql/transformation_table";

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

    const transformationTableCheck = await db.query(
      `SELECT tablename FROM pg_catalog.pg_tables Where tablename = 'transformations'`
    );

    if (transformationTableCheck.rows.length === 0) {
      await db.query(transformationTable);
    }

    const { rows: transformations } = await db.query(`SELECT name FROM transformations`);

    const transformationFiles = fs.readdirSync(`${dirname}/transformations`);

    for (const transformation of transformationFiles) {
      if (!transformations.some((t: { name: string }) => t.name === transformation)) {
        const content = fs.readFileSync(`${dirname}/transformations/${transformation}`, "utf8");
        if (!content) {
          console.log(red(`Content of transformation ${transformation} is empty`));
          break;
        }
        await db.query(content);
        await db.query(`INSERT INTO transformations (name) VALUES ($1)`, [transformation]);
        console.log(green(`successfully transformed ${transformation}`));
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await db.end();
  }
}
