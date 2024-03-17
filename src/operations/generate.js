import fs from "fs";
import { red, green, yellow } from "../lib/chalk.js";
import { getMeta } from "../lib/meta.js";

export default async function (dirname, name) {
    if (!name) {
        console.log(yellow("Please specify a name for the migration"));
        return;
    }

    if (!fs.readdirSync(`${dirname}/migrations`)) {
        console.log(red("Please run init first"));
        return;
    }

    const meta = getMeta();

    if (!meta) {
        console.log(red("meta.json not found"));
        return;
    }

    try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${name}.sql`;

        fs.writeFileSync(`${dirname}/migrations/${fileName}`, "");
        meta.migrations.pending.push(fileName);
        console.log(green(`Migration ${fileName} created`));
        fs.writeFileSync(`${dirname}/migrations/meta.json`, JSON.stringify(meta));
    } catch (error) {
        console.log(error);
    }
}
