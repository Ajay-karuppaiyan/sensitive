const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String,},
    date: { type: String,},
    content: { type: String,},
    endTime: { type: String,},
    location: { type: String,},
    attendees: { type: String,},
    agendaFile: { type: String,},
    discussionFile: { type: String,},
    actionFile: { type: String,},
    agenda: { type: String,},
    discussionNotes: { type: String,},
    actionItems: { type: String,}
  },
  { timestamps: true }
);

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
