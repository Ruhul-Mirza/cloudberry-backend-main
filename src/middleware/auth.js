const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  try {
    console.log("---- PROTECT HIT ----");

    const authHeader = req.headers.authorization;
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ NO TOKEN");
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN:", token);

    const decoded = jwt.verify(token, config.jwt.secret);
    console.log("DECODED:", decoded);

    const admin = await Admin.findById(decoded.id);
    console.log("ADMIN FROM DB:", admin);

    if (!admin) {
      console.log("❌ ADMIN NOT FOUND");
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.log("❌ ERROR:", error.message);
    return res.status(401).json({ message: "Token failed" });
  }
};