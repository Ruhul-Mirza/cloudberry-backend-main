const { pool } = require("../config/database");

class Course {
  /* ================= CREATE ================= */
  static async create(data) {
    const {
      title,
      description,
      price,
      category_id,
      duration,
      feature_bullet_points,
      stripe_link,
      status = "active",
    } = data;

    if (!title || price === undefined) {
      throw new Error("Title and price are required");
    }

    const result = await pool.query(
      `
      INSERT INTO courses 
      (title, description, price, category_id, duration, feature_bullet_points, stripe_link, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        title,
        description ?? null,
        Number(price),
        category_id ?? null,
        duration ?? null,
        feature_bullet_points ?? null,
        stripe_link ?? null,
        status.toLowerCase(),
      ],
    );

    return result.rows[0];
  }

  /* ================= FIND BY ID ================= */
  static async findById(id) {
    const result = await pool.query(
      `
      SELECT 
        c.*,
        cat.name AS category_name
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1
      LIMIT 1
      `,
      [id],
    );

    return result.rows[0] || null;
  }

  /* ================= GET ALL ================= */
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        c.*,
        cat.name AS category_name
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE 1=1
    `;

    const params = [];
    let idx = 1;

    if (filters.status) {
      query += ` AND c.status = $${idx++}`;
      params.push(filters.status.toLowerCase());
    }

    if (filters.category_id) {
      query += ` AND c.category_id = $${idx++}`;
      params.push(filters.category_id);
    }

    if (filters.search) {
      query += ` AND (c.title ILIKE $${idx} OR c.description ILIKE $${idx})`;
      params.push(`%${filters.search}%`);
      idx++;
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await pool.query(query, params);

    return result.rows;
  }

  /* ================= UPDATE ================= */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }

    if (data.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(Number(data.price));
    }

    if (data.category_id !== undefined) {
      fields.push(`category_id = $${idx++}`);
      values.push(data.category_id);
    }

    if (data.duration !== undefined) {
      fields.push(`duration = $${idx++}`);
      values.push(data.duration);
    }

    if (data.feature_bullet_points !== undefined) {
      fields.push(`feature_bullet_points = $${idx++}`);
      values.push(data.feature_bullet_points);
    }

    if (data.stripe_link !== undefined) {
      fields.push(`stripe_link = $${idx++}`);
      values.push(data.stripe_link);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status.toLowerCase());
    }

    if (!fields.length) return 0;

    values.push(id);

    const result = await pool.query(
      `
      UPDATE courses
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      `,
      values,
    );

    return result.rowCount;
  }

  /* ================= DELETE ================= */
  static async delete(id) {
    const result = await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);

    return result.rowCount;
  }
  // category by slug
  static async getByCategorySlug(slug) {
    const result = await pool.query(
      `
    SELECT c.*, cat.name as category_name, cat.slug as category_slug
    FROM courses c
    JOIN categories cat ON c.category_id = cat.id
    WHERE cat.slug = $1
    `,
      [slug],
    );

    return result.rows;
  }
}

module.exports = Course;
