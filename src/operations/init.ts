import fs from "fs";
import { green } from "../lib/chalk";
import { dirname } from "..";

export default function () {
  if (!fs.existsSync(`${dirname}/migrations`)) fs.mkdirSync(`${dirname}/migrations`);
  else console.log(green("Migration folder already exists"));

  if (!fs.existsSync(`${dirname}/data-migrations`)) fs.mkdirSync(`${dirname}/data-migrations`);
  else console.log(green("Data Migration folder already exists"));
}
