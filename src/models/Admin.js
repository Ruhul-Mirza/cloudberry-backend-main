const { pool } = require('../config/database');

class Admin {
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email FROM admins WHERE id = $1',
      [id] // ✅ important
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }
}

module.exports = Admin;