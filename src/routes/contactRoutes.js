const rateLimit = require("express-rate-limit");
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const contactController = require("../controllers/contactController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

// Validation rules
const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

const statusValidation = [
  body("status")
    .isIn(["new", "read", "responded"])
    .withMessage("Invalid status"),
];
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
// Routes
router.post(
  "/",
  contactLimiter,
  contactValidation,
  validate,
  contactController.create,
);
router.get("/", protect, contactController.getAll);
router.get("/:id", protect, contactController.getById);
router.put(
  "/:id/status",
  protect,
  statusValidation,
  validate,
  contactController.updateStatus,
);
router.delete("/:id", protect, contactController.delete);

module.exports = router;
