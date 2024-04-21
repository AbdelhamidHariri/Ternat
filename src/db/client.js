import pkg from "pg";

const { Client } = pkg;

export const client = (config) =>
    new Client({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
    });
