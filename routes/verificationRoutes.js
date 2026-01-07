const express = require('express');
const router = express.Router(); 
const verificationControllers = require("../controllers/verificationControllers");

// Employee login
router.post('/login', verificationControllers.employeeLogin);

// Superadmin login
router.post('/adminlogin', verificationControllers.superadminLogin);

module.exports = router;
