const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Validation rules
const reviewCreateValidation = [
  body('student_name').trim().notEmpty().withMessage('Student name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('message').trim().notEmpty().withMessage('Review message is required')
];

const reviewUpdateValidation = [
  body('youtube_embed').optional().trim(),
  body('is_published').optional().isBoolean().withMessage('is_published must be boolean'),
  body('status').optional().isIn(['approved', 'rejected', 'pending']).withMessage('Invalid status')
];

// Routes
router.post('/', reviewCreateValidation, validate, reviewController.create);
router.get('/', reviewController.getAll);
router.get('/:id', protect, reviewController.getById);
router.put('/:id', protect, reviewUpdateValidation, validate, reviewController.update);
router.delete('/:id', protect, reviewController.delete);

module.exports = router;