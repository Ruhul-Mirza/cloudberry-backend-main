const Bootcamp = require("../models/bootcampModel");

/* ================= CREATE ================= */
exports.create = async (req, res, next) => {
  try {
    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // ✅ FIXED: use ID instead of name
    const exists = await Bootcamp.getByCategoryId(category_id);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Data already exists for this category",
      });
    }

    const data = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
exports.getBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const data = await Bootcamp.getByCategorySlug(slug);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
/* ================= GET ALL ================= */
exports.getAll = async (req, res, next) => {
  try {
    const data = await Bootcamp.getAll();

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET BY CATEGORY NAME ================= */
exports.getByCategory = async (req, res, next) => {
  try {
    const { category_name } = req.params;

    const data = await Bootcamp.getByCategoryName(category_name);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE ================= */
exports.update = async (req, res, next) => {
  try {
    const updated = await Bootcamp.update(req.params.id, req.body);

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE ================= */
exports.delete = async (req, res, next) => {
  try {
    const deleted = await Bootcamp.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
