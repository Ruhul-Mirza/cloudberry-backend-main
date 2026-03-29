const { pool } = require("../config/database");

class ContactForm {
  static async create({ name, email, message }) {
    const query = `
      INSERT INTO contact_forms (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    const values = [name, email, message];

    const result = await pool.query(query, values);
    return result.rows[0]?.id;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM contact_forms WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async getAll({ status }) {
    let query = `SELECT * FROM contact_forms WHERE 1=1`;
    const values = [];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE contact_forms SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await pool.query(
      `DELETE FROM contact_forms WHERE id = $1`,
      [id]
    );
    return result.rowCount;
  }
}

module.exports = ContactForm;
