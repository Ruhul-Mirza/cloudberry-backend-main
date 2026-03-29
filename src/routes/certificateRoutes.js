const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Validation rules
const certificateValidation = [
  body('student_name').trim().notEmpty().withMessage('Student name is required'),
  body('course_id').isInt().withMessage('Valid course ID is required'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required')
];

// Routes
router.post('/', protect, certificateValidation, validate, certificateController.create);
router.get('/', protect, certificateController.getAll);
router.get('/verify/:url', certificateController.verify);
router.delete('/:id', protect, certificateController.delete);
router.get('/preview/:url', certificateController.previewPDF);


module.exports = router;