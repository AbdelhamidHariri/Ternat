#!/usr/bin/env node

import { red, yellow } from "./lib/chalk.js";
import { NO_OPERATION_ERROR } from "./lib/cli-errors.js";
import generate from "./operations/generate.js";
import init from "./operations/init.js";
import migrate from "./operations/migrate.js";
import dotenv from "dotenv";
dotenv.config();

const operation = process.argv[2];
const dirname = process.env["PWD"];
const name = process.argv[3];

switch (operation) {
    case "init":
        init(dirname);
        break;
    case "generate":
        generate(dirname, name);
        break;
    case "migrate":
        migrate(dirname);
        break;
    case "reset":
    default:
        console.log(red(NO_OPERATION_ERROR.message));
        console.log(yellow(NO_OPERATION_ERROR.description));
}
