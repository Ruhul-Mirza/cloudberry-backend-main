const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const courseValidation = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category_id').optional().isInt().withMessage('Valid category ID required'),
  body('status').optional().isIn(['active', 'inactive']),
  body('old_price').optional(),
  body('new_price').optional(),
];

router.post('/', protect, courseValidation, validate, courseController.create);
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.put('/:id', protect, courseValidation, validate, courseController.update);
router.delete('/:id', protect, courseController.delete);
router.get("/category/slug/:slug", courseController.getByCategorySlug);

module.exports = router;
