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

    try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${name}.sql`;

        fs.writeFileSync(`${dirname}/migrations/${fileName}`, "");
        console.log(green(`Migration ${fileName} created`));
    } catch (error) {
        console.log(error);
    }
}
