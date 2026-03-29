const { pool } = require('../config/database');

class NewPrice {
  static async create(data) {
    const { course_id, old_price, new_price } = data;
    const [result] = await pool.query(
      'INSERT INTO new_prices (course_id, old_price, new_price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE old_price = ?, new_price = ?',
      [course_id, old_price, new_price, old_price, new_price]
    );
    return result.insertId || result.affectedRows;
  }

  static async findByCourseId(course_id) {
    const [rows] = await pool.query('SELECT * FROM new_prices WHERE course_id = ?', [course_id]);
    return rows[0];
  }

  static async update(course_id, data) {
    const { old_price, new_price } = data;
    const [result] = await pool.query(
      'UPDATE new_prices SET old_price = ?, new_price = ? WHERE course_id = ?',
      [old_price, new_price, course_id]
    );
    return result.affectedRows;
  }

  static async delete(course_id) {
    const [result] = await pool.query('DELETE FROM new_prices WHERE course_id = ?', [course_id]);
    return result.affectedRows;
  }
}

module.exports = NewPrice;