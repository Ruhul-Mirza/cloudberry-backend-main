const { pool } = require("../config/database");

class Bootcamp {
  /* ================= CREATE ================= */
  static async create(data) {
    const query = `
      INSERT INTO bootcamp_page_data
      (category_id, hero, tech_career, skills, projects, curriculum, career_support, success_stories, salary_outcomes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

    const values = [
      data.category_id,
      data.hero,
      data.techCareer,
      data.skills,
      data.projects,
      data.curriculum,
      data.careerSupport,
      data.successStories || {},
      data.salaryOutcomes,
    ];

    const result = await pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  /* ================= GET ALL ================= */
  static async getAll() {
    const result = await pool.query(`
      SELECT b.*, c.name AS category_name
      FROM bootcamp_page_data b
      JOIN categories c ON c.id = b.category_id
      ORDER BY b.id ASC
    `);

    return result.rows.map(this.mapRow);
  }

  /* ================= GET BY CATEGORY NAME ================= */
  static async getByCategoryName(name) {
    const result = await pool.query(
      `
      SELECT b.*, c.name AS category_name
      FROM bootcamp_page_data b
      JOIN categories c ON c.id = b.category_id
      WHERE LOWER(c.name) = LOWER($1)
      LIMIT 1
      `,
      [name],
    );

    if (!result.rows.length) return null;
    return this.mapRow(result.rows[0]);
  }

  /* ================= GET BY CATEGORY ID ================= */
  static async getByCategoryId(id) {
    const result = await pool.query(
      `SELECT * FROM bootcamp_page_data WHERE category_id = $1`,
      [id],
    );

    if (!result.rows.length) return null;
    return this.mapRow(result.rows[0]);
  }

  /* ================= UPDATE ================= */
  static async update(id, data) {
    const query = `
      UPDATE bootcamp_page_data SET
      hero=$1,
      tech_career=$2,
      skills=$3,
      projects=$4,
      curriculum=$5,
      career_support=$6,
      success_stories=$7,
      salary_outcomes=$8,
      updated_at = NOW()
      WHERE id=$9
      RETURNING *
    `;

    const values = [
      data.hero,
      data.techCareer,
      data.skills,
      data.projects,
      data.curriculum,
      data.careerSupport,
      data.successStories || {},
      data.salaryOutcomes,
      id,
    ];

    const result = await pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  static async getByCategorySlug(slug) {
    const result = await pool.query(
      `
    SELECT b.*, c.name AS category_name, c.slug AS category_slug
    FROM bootcamp_page_data b
    JOIN categories c ON c.id = b.category_id
    WHERE c.slug = $1
    LIMIT 1
    `,
      [slug],
    );

    if (!result.rows.length) return null;
    return this.mapRow(result.rows[0]);
  }
  /* ================= DELETE ================= */
  static async delete(id) {
    const result = await pool.query(
      `DELETE FROM bootcamp_page_data WHERE id=$1`,
      [id],
    );
    return result.rowCount;
  }

  /* ================= MAP DB → FRONTEND ================= */
  static mapRow(row) {
    if (!row) return null;

    return {
      id: row.id,
      category_id: row.category_id,
      category_name: row.category_name,

      hero: row.hero,
      techCareer: row.tech_career,
      skills: row.skills,
      projects: row.projects,
      curriculum: row.curriculum,
      careerSupport: row.career_support,
      successStories: row.success_stories,
      salaryOutcomes: row.salary_outcomes,

      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

module.exports = Bootcamp;
