import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, Calendar, Clock, Users, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getMoMById, updateMoM } from '../../api/services/projectServices';

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

const MoMEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    agendaFile: '',
    discussionFile: '',
    actionFile: '',
  });

  const [existingFiles, setExistingFiles] = useState({
    agendaFile: null,
    discussionFile: null,
    actionFile: null
  });

  useEffect(() => {
    const fetchMoMData = async () => {
      if (!id) {
        setError('Invalid meeting ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getMoMById(id);
        console.log("response", response)

        if (response && response.data) {
          setMeetingDetails({
            title: response.data.title || '',
            date: response.data.date || '',
            startTime: response.data.startTime || '',
            endTime: response.data.endTime || '',
            location: response.data.location || '',
            attendees: response.data.attendees || '',
            agenda: response.data.agenda || '',
            discussionNotes: response.data.discussionNotes || '',
            actionItems: response.data.actionItems || '',
            agendaFile: '',
            discussionFile: '',
            actionFile: '',

          });
          setExistingFiles({
            agendaFile: response.data.agendaFile || null,
            discussionFile: response.data.discussionFile || null,
            actionFile: response.data.actionFile || null,
          });
        }
      } catch (error) {
        console.error('Error fetching meeting details:', error);
        setError('Failed to load meeting details');
      } finally {
        setLoading(false);
      }
    };

    fetchMoMData();
  }, [id]);

  const handleChange = (value, field) => {
    setMeetingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setMeetingDetails(prev => ({
        ...prev,
        [field]: file
      }));
      setExistingFiles(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };
  const handleRemoveExistingFile = (field) => {
    setExistingFiles(prev => ({
      ...prev,
      [field]: null
    }));
    setMeetingDetails(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(meetingDetails).forEach(key => {
        if (!key.includes('File')) {
          formData.append(key, meetingDetails[key]);
        }
      });
      if (meetingDetails.agendaFile instanceof File) {
        formData.append('agendaFile', meetingDetails.agendaFile);
      }
      if (meetingDetails.discussionFile instanceof File) {
        formData.append('discussionFile', meetingDetails.discussionFile);
      }
      if (meetingDetails.actionFile instanceof File) {
        formData.append('actionFile', meetingDetails.actionFile);
      }

      const response = await updateMoM(id, formData);
      if (response.status === 200) {
        alert('Meeting updated successfully!');
        navigate("/momdetails");
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('Failed to update meeting. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  const FileAttachment = ({ field, label }) => (
    <div className="mt-2">
      {existingFiles[field] ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Paperclip className="w-4 h-4" />
          <a
            href={existingFiles[field]}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500"
          >
            {existingFiles[field].split('/').pop()}
          </a>
          <button
            type="button"
            onClick={() => handleRemoveExistingFile(field)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 cursor-pointer">
          <Paperclip className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-600">{label}</span>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, field)}
            className="hidden"
          />
        </label>
      )}
    </div>
  );


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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Calendar className="absolute left-3 top-[2.1rem] h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={meetingDetails.date}
                onChange={(e) => handleChange(e.target.value, 'date')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Meeting Location"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={meetingDetails.location}
                onChange={(e) => handleChange(e.target.value, 'location')}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <Clock className="absolute left-3 top-[2.1rem] h-5 w-5 text-gray-400" />
              <input
                type="time"
                className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={meetingDetails.startTime}
                onChange={(e) => handleChange(e.target.value, 'startTime')}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <Clock className="absolute left-3 top-[2.1rem] h-5 w-5 text-gray-400" />
              <input
                type="time"
                className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={meetingDetails.endTime}
                onChange={(e) => handleChange(e.target.value, 'endTime')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendees
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-[0.6rem] h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter attendees (separated by comma)"
                className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={meetingDetails.attendees}
                onChange={(e) => handleChange(e.target.value, 'attendees')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agenda
            </label>
            <textarea
              rows="4"
              placeholder="Enter meeting agenda points..."
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={meetingDetails.agenda}
              onChange={(e) => handleChange(e.target.value, 'agenda')}
            />
            <label className="flex items-center gap-2 mt-4">
              <Paperclip className="w-5 h-5 text-blue-500" />
              <FileAttachment
                field="agendaFile"
                label="Attach agenda file"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discussion Notes
            </label>
            <ReactQuill
              value={meetingDetails.discussionNotes}
              onChange={(value) => handleChange(value, 'discussionNotes')}
              theme="snow"
              modules={{ toolbar: toolbarOptions }}
              className="bg-white"
              style={{ height: '200px' }}
            />
            <div className="h-12"></div>
          </div>
          <label className="flex items-center gap-2 mt-12">
            <Paperclip className="w-5 h-5 text-blue-500" />
            <FileAttachment
              field="discussionFile"
              label="Attach discussion file"
            />
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Items
            </label>
            <textarea
              rows="4"
              placeholder="Enter action items..."
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={meetingDetails.actionItems}
              onChange={(e) => handleChange(e.target.value, 'actionItems')}
            />
            <label className="flex items-center gap-2 mt-4">
              <Paperclip className="w-5 h-5 text-blue-500" />
              <FileAttachment
                field="actionFile"
                label="Attach action items file"
              />
            </label>
          </div>
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoMEdit;