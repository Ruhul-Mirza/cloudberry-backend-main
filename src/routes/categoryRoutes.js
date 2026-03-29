const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Validation rules
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
];

// Routes
router.post('/', protect, categoryValidation, validate, categoryController.create);
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.put('/:id', protect, categoryValidation, validate, categoryController.update);

router.delete('/:id', protect, categoryController.delete);

module.exports = router;