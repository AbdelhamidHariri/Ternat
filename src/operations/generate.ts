import fs from "fs";
import { red, green, yellow } from "../lib/chalk";
import { dirname } from "..";

interface Generate {
  name: string;
  transformation?: boolean;
}

export default async function ({ name, transformation = false }: Generate) {
  if (!fs.existsSync(`${dirname}/migrations`)) {
    console.log(red("Please run init command first"));
    return;
  }

  if (!fs.existsSync(`${dirname}/transformations`)) {
    console.log(red("Please run init command first"));
    return;
  }

  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${name.replace(" ", "_")}.sql`;

    if (!transformation) {
      fs.writeFileSync(`${dirname}/migrations/${fileName}`, "-- Please add you migration here");
      console.log(green(`Migration ${fileName} created`));
    } else {
      fs.writeFileSync(`${dirname}/transformations/${fileName}`, "-- Please add you transformation here");
      console.log(green(`Transformation ${fileName} created`));
    }
  } catch (error) {
    console.log(red(error));
  }
}
