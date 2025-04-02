import { Client } from "pg";

interface ConfigI {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export const client = (config: ConfigI) =>
  new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });
