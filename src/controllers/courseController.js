const Course = require('../models/Course');

/* ================= CREATE ================= */
exports.create = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET ALL ================= */
exports.getAll = async (req, res, next) => {
  try {
    const courses = await Course.getAll(req.query);

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET BY ID ================= */
exports.getById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE ================= */
exports.update = async (req, res, next) => {
  try {
    const updated = await Course.update(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or nothing to update',
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/* ================= DELETE ================= */
exports.delete = async (req, res, next) => {
  try {
    const deleted = await Course.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
//  getByCategorySlug
exports.getByCategorySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const courses = await Course.getByCategorySlug(slug);

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};
