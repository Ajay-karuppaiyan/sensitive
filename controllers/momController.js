const Meeting = require('../models/momSchema');
const { uploadImage } = require("../config/cloudinary");
exports.createMeeting = async (req, res) => {
  try {
    const MeetingData = req.body;
    if (req.files) {
      if (req.files.agendaFile) {
        MeetingData.agendaFile = await uploadImage(req.files.agendaFile[0].buffer);
      }
      if (req.files.discussionFile) {
        MeetingData.discussionFile = await uploadImage(req.files.discussionFile[0].buffer);
      }
      if (req.files.actionFile) {
        MeetingData.actionFile = await uploadImage(req.files.actionFile[0].buffer);
      }
    }
    const newMeeting = new Meeting(MeetingData);
    await newMeeting.save();
    res.status(201).json({ message: "Meeting created successfully", meeting: newMeeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find();
    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meetings', error: err });
  }
};
exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.status(200).json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meeting', error: err });
  }
};
exports.updateMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (req.files) {
      if (req.files.agendaFile) {
        updatedData.agendaFile = await uploadImage(req.files.agendaFile[0].buffer);
      }
      if (req.files.discussionFile) {
        updatedData.discussionFile = await uploadImage(req.files.discussionFile[0].buffer);
      }
      if (req.files.actionFile) {
        updatedData.actionFile = await uploadImage(req.files.actionFile[0].buffer);
      }
    }
    const updatedMeeting = await Meeting.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.status(200).json(updatedMeeting);
  } catch (err) {
    res.status(500).json({ message: 'Error updating meeting', error: err });
  }
};
exports.deleteMeetingById = async (req, res) => {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!deletedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting meeting', error: err });
  }
};
