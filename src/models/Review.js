const { pool } = require("../config/database");

class Review {
  // ================= CREATE =================
static async getAll(filters = {}) {
  let query = `SELECT * FROM reviews WHERE 1=1`;
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    query += ` AND status = $${values.length}`;
  }

  if (filters.is_published !== undefined) {
    values.push(filters.is_published);
    query += ` AND is_published = $${values.length}`;
  }

  // 🔥 ADD THIS
  if (filters.category_id) {
    values.push(filters.category_id);
    query += ` AND category_id = $${values.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
}

static async create(data) {
  const {
    student_name,
    rating,
    message,
    youtube_embed = null,
    category_id = null,
    status = "pending",     
    is_published = false,   
  } = data;

  const query = `
    INSERT INTO reviews 
    (student_name, rating, message, youtube_embed, category_id, status, is_published)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const result = await pool.query(query, [
    student_name,
    rating,
    message,
    youtube_embed,
    category_id,
    status,
    is_published,
  ]);

  return result.rows[0];
}

static async update(id, data) {
  const fields = [];
  const values = [];

  const allowedFields = [
    "student_name",
    "rating",
    "message",
    "youtube_embed",
    "status",
    "is_published",
    "category_id", // ✅ ADD THIS
  ];

  Object.entries(data).forEach(([key, value]) => {
    if (allowedFields.includes(key) && value !== undefined) {
      values.push(value);
      fields.push(`${key} = $${values.length}`);
    }
  });

  if (!fields.length) return 0;

  values.push(id);

  const query = `
    UPDATE reviews
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${values.length}
  `;

  await pool.query(query, values);
  return true;
}

static async delete(id) {
  await pool.query(`DELETE FROM reviews WHERE id = $1`, [id]);
  return true;
}
}

module.exports = Review;
