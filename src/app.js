// ============================================
// src/app.js - Main Application File
// ============================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const config = require("./config/config");
const { testConnection } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const courseRoutes = require("./routes/courseRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const contactRoutes = require("./routes/contactRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const bootcampRoutes = require("./routes/bootcampRoutes");
// Initialize express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(
  cors({
    origin: true, // allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

// Preflight (important)
app.options("*", cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.env === "development") {
  app.use(morgan("dev"));
}

// Static files (for uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/bootcamps", bootcampRoutes);
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = config.port;

const startServer = async () => {
  try {
    let dbConnected = true;

    if (process.env.NODE_ENV !== "production") {
      dbConnected = await testConnection();

      if (!dbConnected) {
        console.error("Failed to connect to database. Exiting...");
        process.exit(1);
      }
    }

    // Start server
    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log("");
        console.log("===========================================");
        console.log(`🚀 Server running in ${config.env} mode`);
        console.log(`📡 Port: ${PORT}`);
        console.log(`🌐 URL: http://localhost:${PORT}`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
        console.log("===========================================");
        console.log("");
        console.log("Available Routes:");
        console.log("  GET  /health");
        console.log("  POST /api/admin/register");
        console.log("  POST /api/admin/login");
        console.log("  GET  /api/admin/me");
        console.log("");
        console.log("  GET  /api/categories");
        console.log("  POST /api/categories");
        console.log("");
        console.log("  GET  /api/courses");
        console.log("  POST /api/courses");
        console.log("");
        console.log("  GET  /api/reviews");
        console.log("  POST /api/reviews");
        console.log("");
        console.log("  POST /api/contact");
        console.log("  GET  /api/contact");
        console.log("");
        console.log("  POST /api/certificates");
        console.log("  GET  /api/certificates/verify/:url");
        console.log("===========================================");
      });
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
