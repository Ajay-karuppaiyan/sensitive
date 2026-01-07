const Employee = require("../models/employeeSchema");
const Superadmin = require("../models/superadminModel");
const jwt = require("jsonwebtoken");

const employeeLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Find employee by email and password
    const empData = await Employee.findOne({ email: username, password: password });

    // ❌ Employee not found OR inactive
    if (!empData) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (empData.status.trim().toLowerCase() !== "active") {
      return res.status(403).json({ message: "Your account is inactive. Contact admin." });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: empData._id, role: empData.role, status: empData.status },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Employee login successful",
      token,
      employee: {
        id: empData._id,
        name: empData.name,
        email: empData.email,
        role: empData.role,
        status: empData.status
      }
    });

  } catch (err) {
    console.error("Error in employee login:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const superadminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const superadminData = await Superadmin.findOne({ officeEmail: username, password });

    if (!superadminData) {
      return res.status(401).json({ message: "Invalid username or password or not a superadmin" });
    }

    const token = jwt.sign(
      { id: superadminData._id, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Superadmin login successful",
      token,
      superadmin: superadminData
    });

  } catch (err) {
    console.error("Error in superadmin login:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  employeeLogin,
  superadminLogin
};
