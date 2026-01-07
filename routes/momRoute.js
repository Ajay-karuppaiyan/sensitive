const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/momController');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/mompage', upload.fields([
    { name: "agendaFile", maxCount: 1 },
    { name: "discussionFile", maxCount: 1 },
    { name: "actionFile", maxCount: 1 }
]), meetingController.createMeeting);
router.get('/getallmom', meetingController.getAllMeetings);
router.get('/getmombyid/:id', meetingController.getMeetingById);
router.put('/updatemom/:id', upload.fields([
    { name: "agendaFile", maxCount: 1 },
    { name: "discussionFile", maxCount: 1 },
    { name: "actionFile", maxCount: 1 }
]), meetingController.updateMeetingById);
router.delete('/deletemom/:id', meetingController.deleteMeetingById);

module.exports = router;
