#!/usr/bin/env node

import generate from "./operations/generate";
import init from "./operations/init";
import migrate from "./operations/migrate";
import dotenv from "dotenv";
import status from "./operations/status";
import { Command } from "commander";
dotenv.config();

export const dirname = process.env["PWD"];

const program = new Command();

program.name("ternat").description("Tool to manage a postgres db");

program.command("init").description("The initial setup for the tool").action(init);

program
  .command("generate")
  .description("Creates a SQL file to begin a migration")
  .requiredOption("-n, --name <name_of_file>")
  .action(generate);

program.command("migrate").description("Begins the process of migration").action(migrate);

program.command("status").description("Show list of migrations statuses").action(status);

program.parse();
