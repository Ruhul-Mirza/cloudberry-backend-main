const PDFDocument = require("pdfkit");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

function safeImage(doc, imgPath, x, y, options = {}) {
  try {
    const resolvedPath = path.resolve(imgPath);
    if (fs.existsSync(resolvedPath)) {
      doc.image(resolvedPath, x, y, options);
    }
  } catch (e) {
    console.warn("Image skipped:", imgPath);
  }
}

exports.generateCertificatePDFBuffer = async ({
  student_name,
  course_title,
  start_date,
  end_date,
  certificate_id,
  description_line1,
  description_line2,
  qrBuffer,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const CERT_ID =
        certificate_id ||
        "CB-" + crypto.randomBytes(6).toString("hex").toUpperCase();

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const W = doc.page.width;
      const H = doc.page.height;

      /* ================= BACKGROUND ================= */
      doc.rect(0, 0, W, H).fill("#FFFFFF");

      /* ================= LEFT DESIGN ================= */
      doc
        .moveTo(0, 0)
        .lineTo(260, 0)
        .lineTo(160, H)
        .lineTo(0, H)
        .closePath()
        .fill("#000000");

      doc
        .moveTo(260, 0)
        .lineTo(310, 0)
        .lineTo(210, H)
        .lineTo(160, H)
        .closePath()
        .fill("#1F6FD6");

      doc
        .moveTo(310, 0)
        .lineTo(360, 0)
        .lineTo(260, H)
        .lineTo(210, H)
        .closePath()
        .fill("#F2F2F2");

      /* ================= LOGO ================= */
      safeImage(
        doc,
        path.join(__dirname, "../assets/main_logo.png"),
        60,
        40,
        { width: 80 }
      );

      /* ================= LOGO TEXT ================= */
      doc
        .font(path.join(__dirname, "../fonts/LibreBaskerville-Regular.ttf"))
        .fontSize(18)
        .fillColor("#ffffff")
        .text("CloudBerry", 30, 110, { width: 140, align: "center" });

      /* ================= TITLE ================= */
      doc
        .font(path.join(__dirname, "../fonts/Montserrat-SemiBold.ttf"))
        .fontSize(40)
        .fillColor("#000")
        .text("CERTIFICATE", 360, 80);

      doc.fontSize(22).fillColor("#444").text("OF COMPLETION", 360, 130);

      /* ================= SUBTEXT ================= */
      doc
        .font("Helvetica")
        .fontSize(14)
        .fillColor("#555")
        .text("We proudly present this certificate to", 360, 190);

      /* ================= NAME ================= */
      doc
        .font(path.join(__dirname, "../fonts/GreatVibes-Regular.ttf"))
        .fontSize(44)
        .fillColor("#000")
        .text(student_name, 360, 230);

      doc.moveTo(360, 280).lineTo(820, 280).stroke("#444");

      /* ================= DESCRIPTION ================= */
      doc.font("Helvetica").fontSize(14).fillColor("#333");

      doc.text(description_line1 || "In recognition of successfully completing the ", 360, 310, {
        continued: true,
      });

      doc.font("Helvetica-Bold").text(` “${course_title}” `, {
        continued: true,
      });

      doc.font("Helvetica").text(
        description_line2 ,
        { width: 540 }
      );

      /* ================= META ================= */
      doc.fontSize(12).fillColor("#555");
      doc.text(`Duration: ${start_date} to ${end_date}`, 360, 370);
      doc.fontSize(10).fillColor("#777");
      doc.text(`Certificate ID: ${CERT_ID}`, 360, 400);

      /* ================= QR ================= */
      if (qrBuffer && Buffer.isBuffer(qrBuffer)) {
        doc.image(qrBuffer, 60, H - 170, { width: 80 });
      }

      /* ================= SIGNATURE ================= */
      const SIGN_X = W - 140;
      const SIGN_Y = H - 150;

      safeImage(
        doc,
        path.join(__dirname, "../assets/signature.png"),
        SIGN_X,
        SIGN_Y,
        { width: 80 }
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Shadab Siddiqui", SIGN_X - 60, SIGN_Y + 50, {
          width: 200,
          align: "center",
        });

      doc.fontSize(10).text("Co-Founder", SIGN_X - 60, SIGN_Y + 65, {
        width: 200,
        align: "center",
      });

      /* ================= BADGE (FINAL FIX) ================= */
      const badgePath = path.resolve(__dirname, "../assets/badge.png");

      if (fs.existsSync(badgePath)) {
        const badgeBuffer = fs.readFileSync(badgePath);

        doc.image(badgeBuffer, 340, H - 170, {
          width: 90,
          height: 90,
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
