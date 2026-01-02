import React, { useEffect, useState } from 'react';
import { deleteMoM, getMoM } from '../../api/services/projectServices';
import { Calendar, Clock, MapPin, Download, MoreVertical, Eye, Edit, Trash, FileText, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const BlogPage = () => {
    const [meetingData, setMeetingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");

    useEffect(() => {
        const fetchMeetingData = async () => {
            try {
                const response = await getMoM();
                console.log(response);
                setMeetingData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching meeting data:', err);
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchMeetingData();
    }, []);

    const handleExportData = () => {
        const exportData = meetingData.map(meeting => ({
            Title: meeting.title,
            Date: meeting.date,
            'Start Time': meeting.startTime,
            'End Time': meeting.endTime,
            Location: meeting.location,
            Agenda: meeting.agenda,
            'Discussion Notes': meeting.discussionNotes,
            'Action Items': meeting.actionItems
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Meeting Minutes');
        XLSX.writeFile(workbook, 'meeting-minutes.xlsx');
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
        const start = new Date(startDate.split('/').reverse().join('/'));
        const end = new Date(endDate.split('/').reverse().join('/'));

        const filteredMeetings = meetingData.filter((meeting) => {
            const meetingDateParts = meeting.date.split('/');
            const meetingDate = new Date(`20${meetingDateParts[2]}-${meetingDateParts[1]}-${meetingDateParts[0]}`);

            return meetingDate >= start && meetingDate <= end;
        });

        setMeetingData(filteredMeetings);
    };

    const handleAddMoM = () => {
        navigate('/mom');
        console.log('Add MoM button clicked');
    };

    const handleDelete = async (id) => {
        try {
            const isConfirmed = window.confirm('Are you sure you want to delete this meeting?');
            if (!isConfirmed) return;

            await deleteMoM(id);

            setMeetingData(prevData => prevData.filter(meeting => meeting._id !== id));
            console.log('Meeting deleted:', id);
        } catch (err) {
            console.error('Error deleting meeting:', err);
            alert('Failed to delete meeting. Please try again.');
        }
    };

    const navigate = useNavigate();

    const handleEdit = (meeting) => {
        navigate(`/mom-edit/${meeting._id}`);
        console.log('Edit meeting:', meeting);
    };

    const openModal = (meeting) => {
        setSelectedMeeting(meeting);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className=" mx-auto px-4 py-8 mt-28">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Meeting Minutes</h1>
                <div className="flex space-x-4 items-center -mt-6">
                   
                        <>
                            <div>
                                <label htmlFor="startDate" className="block">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                   
                                    className="border border-blue-500 p-2 rounded w-32"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                   
                                    className="border border-blue-500 p-2 rounded w-32"
                                />
                            </div>
                            <button
                                onClick={applyDateFilter}
                                className="bg-blue-500 text-white px-6 py-2 rounded h-10 w-auto text-sm mt-6"
                            >
                                Apply Filter
                            </button>
                        </>
                  
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleAddMoM}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <Plus size={16} />
                        Add MoM
                    </button>
                    {role === "Superadmin" && (
                        <button
                            onClick={handleExportData}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Download size={16} />
                            Export Data
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {meetingData.map((meeting, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">{meeting.title}</h2>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span><strong>Date:</strong> {meeting.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span><strong>Time:</strong> {meeting.startTime} - {meeting.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span><strong>Location:</strong> {meeting.location}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-gray-600 line-clamp-3"><strong>Attendees:</strong> {meeting.attendees}</p>
                            <p className="mt-4 text-gray-600 line-clamp-3"><strong>Discussion Notes:</strong> {meeting.discussionNotes}</p>
                            <p className="mt-4 text-gray-600 line-clamp-3"><strong>Agenda:</strong> {meeting.agenda}</p>
                            <p className="mt-4 text-gray-600 line-clamp-3"><strong>Action Items:</strong> {meeting.actionItems}</p>
                            {meeting.agendaFile && (
                                <div className="mt-2">
                                    <a href={meeting.agendaFile} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                        <strong>Agenda File</strong>
                                    </a>
                                </div>
                            )}
                            {meeting.discussionFile && (
                                <div className="mt-2">
                                    <a href={meeting.discussionFile} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                        <strong>Discussion File</strong>
                                    </a>
                                </div>
                            )}
                            {meeting.actionFile && (
                                <div className="mt-2">
                                    <a href={meeting.actionFile} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                        <strong>Action File</strong>
                                    </a>
                                </div>
                            )}


                        </div>

                        <div className="px-6 pb-6 flex justify-between items-center">
                            <button className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                                <FileText size={16} />
                                Agenda
                            </button>
                            <div className="relative group">
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <button
                                        onClick={() => openModal(meeting)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleEdit(meeting)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(meeting._id)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <Trash size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && selectedMeeting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">{selectedMeeting.title}</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Date and Time</h3>
                                    <p className="text-gray-600">{selectedMeeting.date}</p>
                                    <p className="text-gray-600">{selectedMeeting.startTime} - {selectedMeeting.endTime}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                                    <p className="text-gray-600">{selectedMeeting.location}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Agenda</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{selectedMeeting.agenda}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Discussion Notes</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{selectedMeeting.discussionNotes}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Action Items</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{selectedMeeting.actionItems}</p>
                                </div>
                                {selectedMeeting.agendaFile && (
                                    <div className="mt-2">
                                        <a href={selectedMeeting.agendaFile} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            Agenda File
                                        </a>
                                    </div>
                                )}
                                {selectedMeeting.discussionFile && (
                                    <div className="mt-2">
                                        <a href={selectedMeeting.discussionFile} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            Discussion File
                                        </a>
                                    </div>
                                )}
                                {selectedMeeting.actionFile && (
                                    <div className="mt-2">
                                        <a href={selectedMeeting.actionFile} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            Action File
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogPage;
