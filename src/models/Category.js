const { pool } = require("../config/database");
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces → -
    .replace(/[^\w-]+/g, "") // remove special chars
    .replace(/--+/g, "-");

class Category {
  /* ================= CREATE ================= */
  static async create(data) {
    const name = data.name?.trim();
    const status = (data.status || "active").toLowerCase();

    if (!name) {
      throw new Error("Category name is required");
    }

    const slug = slugify(name); // ✅ generate slug

    const result = await pool.query(
      `INSERT INTO categories (name, slug, status)
     VALUES ($1, $2, $3)
     RETURNING id, name, slug, status`,
      [name, slug, status],
    );
    console.log(result.rows[0], "Result hai");
    return result.rows[0];
  }

  // find by slug
  static async findBySlug(slug) {
    const result = await pool.query(
      `SELECT * FROM categories WHERE slug = $1 LIMIT 1`,
      [slug],
    );

    return result.rows[0] || null;
  }
  /* ================= FIND BY ID ================= */
  static async findById(id) {
    const rows = await pool.query(
      `SELECT * FROM categories WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  /* ================= GET ALL ================= */
  static async getAll(filters = {}) {
    let query = `SELECT * FROM categories WHERE 1=1 ORDER BY id ASC`;
    const params = [];

    const result = await pool.query(query, params);

    return result.rows; // ✅ important
  }

  /* ================= UPDATE ================= */
  static async update(id, data) {
    const allowedFields = ["name", "status"];
    const fields = [];
    const values = [];
    let idx = 1;

    allowedFields.forEach((key) => {
      if (data[key] !== undefined) {
        let value = data[key];
        if (key === "name") {
          value = value.trim();

          // update name
          fields.push(`${key} = $${idx++}`);
          values.push(value);

          // update slug automatically
          fields.push(`slug = $${idx++}`);
          values.push(slugify(value));

          return;
        }
        if (key === "status") value = value.toLowerCase();

        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    });

    if (!fields.length) return 0;

    values.push(id);

    const result = await pool.query(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = $${idx}`,
      values,
    );

    return result.rowCount; // rows affected
  }

  /* ================= SOFT DELETE ================= */
  static async delete(id) {
    const result = await pool.query(
      `DELETE FROM categories WHERE id = $1 RETURNING id`,
      [id],
    );

    return result.rowCount;
  }
}

module.exports = Category;
