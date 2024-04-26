#!/usr/bin/env node
'use strict';

var chalk = require('chalk');
var fs = require('fs');
var pg = require('pg');
var dotenv = require('dotenv');

const red = chalk.red;
const yellow = chalk.yellow;
const green = chalk.green;

const OPERATIONS = ["init", "generate", "migrate", "status", "reset"];

const NO_OPERATION_ERROR = {
    message: `No operation Specified`,
    description: `Please specify one of the following operations\n\n${OPERATIONS.reduce((acc, operation) => (acc ? `${acc}${operation}\n` : `${operation}\n`), "")}`,
};

var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function generate (dirname, name) {
    return __awaiter$2(this, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.log(error);
        }
    });
}

function init (dirname) {
    if (!fs.existsSync(`${dirname}/migrations`)) {
        fs.mkdirSync(`${dirname}/migrations`);
    }
    else {
        console.log(green("Migration folder already exists"));
    }
}

const client = (config) => new pg.Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
});

const migrationTable = `
CREATE TABLE MIGRATIONS (
  name VARCHAR(255) NOT NULL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function migrate (dirname) {
    return __awaiter$1(this, void 0, void 0, function* () {
        if (!fs.existsSync(`${dirname}/ternat.config.cjs`)) {
            console.log(red("ternat.config.cjs is missing"));
            return;
        }
        const { default: config } = yield import(`${dirname}/ternat.config.cjs`);
        if (!config) {
            console.log(red("No config file found"));
            return;
        }
        const db = client(config);
        try {
            yield db.connect();
            const databaseNameResult = yield db.query(`SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${config.database}')`);
            if (databaseNameResult.rows.length === 0) {
                yield db.query(`CREATE DATABASE ${config.database}`);
            }
            const migrationTableCheck = yield db.query(`SELECT tablename FROM pg_catalog.pg_tables Where tablename = 'migrations'`);
            if (migrationTableCheck.rows.length === 0) {
                yield db.query(migrationTable);
            }
            const { rows: migrations } = yield db.query(`SELECT name FROM migrations`);
            const migrationFiles = fs.readdirSync(`${dirname}/migrations`);
            for (const migration of migrationFiles) {
                if (!migrations.some((m) => m.name === migration)) {
                    const content = fs.readFileSync(`${dirname}/migrations/${migration}`, "utf8");
                    if (!content) {
                        console.log(red(`Content of migration ${migration} is empty`));
                        break;
                    }
                    yield db.query(content);
                    yield db.query(`INSERT INTO migrations (name) VALUES ($1)`, [migration]);
                    console.log(green(`successfully migrated ${migration}`));
                }
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            yield db.end();
        }
    });
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function status (dirname) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(`${dirname}/ternat.config.cjs`)) {
            console.log(red("ternat.config.cjs is missing"));
            return;
        }
        const { default: config } = yield import(`${dirname}/ternat.config.cjs`);
        if (!config) {
            console.log(red("No config file found"));
            return;
        }
        if (!fs.existsSync(`${dirname}/migrations`)) {
            console.log(red("No migration folder found"));
            return;
        }
        const migrationFiles = fs.readdirSync(`${dirname}/migrations`);
        if (migrationFiles.length === 0) {
            console.log(yellow("No changes"));
            return;
        }
        const db = client(config);
        try {
            yield db.connect();
            const migrationTableCheck = yield db.query(`SELECT tablename FROM pg_catalog.pg_tables Where tablename = 'migrations'`);
            if (migrationTableCheck.rows.length === 0) {
                console.log("Pending migrations...");
                migrationFiles.forEach((migration) => console.log(yellow(migration)));
                return;
            }
            const { rows: migrations } = yield db.query(`SELECT name FROM migrations`);
            const pendingMigrations = [];
            migrationFiles.forEach((migration) => {
                if (!migrations.some((m) => m.name === migration)) {
                    pendingMigrations.push(migration);
                }
            });
            if (pendingMigrations.length === 0) {
                console.log("Migrations up to data");
                return;
            }
            console.log("Pending migrations:\n");
            pendingMigrations.forEach((migration) => console.log(yellow(migration)));
            console.log("\nRun migrate to migrate the changes to database");
        }
        catch (error) {
            console.log(error);
        }
        finally {
            yield db.end();
        }
    });
}

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
    case "status":
        status(dirname);
        break;
    default:
        console.log(red(NO_OPERATION_ERROR.message));
        console.log(yellow(NO_OPERATION_ERROR.description));
}
