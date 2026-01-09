import React, { useState, useMemo, useEffect } from 'react';
import {
    useTable,
    useGlobalFilter,
    useSortBy,
    usePagination
} from 'react-table';
import { Trash2, Eye } from 'lucide-react';
import { FaPlus, FaFileDownload, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    console.log("Fetching tasks for ID:", id);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`https://sensitivetechcrm.onrender.com/task/getalltask/${id}`);
                console.log("Full API Response:", response.data);

                let taskList = response.data.tasks || response.data;

                if (!Array.isArray(taskList)) {
                    throw new Error("Unexpected API response format");
                }

                const updatedTasks = taskList.map(task => {
                    if (task.date) {
                        const dateObj = new Date(task.date);
                        task.date = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear().toString().slice(-2)}`;
                    }

                    if (task.createdAt) {
                        const createdAtObj = new Date(task.createdAt);
                        let hours = createdAtObj.getHours();
                        const minutes = createdAtObj.getMinutes().toString().padStart(2, '0');
                        const seconds = createdAtObj.getSeconds().toString().padStart(2, '0');
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12 || 12;
                        task.createDate = `${createdAtObj.getDate().toString().padStart(2, '0')}/${(createdAtObj.getMonth() + 1).toString().padStart(2, '0')}/${createdAtObj.getFullYear()}`;
                        task.createTime = `${hours}:${minutes}:${seconds} ${ampm}`;
                    }

                    return task;
                });

                setTasks(updatedTasks);
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError("Failed to load task data");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [role, id]);



    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await axios.delete(`https://sensitivetechcrm.onrender.com/task/deletetask/${taskId}`);
                if (response.status === 200) {
                    setTasks(tasks.filter((task) => task._id !== taskId));
                }
            } catch (err) {
                setError('Failed to delete task');
            }
        }
    };

    const handleEdit = (taskId) => {
        navigate(`/task-edit/${taskId}`);
    };

    const handleView = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

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

    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return []; 
        return tasks.filter(task => {
            if (role === "Superadmin") return true;
            return task.status?.toLowerCase() === "pending";
        }).filter(task =>
            task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tasks, role, searchTerm]);


    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
        const start = new Date(startDate.split('/').reverse().join('/'));
        const end = new Date(endDate.split('/').reverse().join('/'));

        const filteredTasks = tasks.filter((task) => {
            const taskDateParts = task.date.split('/');
            const taskDate = new Date(`20${taskDateParts[2]}-${taskDateParts[1]}-${taskDateParts[0]}`);

            return taskDate >= start && taskDate <= end;
        });

        setTasks(filteredTasks);
    };

    const columns = useMemo(() => [
        {
            Header: 'S.No',
            accessor: (row, index) => index + 1,
        },
        {
            Header: 'Task Name',
            accessor: 'task',
        },
        {
            Header: 'Project',
            accessor: 'project',
        },
        {
            Header: 'Employee',
            accessor: 'empId',
        },
        {
            Header: 'Description',
            accessor: 'description',
        },
        {
            Header: 'Timeline',
            accessor: 'timeline',
        },
        {
            Header: 'Date',
            accessor: 'date',
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => {
                const handleStatusChange = async (e) => {
                    const updatedStatus = e.target.value;
                    try {
                        const taskId = row.original._id;
                        await axios.put(`https://sensitivetechcrm.onrender.com/task/update-status/${taskId}`, {
                            status: updatedStatus,
                        });
                        row.original.status = updatedStatus;
                        setTasks([...tasks]);
                    } catch (err) {
                        alert("Failed to update status");
                    }
                };

                const getStatusStyle = (status) => {
                    switch (status) {
                        case 'Completed':
                            return 'bg-green-500 text-white';
                        case 'In Progress':
                            return 'bg-yellow-500 text-white';
                        case 'Pending':
                        default:
                            return 'bg-red-500 text-white';
                    }
                };

                return (
                    <select
                        value={row.original.status || "Pending"} 
                        onChange={handleStatusChange}
                        className={`border p-2 rounded w-32 ${getStatusStyle(row.original.status)} `}
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                );
            },
        },
        {
            Header: 'Attachment', 
            accessor: 'attachments',
            Cell: ({ value }) => {
                if (value) {
                    return (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            View Attachment
                        </a>
                    );
                }
                return <span>No Attachment</span>;
            },
        },
        {
            Header: 'Created Date & Time',
            accessor: 'createDate', 
            Cell: ({ row }) =>
                row.original.createDate && row.original.createTime ? (
                    <>
                        {row.original.createDate}
                        <br />
                        {row.original.createTime}
                    </>
                ) : (
                    'N/A'
                ),
            id: 'created_date_time',
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
    ], [tasks]);

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
        pageOptions,
    } = useTable(
        {
            columns,
            data: filteredTasks,
            initialState: { pageSize: 10 }
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const { globalFilter, pageIndex } = state;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="mx-auto p-4">
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">Task Details</h2>

            <div className="flex justify-between items-center mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={globalFilter || ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search records..."
                        className="border border-blue-500 p-2 rounded w-64 pl-8"
                    />
                    <FaFilter className="absolute left-2 top-3 text-blue-500" />
                </div>
                <div className="flex space-x-4 items-center -mt-6">
                    {role === "Superadmin" && (
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
                    )}
                </div>


                <div className="flex space-x-4">
                    {role === "Superadmin" && (
                        <button
                            onClick={exportToExcel}
                            className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600"
                        >
                            <FaFileDownload className="mr-2" />
                            Export Data
                        </button>
                    )}

                    <Link
                        to="/task-form"
                        className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
                    >
                        <FaPlus className="mr-2" />
                        Add Task
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
                                                className="p-4 text-left cursor-pointer  whitespace-nowrap"
                                            >
                                                <div className="flex items-center">
                                                    {column.render('Header')}
                                                    <span>
                                                        {column.isSorted
                                                            ? (column.isSortedDesc
                                                                ? ' 🔽'
                                                                : ' 🔼')
                                                            : ''}
                                                    </span>
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
                                        <tr
                                            {...row.getRowProps()}
                                            className="border-b hover:bg-gray-50 transition-colors whitespace-nowrap"
                                        >
                                            {row.cells.map(cell => (
                                                <td
                                                    {...cell.getCellProps()}
                                                    className="p-4"
                                                >
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center p-4">
                            <div>
                                <span>
                                    Page{' '}
                                    <strong>
                                        {pageIndex + 1} of {pageOptions.length}
                                    </strong>
                                </span>
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={() => previousPage()}
                                    disabled={!canPreviousPage}
                                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => nextPage()}
                                    disabled={!canNextPage}
                                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                        <h2 className="text-xl font-bold mb-4">Task Details</h2>
                        <div className="mb-4">
                            <strong>Task Name:</strong> {selectedTask.task}
                        </div>
                        <div className="mb-4">
                            <strong>Project:</strong> {selectedTask.project}
                        </div>
                        <div className="mb-4">
                            <strong>Employee:</strong> {selectedTask.empId}
                        </div>
                        <div className="mb-4">
                            <strong>Description:</strong> {selectedTask.description}
                        </div>
                        <div className="mb-4">
                            <strong>Timeline:</strong> {selectedTask.timeline}
                        </div>
                        <div className="mb-4">
                            <strong>Date:</strong> {selectedTask.date}
                        </div>
                        <div className="mb-4">
                            <strong>Status:</strong> {selectedTask.status}
                        </div>
                        <div className="mb-4">
                            <strong>Attachment:</strong>
                            {selectedTask.attachments ? (
                                <a
                                    href={selectedTask.attachments}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    View Attachment
                                </a>
                            ) : (
                                <span>No Attachment</span>
                            )}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                className={`bg-blue-500 text-white px-4 py-2 rounded ${role !== "Superadmin" ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                                onClick={() => navigate(`/task-edit/${selectedTask._id}`)}
                                disabled={role !== "Superadmin"}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default TaskList;