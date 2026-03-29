const { pool } = require("../config/database");

class Certificate {
  static async create(data) {
    const {
      student_name,
      course_id,
      start_date,
      end_date,
      certificate_url,
      certificate_id,
      qr_code,
      pdf_path,
    } = data;

    const query = `
  INSERT INTO certificates
  (student_name, course_id, start_date, end_date, certificate_url, certificate_id, qr_code, pdf_path)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *
`;

    const values = [
      student_name,
      course_id,
      start_date,
      end_date,
      certificate_url,
      certificate_id,
      qr_code,
      pdf_path,
    ];

    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  static async getAll({ course_id, search }) {
    let query = `
    SELECT
      cert.*,
      course.title AS course_title
    FROM certificates cert
    LEFT JOIN courses course
      ON cert.course_id = course.id
    WHERE 1=1
  `;

    const values = [];

    if (course_id) {
      values.push(course_id);
      query += ` AND cert.course_id = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND cert.student_name ILIKE $${values.length}`;
    }

    query += ` ORDER BY cert.created_at DESC`;

    const result = await pool.query(query, values);

    // ✅ Return rows only (frontend friendly)
    return result.rows;
  }

  static async findByUrl(url) {
    const result = await pool.query(
      `SELECT * FROM certificates WHERE certificate_url = $1`,
      [url],
    );
    console.log(result, "redult here");
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(`DELETE FROM certificates WHERE id = $1`, [
      id,
    ]);
    return result.rowCount;
  }
}

module.exports = Certificate;
