import fs from "fs";
import { green } from "../lib/chalk";

export default function (dirname: string) {
  if (!fs.existsSync(`${dirname}/migrations`)) {
    fs.mkdirSync(`${dirname}/migrations`);
  } else {
    console.log(green("Migration folder already exists"));
  }
}
