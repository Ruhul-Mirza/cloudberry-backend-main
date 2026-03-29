const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const crypto = require("crypto");

const { generateQRCodeBuffer } = require("../utils/qrGenerator");
const { generateCertificatePDFBuffer } = require("../utils/pdfGenerator");
const { uploadPDFBuffer } = require("../utils/cloudinary");

// @desc Generate certificate
// @route POST /api/certificates
// @access Private
exports.create = async (req, res, next) => {
  try {
    const {
      student_name,
      course_id,
      start_date,
      end_date,
      description_line1,
      description_line2,
    } = req.body;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const certificate_url = crypto.randomBytes(16).toString("hex");
    const certificate_id =
      "CB-" + crypto.randomBytes(6).toString("hex").toUpperCase();

    // Generate QR
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${certificate_url}`;
    const qrBuffer = await generateQRCodeBuffer(verifyUrl);
    const qrUrl = await uploadPDFBuffer(qrBuffer, `qr_${certificate_url}`);
    // Generate PDF
    const pdfBuffer = await generateCertificatePDFBuffer({
      student_name,
      course_title: course.title,
      start_date,
      end_date,
      certificate_id,
      description_line1,
      description_line2,
      qrBuffer,
    });

    // Upload to Cloudinary
    const pdfUrl = await uploadPDFBuffer(pdfBuffer, certificate_url);

    // Save to DB
    const certificate = await Certificate.create({
      student_name,
      course_id,
      start_date,
      end_date,
      certificate_url,
      certificate_id,
      description_line1,
      description_line2,
      qr_code: qrUrl,
      pdf_path: pdfUrl,
    });

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: {
        id: certificate,
        verify_url: verifyUrl,
        pdf_url: pdfUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all certificates
// @route GET /api/certificates
// @access Private
exports.getAll = async (req, res, next) => {
  try {
    const certificates = await Certificate.getAll(req.query);

    res.json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify certificate
// @route GET /api/certificates/verify/:url
// @access Public
exports.verify = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByUrl(req.params.url);
    // ✅ correct check
    if (!certificate || !certificate.pdf_path) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or invalid",
      });
    }

    res.json({
      success: true,
      message: "Certificate is valid",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete certificate
// @route DELETE /api/certificates/:id
// @access Private
exports.delete = async (req, res, next) => {
  try {
    const deleted = await Certificate.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc Preview certificate PDF
// @route GET /api/certificates/preview/:url
// @access Public

exports.previewPDF = async (req, res, next) => {
  try {
    const result = await Certificate.findByUrl(req.params.url);
    // ✅ extract object safely
    const certificate = result;

    if (!certificate || !certificate.pdf_path) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    // ✅ THIS IS THE ONLY CORRECT CLOUDINARY PATH
    const pdfUrl = certificate.pdf_path;
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch PDF from Cloudinary");
    }

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="certificate.pdf"');

    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
};
