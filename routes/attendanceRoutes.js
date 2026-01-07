const express = require('express');
const {
    createAttendance,
    getAllAttendance,
    logoutAttendance,
    getTotalAttendance,
} = require('../controllers/attendancecontrollers')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
router.post('/create',createAttendance);
router.get('/attendance-all/:id',getAllAttendance);
router.put('/logout/:id', upload.single("attachment"), logoutAttendance);
router.get('/totalattendance', getTotalAttendance);

module.exports = router;

