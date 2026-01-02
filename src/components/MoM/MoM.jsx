import React, { useState } from 'react';
import { Paperclip, Calendar, Clock, Users } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createMoM } from '../../api/services/projectServices';
import { useNavigate } from "react-router-dom";

const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  [{ 'font': [] }],
  ['bold', 'italic', 'underline'],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ['clean']
];

const MoM = () => {
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
  const navigate = useNavigate();

  const handleChange = (value, field) => {
    setMeetingDetails({ ...meetingDetails, [field]: value });
  };

  const handleFileChange = (e, field) => {
    setMeetingDetails({ ...meetingDetails, [field]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in meetingDetails) {
      if (key !== 'agendaFile' && key !== 'discussionFile' && key !== 'actionFile') {
        formData.append(key, meetingDetails[key]);
      }
    }
    if (meetingDetails.agendaFile) formData.append('agendaFile', meetingDetails.agendaFile);
    if (meetingDetails.discussionFile) formData.append('discussionFile', meetingDetails.discussionFile);
    if (meetingDetails.actionFile) formData.append('actionFile', meetingDetails.actionFile);
  
    try {
      const response = await createMoM(formData);
      console.log('Meeting saved:', response.data);
      alert('Meeting saved successfully!');
      navigate("/momdetails");
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting.');
    }
  };
  

  return (
    <div className="mt-28 mb-12 container mx-auto">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Minutes of Meeting</h1>
            <input
              type="text"
              placeholder="Meeting Title"
              className="w-full text-xl p-2 border-b-2 border-blue-500 focus:outline-none"
              value={meetingDetails.title}
              onChange={(e) => handleChange(e.target.value, 'title')}
            />
          </div>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={meetingDetails.date}
                onChange={(e) => handleChange(e.target.value, 'date')}
              />
            </div>
             <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Location"
                value={meetingDetails.location}
                onChange={(e) => handleChange(e.target.value, 'location')}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="time"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={meetingDetails.startTime}
                onChange={(e) => handleChange(e.target.value, 'startTime')}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="time"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={meetingDetails.endTime}
                onChange={(e) => handleChange(e.target.value, 'endTime')}
              />
            </div>
            <div className="relative col-span-2">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Attendees (separated by comma)"
                value={meetingDetails.attendees}
                onChange={(e) => handleChange(e.target.value, 'attendees')}
              />
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Agenda</h2>
            <textarea
              value={meetingDetails.agenda}
              onChange={(e) => handleChange(e.target.value, 'agenda')}
              className="w-full p-2 border-2 border-blue-500 rounded-md"
              placeholder="Enter meeting agenda points..."
            />
            <label className="flex items-center gap-2 mt-4">
              <Paperclip className="w-5 h-5 text-blue-500" />
              <input type="file" onChange={(e) => handleFileChange(e, 'agendaFile')} />
            </label>
          </div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Discussion Notes</h2>
            <ReactQuill
              value={meetingDetails.discussionNotes}
              onChange={(value) => handleChange(value, 'discussionNotes')}
              theme="snow"
              modules={{ toolbar: toolbarOptions }}
              placeholder="Enter meeting discussion points..."
              style={{ height: '300px', width: '100%' }} 
            />
          </div>
          <label className="flex items-center gap-2 mt-12">
              <Paperclip className="w-5 h-5 text-blue-500" />
              <input type="file" onChange={(e) => handleFileChange(e, 'discussionFile')} />
            </label>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Action Items</h2>
            <textarea
              value={meetingDetails.actionItems}
              onChange={(e) => handleChange(e.target.value, 'actionItems')}
              className="w-full p-2 border-2 border-blue-500 rounded-md"
              placeholder="Enter action items with assignees and deadlines..."
            />
           <label className="flex items-center gap-2 mt-4">
              <Paperclip className="w-5 h-5 text-blue-500" />
              <input type="file" onChange={(e) => handleFileChange(e, 'actionFile')} />
            </label> 
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save Minutes
            </button>
          </div>
        </form>
      </div>
    </div>
  
  );
};

export default MoM;