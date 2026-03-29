const { Pool } = require("pg");
const config = require("./config");

// Create pool using Supabase connection string
const pool = new Pool(config.database);

// MySQL compatible wrapper
const query = async (sql, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);

    // MySQL style return
    // return [result.rows, result];
    return result.rows;
  } finally {
    client.release();
  }
};

// Test connection (same as before)
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Supabase PostgreSQL connected successfully");
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

module.exports = { pool, testConnection };
