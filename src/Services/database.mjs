// import { config } from "dotenv";
// import * as dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
import * as key from "dotenv";
// dotenv.config();
// config();
key.config();
// console.log(process.env.DBPORT);

export const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.DBPORT,
  database: process.env.DATABASE,
});

// import pkg from 'pg';
// const { Pool } = pkg;
