// otpController.js
const employeeSchema = require("../models/employeeSchema");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Generate random 6-digit OTP securely
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Send OTP to email
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if employee exists
    const empData = await employeeSchema.findOne({ email });
    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const userName = empData.name || "User";

    // Generate OTP and expiry (5 minutes)
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    // Store OTP temporarily
    otpStore.set(email, { otp, expiry: otpExpiry });

    // Send email with full HTML template
    const mailOptions = {
      from: process.env.EMAIL_USER_CRM,
      to: email,
      subject: "Your Login Verification Code",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #4285F4 0%, #0066CC 100%); border-radius: 8px 8px 0 0;">
                  <img src="https://sensitive.live/assets/logo%20light-WoPEF47-.png" alt="Sensitive Technologies" style="max-width: 400px; width: 90%; height: auto; display: block; margin: 0 auto 30px auto;" />
                  <p style="margin: 0; color: #E6F2FF; font-size: 18px; font-weight: 500;">Verification Code</p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                    Hello ${userName},
                  </p>
                  <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.5;">
                    We received a request to log in to your account. Use the verification code below to complete your login:
                  </p>
                  
                  <!-- OTP Box -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 25px; background-color: #E6F2FF; border: 2px solid #0066CC; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: bold; color: #0066CC; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 20px; color: #0066CC; font-size: 14px; line-height: 1.5; font-weight: 600;">
                    ⏱ This code will expire in 5 minutes.
                  </p>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.5;">
                    If you didn't request this code, please ignore this email or contact our support team if you have concerns.
                  </p>
                  
                  <!-- Security Notice -->
                  <table role="presentation" style="width: 100%; margin-top: 30px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 15px; background-color: #F0F7FF; border-left: 4px solid #0066CC; border-radius: 4px;">
                        <p style="margin: 0; color: #0066CC; font-size: 13px; line-height: 1.5;">
                          <strong>🔒 Security Tip:</strong> Never share this code with anyone. Sensitive Technologies will never ask for your verification code.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #F9FAFB; border-radius: 0 0 8px 8px; text-align: center; border-top: 2px solid #E6F2FF;">
                  <p style="margin: 0 0 10px; color: #0066CC; font-size: 14px; font-weight: 600;">
                    Sensitive Technologies
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                    This is an automated message, please do not reply to this email.
                  </p>
                  <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} Sensitive Technologies. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `,
      text: `Hello ${userName}, Your OTP for login is: ${otp}. This OTP is valid for 5 minutes. If you didn't request this code, please ignore this email.`,
    };

    // await sendEmail(mailOptions);

    return res.status(200).json({
      message: "OTP sent successfully",
      email: email, // Optional: return the email for client-side reference
      otp,
    });
  } catch (err) {
    console.error("Error in sending OTP:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists for this email
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP is valid - get employee data
    const empData = await employeeSchema.findOne({ email });
    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Clear OTP from store after successful verification
    otpStore.delete(email);

    return res.status(200).json({
      message: "Employee login successful",
      employee: empData,
    });
  } catch (err) {
    console.error("Error in OTP verification:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};
