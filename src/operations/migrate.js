import { client } from "../db/client.js";
import { green, red } from "../lib/chalk.js";
import fs from "fs";
import { migrationTable } from "../sql/migration_table.js";

export default async function (dirname) {
    if (!fs.existsSync(`${dirname}/migrate.config.js`)) {
        console.log(red("migrate.config.js is missing"));
        return;
    }

    const { default: config } = await import(`${dirname}/migrate.config.js`);

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
            if (!migrations.some((m) => m.name === migration)) {
                const content = fs.readFileSync(`${dirname}/migrations/${migration}`, "utf8");
                if (!content) {
                    console.log(red(`Content of migration ${migration} is empty`));
                    break;
                }
                console.log(migrations);
                await db.query(content);
                await db.query(`INSERT INTO migrations (name) VALUES ($1)`, [migration]);
                console.log(green(`successfully migrated ${migration}`));
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        db.end();
    }
}
