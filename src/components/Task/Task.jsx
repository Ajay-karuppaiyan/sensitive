import React, { useState, useMemo, useEffect } from 'react';
import {
    useTable,
    useGlobalFilter,
    useSortBy,
    usePagination
} from 'react-table';
import { Trash2, Eye } from 'lucide-react';
import { FaPlus, FaFileDownload, FaFilter } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
    const [searchTerm, setSearchTerm] = useState('');
    const id = localStorage.getItem("empId");
    const navigate = useNavigate();

    // Fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`https://sensitivetechcrm.onrender.com/task/getalltask/${id}`);
                let taskList = response.data.tasks || response.data;

                if (!Array.isArray(taskList)) throw new Error("Unexpected API response");

                const updatedTasks = taskList.map(task => {
                    if (task.date) {
                        const d = new Date(task.date);
                        task.date = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear().toString().slice(-2)}`;
                    }
                    if (task.createdAt) {
                        const c = new Date(task.createdAt);
                        let hours = c.getHours();
                        const minutes = c.getMinutes().toString().padStart(2,'0');
                        const seconds = c.getSeconds().toString().padStart(2,'0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12 || 12;
                        task.createDate = `${c.getDate().toString().padStart(2,'0')}/${(c.getMonth()+1).toString().padStart(2,'0')}/${c.getFullYear()}`;
                        task.createTime = `${hours}:${minutes}:${seconds} ${ampm}`;
                    }
                    return task;
                });

                setTasks(updatedTasks);
            } catch (err) {
                console.error(err);
                setError("Failed to load task data");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [id]);

    // Delete task
    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await axios.delete(`https://sensitivetechcrm.onrender.com/task/deletetask/${taskId}`);
                if (response.status === 200) setTasks(tasks.filter(task => task._id !== taskId));
            } catch {
                setError('Failed to delete task');
            }
        }
    };

    const handleView = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    // Export to Excel
    const exportToExcel = () => {
        const exportData = tasks.map((task, index) => ({
            'S.No': index + 1,
            'Task ID': task._id,
            'Task Name': task.task,
            'Project': task.project,
            'Employee': task.empId,
            'Description': task.description,
            'Timeline': task.timeline,
            'Date': task.date,
            'Status': task.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Task Records");
        XLSX.writeFile(workbook, `Task_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Date filter
    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        const filteredTasks = tasks.filter(task => {
            const [d, m, y] = task.date.split('/');
            const taskDate = new Date(`20${y}-${m}-${d}`);
            return taskDate >= start && taskDate <= end;
        });
        setTasks(filteredTasks);
    };

    // Filter tasks for search and role
    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
        return tasks
            .filter(task => role === "Superadmin" || task.status?.toLowerCase() === "pending")
            .filter(task => 
                task.task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.status?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [tasks, role, searchTerm]);

    // Columns definition
    const columns = useMemo(() => [
        {
            Header: 'S.No',
            accessor: (row, i) => i + 1,
            Cell: ({ value }) => <div className="text-center">{value}</div>
        },
        { Header: 'Task Name', accessor: 'task', Cell: ({ value }) => <div className="text-center">{value}</div> },
        { Header: 'Project', accessor: 'project', Cell: ({ value }) => <div className="text-center">{value}</div> },
        { Header: 'Employee', accessor: 'empId', Cell: ({ value }) => <div className="text-center">{value}</div> },
        { Header: 'Description', accessor: 'description', Cell: ({ value }) => <div className="text-center">{value}</div> },
        { Header: 'Timeline', accessor: 'timeline', Cell: ({ value }) => <div className="text-center">{value}</div> },
        { Header: 'Date', accessor: 'date', Cell: ({ value }) => <div className="text-center">{value}</div> },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => {
                const handleStatusChange = async (e) => {
                    const updatedStatus = e.target.value;
                    try {
                        await axios.put(`https://sensitivetechcrm.onrender.com/task/update-status/${row.original._id}`, { status: updatedStatus });
                        row.original.status = updatedStatus;
                        setTasks([...tasks]);
                    } catch {
                        alert("Failed to update status");
                    }
                };
                const getStatusStyle = (status) => {
                    switch (status) {
                        case 'Completed': return 'bg-green-500 text-white';
                        case 'In Progress': return 'bg-yellow-500 text-white';
                        case 'Pending':
                        default: return 'bg-red-500 text-white';
                    }
                };
                return (
                    <div className="flex justify-center">
                        <select
                            value={row.original.status || "Pending"}
                            onChange={handleStatusChange}
                            className={`border p-2 rounded w-32 text-center ${getStatusStyle(row.original.status)}`}
                        >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                        </select>
                    </div>
                );
            }
        },
        {
            Header: 'Attachment',
            accessor: 'attachments',
            Cell: ({ value }) => (
                <div className="flex justify-center">
                    {value ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            View Attachment
                        </a>
                    ) : (
                        <span className="text-gray-500">No Attachment</span>
                    )}
                </div>
            )
        },
        {
            Header: 'Created Date & Time',
            accessor: 'createDate',
            id: 'created_date_time',
            Cell: ({ row }) => (
                <div className="flex flex-col items-center text-center">
                    {row.original.createDate && row.original.createTime ? (
                        <>
                            <span>{row.original.createDate}</span>
                            <span>{row.original.createTime}</span>
                        </>
                    ) : <span className="text-gray-500">N/A</span>}
                </div>
            )
        },
        {
            Header: 'Actions',
            accessor: '_id',
            Cell: ({ row }) => (
                <div className="flex justify-center space-x-2">
                    <button
                        className="text-blue-500 hover:bg-blue-100 p-2 rounded-full transition-colors"
                        title="View Task"
                        onClick={() => handleView(row.original)}
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        className={`text-green-500 p-2 rounded-full transition-colors ${role !== "Superadmin" ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'}`}
                        title="Delete Task"
                        onClick={() => handleDelete(row.original._id)}
                        disabled={role !== "Superadmin"}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )
        }
    ], [tasks, role]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        state,
        setGlobalFilter,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageOptions
    } = useTable({ columns, data: filteredTasks, initialState: { pageSize: 10 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const { globalFilter, pageIndex } = state;

    if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    return (
        <div className="mx-auto p-4">
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">Task Details</h2>

            <div className="flex justify-between items-center mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={globalFilter || ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search records..."
                        className="border border-blue-500 p-2 rounded w-64 pl-8"
                    />
                    <FaFilter className="absolute left-2 top-3 text-blue-500" />
                </div>

                {role === "Superadmin" && (
                    <div className="flex space-x-4 items-center -mt-6">
                        <div>
                            <label className="block">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-blue-500 p-2 rounded w-32"/>
                        </div>
                        <div>
                            <label className="block">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-blue-500 p-2 rounded w-32"/>
                        </div>
                        <button onClick={applyDateFilter} className="bg-blue-500 text-white px-6 py-2 rounded h-10 mt-6 text-sm">Apply Filter</button>
                    </div>
                )}

                <div className="flex space-x-4">
                    {role === "Superadmin" && (
                        <button onClick={exportToExcel} className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600">
                            <FaFileDownload className="mr-2"/> Export Data
                        </button>
                    )}
                    <Link to="/task-form" className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600">
                        <FaPlus className="mr-2"/> Add Task
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                {tasks.length === 0 ? (
                    <p className="text-center p-4">No task records found.</p>
                ) : (
                    <>
                        <table {...getTableProps()} className="w-full">
                            <thead className="bg-[#2563eb] text-white border-b">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                className="p-4 cursor-pointer whitespace-nowrap text-center"
                                            >
                                                <div className="flex justify-center items-center space-x-1">
                                                    <span>{column.render('Header')}</span>
                                                    {column.isSorted && <span>{column.isSortedDesc ? ' 🔽' : ' 🔼'}</span>}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {page.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()} className="border-b hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            {row.cells.map(cell => (
                                                <td {...cell.getCellProps()} className="p-4 text-center">
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center p-4">
                            <span>Page <strong>{pageIndex + 1} of {pageOptions.length}</strong></span>
                            <div className="space-x-2">
                                <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">Previous</button>
                                <button onClick={() => nextPage()} disabled={!canNextPage} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {isModalOpen && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                        <h2 className="text-xl font-bold mb-4">Task Details</h2>
                        <div className="mb-4"><strong>Task Name:</strong> {selectedTask.task}</div>
                        <div className="mb-4"><strong>Project:</strong> {selectedTask.project}</div>
                        <div className="mb-4"><strong>Employee:</strong> {selectedTask.empId}</div>
                        <div className="mb-4"><strong>Description:</strong> {selectedTask.description}</div>
                        <div className="mb-4"><strong>Timeline:</strong> {selectedTask.timeline}</div>
                        <div className="mb-4"><strong>Date:</strong> {selectedTask.date}</div>
                        <div className="mb-4"><strong>Status:</strong> {selectedTask.status}</div>
                        <div className="mb-4">
                            <strong>Attachment:</strong> {selectedTask.attachments ? (
                                <a href={selectedTask.attachments} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Attachment</a>
                            ) : <span>No Attachment</span>}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                className={`bg-blue-500 text-white px-4 py-2 rounded ${role !== "Superadmin" ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                                onClick={() => navigate(`/task-edit/${selectedTask._id}`)}
                                disabled={role !== "Superadmin"}
                            >
                                Edit
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;
