import { client } from "../db/client.js";
import { green, red, yellow } from "../lib/chalk.js";
import { getMeta } from "../lib/meta.js";
import fs from "fs";

export default async function (dirname) {
    const meta = getMeta();

    if (!meta) {
        console.log(red("meta.json not found"));
        return;
    }

    const { migrations } = meta;

    if (migrations.pending.length === 0) {
        console.log(yellow("No pending migrations found"));
        return;
    }

    const { default: config } = await import(`${dirname}/migrate.config.js`);

    if (!config) {
        console.log(red("No config file found"));
        return;
    }
    const db = client(config);
    await db.connect();
    let res = await db.query(
        `SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${config.database}')`
    );
    if (res.rows.length === 0) {
        await db.query(`CREATE DATABASE ${config.database}`);
    }

    try {
        while (migrations.pending.length !== 0) {
            const migration = migrations.pending[0];
            const content = fs.readFileSync(`${dirname}/migrations/${migration}`, "utf8");
            if (!content) {
                console.log(red(`Content of migration ${migration} is empty`));
                break;
            }
            await db.query(content);
            console.log(green(`successfully migrated ${migration}`));
            migrations.finished.push(migration);
            migrations.pending.shift();
        }
    } catch (error) {
        console.log(error);
    } finally {
        fs.writeFileSync(`${dirname}/migrations/meta.json`, JSON.stringify({ migrations }));
        db.end();
    }
}
