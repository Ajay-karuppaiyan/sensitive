const express = require('express');
const {
  createAttendance,
  getAllAttendance,
  logoutAttendance,
  getTotalAttendance,
  getTodayPresentCount,
  getMonthlyAttendanceForEmployee
} = require('../controllers/attendancecontrollers');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Create attendance (login)
router.post('/create', createAttendance);

// Get all attendance 
router.get('/attendance-all/:id', getAllAttendance);

// Logout attendance
router.put('/logout/:id', upload.single("attachment"), logoutAttendance);

// Get total attendance count
router.get('/totalattendance', getTotalAttendance);

// Get total present today
router.get('/present-today', getTodayPresentCount);

// **Get monthly attendance for an employee**
router.get("/employee/monthly-attendance/:empId", getMonthlyAttendanceForEmployee);

module.exports = router;
