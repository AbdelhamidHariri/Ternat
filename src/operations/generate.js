import fs from "fs";
import { error, green, warning } from "../lib/chalk.js";

export default function (dirname, name) {
    if (!name) {
        console.log(warning("Please specify a name for the migration"));
        return;
    }

    if (!fs.readdirSync(`${dirname}/migrations`)) {
        console.log(error("Please run init first"));
        return;
    }

    const timestamp = Date.now();
    try {
        const fileName = `${timestamp}_${name}.sql`;
        fs.writeFileSync(`${dirname}/migrations/${fileName}`, "");
        console.log(green(`Migration ${fileName} created`));
    } catch (error) {
        console.log(error);
    }
}
