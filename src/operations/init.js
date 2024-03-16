import fs from "fs";
import { green } from "../lib/chalk.js";

export default function (dirname) {
    if (!fs.existsSync(`${dirname}/migrations`)) {
        fs.mkdirSync(`${dirname}/migrations`);
        fs.writeFileSync(
            `${dirname}/migrations/meta.json`,
            JSON.stringify({
                migrations: {
                    finished: [],
                    pending: [],
                },
            })
        );
    } else {
        console.log(green("Migration folder already exists"));
    }
}
