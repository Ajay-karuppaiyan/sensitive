const express = require('express');
const router = express.Router();
const otpController = require('../controllers/emailotpController');

// OTP Login Flow
router.post('/send-otp', otpController.sendOTP); // Step 1: Send OTP to email
router.post('/verify-otp', otpController.verifyOTP); // Step 2: Verify OTP

module.exports = router;