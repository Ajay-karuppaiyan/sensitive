const Employee = require("../models/employeeSchema");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  console.log("🔥 EMPLOYEE LOGIN API HIT 🔥");

  try {
    console.log("Welcome to employee login");

    const { email, password } = req.body;

    // 🔍 Find employee from SAME collection you updated
    const employee = await Employee.findOne({ email });

    // ❌ Employee not found
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // 🔴 BLOCK INACTIVE EMPLOYEE (THIS WAS MISSING)
    if (employee.status === "Inactive") {
      return res.status(403).json({
        error: "Your account is inactive. Please contact admin."
      });
    }

    // ❌ Password mismatch (NO bcrypt)
    if (password !== employee.password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: employee._id, role: employee.role, status: employee.status },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: employee._id,
        name: employee.name,
        role: employee.role,
        status: employee.status
      }
    });

  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login };
