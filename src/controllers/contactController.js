const ContactForm = require('../models/ContactForm');
const emailService = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.create = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const contactId = await ContactForm.create({
      name,
      email,
      message
    });

    // Send email to user
    try {
      await emailService.sendContactConfirmation(email, name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon.',
      data: { id: contactId }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact forms
// @route   GET /api/contact
// @access  Private
exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = {};

    if (status) filters.status = status;

    const contacts = await ContactForm.getAll(filters);

    res.json({
      success: true,
      count: contacts?.[0]?.length ?? [],
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contact by ID
// @route   GET /api/contact/:id
// @access  Private
exports.getById = async (req, res, next) => {
  try {
    const contact = await ContactForm.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    // Mark as read
    await ContactForm.updateStatus(req.params.id, 'read');

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const updated = await ContactForm.updateStatus(req.params.id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private
exports.delete = async (req, res, next) => {
  try {
    const deleted = await ContactForm.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact form deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};