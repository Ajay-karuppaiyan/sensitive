import React, { useState, useMemo, useEffect } from 'react';
import {
    useTable,
    useGlobalFilter,
    useSortBy,
    usePagination
} from 'react-table';
import { Edit, Trash2 } from 'lucide-react';
import { FaPlus, FaFileDownload, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const LeaveTable = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
    const id = localStorage.getItem("empId");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const today = new Date();
                const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const formattedStartDate = firstDayOfLastMonth.toISOString().split('T')[0];
                const formattedEndDate = today.toISOString().split('T')[0];

                const response = await axios.get(`https://sensitivetechcrm.onrender.com/leaves/get-all/${id}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);

                setLeaves(response.data);
            } catch (err) {
                setError("Failed to load leave data");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, [id]);

    const handleStatusChange = async (leaveId, newStatus) => {
        try {
            const response = await axios.put(`https://sensitivetechcrm.onrender.com/leaves/update-status/${leaveId}`, {
                status: newStatus,
                statusChangeDate: new Date().toISOString()
            });

            if (response.status === 200) {
                setLeaves(leaves.map(leave =>
                    leave._id === leaveId
                        ? { ...leave, status: newStatus, statusChangeDate: new Date().toISOString() }
                        : leave
                ));
            }
        } catch (err) {
            setError('Failed to update status');
        }
    };

    const handleDelete = async (leaveId) => {
        if (window.confirm('Are you sure you want to delete this leave?')) {
            try {
                const response = await axios.delete(`https://sensitivetechcrm.onrender.com/leaves/delete/${leaveId}`);
                if (response.status === 200) {
                    setLeaves(leaves.filter((leave) => leave._id !== leaveId));
                }
            } catch (err) {
                setError('Failed to delete leave');
            }
        }
    };

    const handleEdit = (leaveId) => {
        navigate(`/leave-edit/${leaveId}`);
    };

    const exportToExcel = () => {
        const exportData = leaves.map((leave, index) => ({
            'S.No': index + 1,
            'Leave ID': leave.row._id,
            'Name': leave.employee,
            'Running Projects': leave.runningProjects,
            'Leave Dates': leave.leaveDates,
            'Notes': leave.notes,
            'Status': leave.status,
            'Approved By': leave.approvedBy,
            'Status Change Date': leave.statusChangeDate,
            'Leave Applied On': leave.leaveAppliedOn
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Records");
        XLSX.writeFile(workbook, `Leave_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const filteredLeaves = leaves.filter((leave) => {
            const leaveDate = new Date(leave.leaveAppliedOn);
            return leaveDate >= start && leaveDate <= end;
        });

        setLeaves(filteredLeaves);
    };


    const columns = useMemo(() => {
        const baseColumns = [
            {
                Header: 'S.No',
                accessor: (row, index) => index + 1,
                Cell: ({ value }) => <span className="whitespace-nowrap">{value}</span>
            },
            // {
            //     Header: 'Leave ID',
            //     accessor: row => row._id,
            //     id: 'leaveIdColumn',
            // },
            {
                Header: 'Employee',
                accessor: 'employee',
                Cell: ({ value }) => <span className="whitespace-nowrap">{value}</span>
            },
            {
                Header: 'Category',
                accessor: 'leaveCategory',
                Cell: ({ value }) => <span className="whitespace-nowrap">{value}</span>
            },
            {
                Header: 'Leave Type',
                accessor: 'leaveType',
                Cell: ({ value }) => <span className="whitespace-nowrap">{value}</span>
            },
            {
                Header: 'Applied Date',
                accessor: (row) =>
                    row.createdAt ? (
                        <span className="whitespace-nowrap">
                            {new Date(row.createdAt).toLocaleDateString('en-GB')}<br />
                            {new Date(row.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                    ) : 'N/A',
            },
            {
                Header: 'Leave / Permission Range',
                accessor: (row) => {
                    if (row.leaveCategory === 'Leave') {
                        return row.startDate && row.endDate
                            ? (
                                <div className="text-center">
                                    <span>{new Date(row.startDate).toLocaleDateString('en-GB')} to {new Date(row.endDate).toLocaleDateString('en-GB')}</span>
                                </div>
                            )
                            : 'N/A';
                    } else if (row.leaveCategory === 'Permission') {
                        if (row.permissionDate && row.startTime && row.endTime) {
                            const permissionDate = new Date(row.permissionDate).toLocaleDateString('en-GB');

                            const formatTime = (time) => {
                                const [hours, minutes] = time.split(':');
                                let formattedHours = parseInt(hours, 10);
                                const ampm = formattedHours >= 12 ? 'PM' : 'AM';
                                formattedHours = formattedHours % 12 || 12; 
                                return `${formattedHours}:${minutes} ${ampm}`;
                            };

                            return (
                                <div className="flex flex-col ">
                                    <span>{permissionDate}</span>
                                    <span>{formatTime(row.startTime)} to {formatTime(row.endTime)}</span>
                                </div>
                            );
                        }
                        return 'N/A';
                    }
                    return 'N/A';
                }
            },

            {
                Header: 'Notes',
                accessor: 'remarks',
                Cell: ({ value }) => (
                    <div className="w-[300px] break-words whitespace-pre-wrap overflow-hidden max-h-[30rem]">
                        {value}
                    </div>
                ),
            },

            {
                Header: 'Attachment',
                accessor: 'attachment',
                Cell: ({ value }) => (
                    <div className="whitespace-nowrap">
                        {value ? <img src={value} alt="Attachment" className="w-12 h-12 object-cover rounded" /> : 'No attachment'}
                    </div>
                ),
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ row }) => (
                    <select
                        value={row.original.status}
                        onChange={(e) => role === "Superadmin" && handleStatusChange(row.original._id, e.target.value)}
                        disabled={role !== "Superadmin"}
                        className={`whitespace-nowrap px-3 py-1 rounded text-sm border ${row.original.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            row.original.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-red-100 text-red-800 border-red-200'}, ${role !== "Superadmin" ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
                    `}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                )
            },
            {
                Header: 'Running Projects',
                accessor: 'runningProjects',
                Cell: ({ value }) => <span className="whitespace-nowrap">{value}</span>
            },
            {
                Header: 'Approved By',
                accessor: 'approvedBy',
                Cell: ({ value }) => <span className="whitespace-nowrap">{value}</span>
            },
            {
                Header: 'Approved Date & Time',
                accessor: (row) =>
                    row.statusChangeDate ? (
                        <span className="whitespace-nowrap">
                            {new Date(row.statusChangeDate).toLocaleDateString('en-GB')}<br />
                            {new Date(row.statusChangeDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                    ) : 'N/A',
            }
        ];


        if (role !== "Superadmin") {
            baseColumns.push({
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ row }) => (
                    <div className="flex justify-center space-x-2">
                        <button
                            className="text-green-500 hover:bg-green-100 p-2 rounded-full transition-colors"
                            title="Edit Leave"
                            onClick={() => handleEdit(row.original._id)}
                        >
                            <Edit size={20} />
                        </button>
                        <button
                            className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
                            title="Delete Leave"
                            onClick={() => handleDelete(row.original._id)}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )
            });
        }

        return baseColumns;
    }, [role]);

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
            data: leaves,
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
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">Leave Details</h2>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
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
                                        min={new Date().toISOString().split('T')[0]}
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
                                        min={new Date().toISOString().split('T')[0]}
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
                        to="/leave"
                        className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
                    >
                        <FaPlus className="mr-2" />
                        Add Leave
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                {leaves.length === 0 ? (
                    <p className="text-center p-4">No leave records found.</p>
                ) : (
                    <>
                        <table {...getTableProps()} className="w-full">
                            <thead className="bg-[#2563eb] text-white border-b">
                                {headerGroups.map((headerGroup) => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column) => (
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                className="p-4 text-left cursor-pointer whitespace-nowrap"
                                            >
                                                <div className="flex items-center">
                                                    {column.render("Header")}
                                                    <span>
                                                        {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
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
                                            className="border-b hover:bg-gray-50 transition-colors"
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
        </div>
    );
};

export default LeaveTable;