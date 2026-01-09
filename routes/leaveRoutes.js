const express = require('express');
const {
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequestById,
  deleteLeaveRequestById,
  updateLeaveRequestStatus,
  getTotalLeaveRequests,
  getLeaveRequestsByEmployeeId,
  getLeaveRequestsByEmployeeCurrentMonth,
  getTodayLeaves
} = require('../controllers/leaveControllers');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/create',  upload.single("attachment"),  createLeaveRequest);
router.get('/get-all/:id', getAllLeaveRequests);
router.get('/get/:id', getLeaveRequestById);
router.put('/update/:id',  upload.single("attachment"), updateLeaveRequestById);
router.delete('/delete/:id', deleteLeaveRequestById);
router.put('/update-status/:id', updateLeaveRequestStatus); 
router.get('/totalleaverequests', getTotalLeaveRequests);
router.get('/employee/:empId', getLeaveRequestsByEmployeeId);
router.get('/today', getTodayLeaves);
router.get('/employee/current-month/:empId', getLeaveRequestsByEmployeeCurrentMonth);

module.exports = router;
