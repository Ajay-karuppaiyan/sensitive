import React, { useState } from 'react';
import { Paperclip, Calendar, Clock, Users } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createMoM } from '../../api/services/projectServices';
import { useNavigate } from "react-router-dom";

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean']
];

const MoM = () => {
  const navigate = useNavigate();

  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
    agenda: '',
    discussionNotes: '',
    actionItems: '',
    agendaFile: null,
    discussionFile: null,
    actionFile: null
  });

  const handleChange = (value, field) => {
    setMeetingDetails({ ...meetingDetails, [field]: value });
  };

  const handleFileChange = (e, field) => {
    setMeetingDetails({ ...meetingDetails, [field]: e.target.files[0] });
  };

  // 🔒 VALIDATION LOGIC
  const validateMeetingTime = () => {
    const { date, startTime, endTime } = meetingDetails;

    if (!date || !startTime || !endTime) {
      alert("Please select meeting date, start time and end time");
      return false;
    }

    const now = new Date();
    now.setSeconds(0, 0);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // ❌ Past date
    if (selectedDate < todayDate) {
      alert("Meeting date cannot be in the past");
      return false;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    // ❌ Past time today
    if (selectedDate.getTime() === todayDate.getTime()) {
      if (startDateTime < now) {
        alert("Start time cannot be in the past");
        return false;
      }
    }

    // ❌ End time before or equal to start time
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMeetingTime()) return;

    const formData = new FormData();
    for (const key in meetingDetails) {
      if (!['agendaFile', 'discussionFile', 'actionFile'].includes(key)) {
        formData.append(key, meetingDetails[key]);
      }
    }

    if (meetingDetails.agendaFile) formData.append('agendaFile', meetingDetails.agendaFile);
    if (meetingDetails.discussionFile) formData.append('discussionFile', meetingDetails.discussionFile);
    if (meetingDetails.actionFile) formData.append('actionFile', meetingDetails.actionFile);

    try {
      await createMoM(formData);
      alert('Meeting saved successfully!');
      navigate("/momdetails");
    } catch (error) {
      console.error(error);
      alert('Failed to save meeting');
    }
  };

  return (
    <div className="mt-28 mb-12 container mx-auto">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-center mb-6">Minutes of Meeting</h1>

          <input
            type="text"
            placeholder="Meeting Title"
            className="w-full mb-6 p-2 border-b-2 border-blue-500"
            value={meetingDetails.title}
            onChange={(e) => handleChange(e.target.value, 'title')}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="p-2 border rounded"
              value={meetingDetails.date}
              onChange={(e) => handleChange(e.target.value, 'date')}
              required
            />

            <input
              type="text"
              placeholder="Location"
              className="p-2 border rounded"
              value={meetingDetails.location}
              onChange={(e) => handleChange(e.target.value, 'location')}
            />

            <input
              type="time"
              className="p-2 border rounded"
              value={meetingDetails.startTime}
              onChange={(e) => handleChange(e.target.value, 'startTime')}
              required
            />

            <input
              type="time"
              className="p-2 border rounded"
              value={meetingDetails.endTime}
              onChange={(e) => handleChange(e.target.value, 'endTime')}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Attendees (comma separated)"
            className="w-full p-2 border rounded mb-6"
            value={meetingDetails.attendees}
            onChange={(e) => handleChange(e.target.value, 'attendees')}
          />

          <textarea
            placeholder="Agenda"
            className="w-full p-2 border rounded mb-4"
            value={meetingDetails.agenda}
            onChange={(e) => handleChange(e.target.value, 'agenda')}
          />

          <input type="file" onChange={(e) => handleFileChange(e, 'agendaFile')} />

          <div className="my-6">
            <ReactQuill
              value={meetingDetails.discussionNotes}
              onChange={(value) => handleChange(value, 'discussionNotes')}
              modules={{ toolbar: toolbarOptions }}
              theme="snow"
              style={{ height: "250px" }}
            />
          </div>

          <input type="file" onChange={(e) => handleFileChange(e, 'discussionFile')} />

          <textarea
            placeholder="Action Items"
            className="w-full p-2 border rounded my-4"
            value={meetingDetails.actionItems}
            onChange={(e) => handleChange(e.target.value, 'actionItems')}
          />

          <input type="file" onChange={(e) => handleFileChange(e, 'actionFile')} />

          <div className="text-right mt-6">
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save Minutes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoM;
