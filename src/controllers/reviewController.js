const Review = require("../models/Review");

// @desc    Create review (Public)
// @route   POST /api/reviews
// @access  Public
exports.create = async (req, res, next) => {
  try {
    const {
      student_name,
      rating,
      message,
      youtube_embed,
      category_id,
      status,
      is_published,
    } = req.body;

    const review = await Review.create({
      student_name,
      rating,
      message,
      youtube_embed,
      category_id,
      status,          
      is_published,    
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public (only published) / Private (all)
exports.getAll = async (req, res, next) => {
  try {
    const { status, is_published, category_id } = req.query;

    const filters = {};

    // Public users
    if (
      !(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      )
    ) {
      filters.is_published = true;
      filters.status = "approved";
    } else {
      if (status) filters.status = status;
      if (is_published !== undefined) {
        filters.is_published =
          is_published === "true" || is_published === true;
      }
    }

    // 🔥 ADD THIS (IMPORTANT)
    if (category_id) {
      filters.category_id = category_id;
    }

    const reviews = await Review.getAll(filters);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Private
exports.getById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review (Admin only - add youtube link, approve/reject)
// @route   PUT /api/reviews/:id
// @access  Private
exports.update = async (req, res, next) => {
  try {
    const updated = await Review.update(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.delete = async (req, res, next) => {
  try {
    const deleted = await Review.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
