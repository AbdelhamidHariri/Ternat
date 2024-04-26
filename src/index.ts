#!/usr/bin/env node

import { red, yellow } from "./lib/chalk";
import { NO_OPERATION_ERROR } from "./lib/cli-errors";
import generate from "./operations/generate";
import init from "./operations/init";
import migrate from "./operations/migrate";
import dotenv from "dotenv";
import status from "./operations/status";
dotenv.config();

const operation = process.argv[2];
const dirname = process.env["PWD"];
const name = process.argv[3];

switch (operation) {
  case "init":
    init(dirname!);
    break;
  case "generate":
    generate(dirname!, name);
    break;
  case "migrate":
    migrate(dirname!);
    break;
  case "status":
    status(dirname!);
    break;
  default:
    console.log(red(NO_OPERATION_ERROR.message));
    console.log(yellow(NO_OPERATION_ERROR.description));
}
