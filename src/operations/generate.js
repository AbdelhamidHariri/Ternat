import fs from "fs";
import { red, green, yellow } from "../lib/chalk.js";

export default async function (dirname, name) {
    if (!name) {
        console.log(yellow("Please specify a name for the migration"));
        return;
    }

    if (!fs.readdirSync(`${dirname}/migrations`)) {
        console.log(red("Please run init first"));
        return;
    }

    if (!fs.existsSync(`${dirname}/migrations/meta.json`)) {
        console.log(red("meta.json is not found in migration folder"));
        return;
    }

    try {
        const data = fs.readFileSync(`${dirname}/migrations/meta.json`, "utf8");
        const meta = JSON.parse(data);

        const timestamp = Date.now();
        const fileName = `${timestamp}_${name}.sql`;

        fs.writeFileSync(`${dirname}/migrations/${fileName}`, "");
        meta.migrations.pending.push(fileName);
    } catch (error) {
        console.log(error);
    } finally {
        fs.writeFileSync(`${dirname}/migrations/meta.json`, JSON.stringify(meta));
        console.log(green(`Migration ${fileName} created`));
    }
}
