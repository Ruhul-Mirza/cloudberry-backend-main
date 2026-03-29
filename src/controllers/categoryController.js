const Category = require("../models/Category");

// @desc    Create category
// @route   POST /api/categories
// @access  Private
exports.create = async (req, res, next) => {
  try {
    const { name, status } = req.body;
    console.log(req.body,"Req hai")
    const categoryId = await Category.create({ name, status });
    
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { id: categoryId, name, status },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = {};

    if (status) filters.status = status;

    const categories = await Category.getAll(filters);

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.update = async (req, res, next) => {
  try {
    const { name, status } = req.body;

    const updated = await Category.update(req.params.id, { name, status });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.delete = async (req, res, next) => {
  try {
    const deleted = await Category.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
