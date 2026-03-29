const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

// Send contact form confirmation
exports.sendContactConfirmation = async (email, name) => {
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Thank you for contacting us',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
        <p>Our team typically responds within 24-48 hours.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send certificate email
exports.sendCertificateEmail = async (email, name, certificateUrl, pdfPath) => {
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Your Course Certificate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations ${name}!</h2>
        <p>Your course certificate is ready.</p>
        <p>You can verify your certificate using this link:</p>
        <p><a href="${certificateUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Certificate</a></p>
        <p>Your certificate is also attached to this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    attachments: [
      {
        filename: 'certificate.pdf',
        path: pdfPath
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Certificate email sent to:', email);
  } catch (error) {
    console.error('Error sending certificate email:', error);
    throw error;
  }
};

module.exports = exports;