// lib/db.js or util/db.js
const { Pool } = require("pg");

const globalForPool = global;

if (!globalForPool.pgPool) {
  globalForPool.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

module.exports = globalForPool.pgPool;
