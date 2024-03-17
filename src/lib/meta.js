import fs from "fs";
import { red } from "./chalk.js";

const dirname = process.env["PWD"];
const metaPath = `${dirname}/migrations/meta.json`;

export function getMeta() {
    if (!fs.existsSync(metaPath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch (error) {
        console.log(error);
    }
}
