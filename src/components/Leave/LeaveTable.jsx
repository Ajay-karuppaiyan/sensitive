import React, { useState, useMemo, useEffect } from 'react';
import {
    useTable,
    useGlobalFilter,
    useSortBy,
    usePagination
} from 'react-table';
import { Edit, Trash2 } from 'lucide-react';
import { FaPlus, FaFileDownload } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

const LeaveTable = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState("");

    const role = localStorage.getItem("role") || "Superadmin";
    const id = localStorage.getItem("empId");
    const navigate = useNavigate();

    /* ================= FETCH LEAVES ================= */
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const today = new Date();
                const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

                const response = await axios.get(
                    `https://sensitivetechcrm.onrender.com/leaves/get-all/${id}?startDate=${firstDayOfLastMonth.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`
                );

                setLeaves(response.data);
            } catch (err) {
                setError("Failed to load leave data");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, [id]);

    /* ================= PERMISSION LOGIC ================= */
    const canEditOrDelete = (leave) => {
        if (leave.status === "Approved") return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let leaveStartDate = null;

        if (leave.leaveCategory === "Leave" && leave.startDate) {
            leaveStartDate = new Date(leave.startDate);
        }

        if (leave.leaveCategory === "Permission" && leave.permissionDate) {
            leaveStartDate = new Date(leave.permissionDate);
        }

        if (leaveStartDate) {
            leaveStartDate.setHours(0, 0, 0, 0);
            if (leaveStartDate <= today) return false;
        }

        return true;
    };

    /* ================= ACTIONS ================= */
    const handleEdit = (leaveId) => {
        navigate(`/leave-edit/${leaveId}`);
    };

    const handleDelete = async (leaveId) => {
        if (!window.confirm("Are you sure you want to delete this leave?")) return;

        try {
            await axios.delete(`https://sensitivetechcrm.onrender.com/leaves/delete/${leaveId}`);
            setLeaves(leaves.filter(l => l._id !== leaveId));
        } catch {
            setError("Failed to delete leave");
        }
    };

    const handleStatusChange = async (leaveId, newStatus) => {
        try {
            await axios.put(
                `https://sensitivetechcrm.onrender.com/leaves/update-status/${leaveId}`,
                { status: newStatus, statusChangeDate: new Date().toISOString() }
            );

            setLeaves(leaves.map(l =>
                l._id === leaveId ? { ...l, status: newStatus } : l
            ));
        } catch {
            setError("Failed to update status");
        }
    };

    /* ================= EXPORT ================= */
    const exportToExcel = () => {
        const exportData = leaves.map((l, i) => ({
            "S.No": i + 1,
            "Employee": l.employee,
            "Category": l.leaveCategory,
            "Type": l.leaveType,
            "Status": l.status,
            "Approved By": l.approvedBy || "—"
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leaves");
        XLSX.writeFile(wb, "Leave_Report.xlsx");
    };

    /* ================= COLUMNS ================= */
    const columns = useMemo(() => {
        const baseColumns = [
            {
                Header: () => <div className="text-center">S.No</div>,
                accessor: (_, i) => i + 1,
                id: 'sno',
                Cell: ({ value }) => <div className="text-center">{value}</div>
            },
            {
                Header: () => <div className="text-center">Employee</div>,
                accessor: 'employee',
                id: 'employee',
                Cell: ({ value }) => <div className="text-center">{value}</div>
            },
            {
                Header: () => <div className="text-center">Category</div>,
                accessor: 'leaveCategory',
                id: 'category',
                Cell: ({ value }) => <div className="text-center">{value}</div>
            },
            {
                Header: () => <div className="text-center">Leave Type</div>,
                accessor: 'leaveType',
                id: 'leaveType',
                Cell: ({ value }) => <div className="text-center">{value}</div>
            },
            {
                Header: () => <div className="text-center">Status</div>,
                accessor: 'status',
                id: 'status',
                Cell: ({ row }) => (
                    <div className="flex justify-center">
                        <select
                            value={row.original.status}
                            disabled={role !== "Superadmin"}
                            onChange={(e) => role === "Superadmin" &&
                                handleStatusChange(row.original._id, e.target.value)
                            }
                            className={`px-3 py-1 rounded text-sm border ${
                                row.original.status === 'Approved'
                                    ? 'bg-green-100 text-green-800 border-green-300'
                                    : row.original.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                        : 'bg-red-100 text-red-800 border-red-300'
                            }`}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                )
            }
        ];

        if (role !== "Superadmin") {
            baseColumns.push({
                Header: () => <div className="text-center">Actions</div>,
                accessor: '_id',
                id: 'actions',
                Cell: ({ row }) => {
                    const allowed = canEditOrDelete(row.original);

                    return (
                        <div className="flex justify-center space-x-2">
                            <button
                                disabled={!allowed}
                                onClick={() => allowed && handleEdit(row.original._id)}
                                className={`p-2 rounded-full ${
                                    allowed
                                        ? "text-green-500 hover:bg-green-100"
                                        : "text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <Edit size={18} />
                            </button>

                            <button
                                disabled={!allowed}
                                onClick={() => allowed && handleDelete(row.original._id)}
                                className={`p-2 rounded-full ${
                                    allowed
                                        ? "text-red-500 hover:bg-red-100"
                                        : "text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                }
            });
        }

        return baseColumns;
    }, [role, leaves]);

    /* ================= TABLE ================= */
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        state
    } = useTable(
        { columns, data: leaves, initialState: { pageSize: 10 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    if (loading) return <div className="text-center mt-20">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-center mb-6">Leave Details</h2>

            <div className="flex justify-between mb-4">
                <input
                    className="border p-2 rounded w-64"
                    placeholder="Search..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />

                <div className="flex space-x-4">
                    {role === "Superadmin" && (
                        <button onClick={exportToExcel} className="bg-green-500 text-white px-4 py-2 rounded">
                            <FaFileDownload className="inline mr-2" /> Export
                        </button>
                    )}
                    <Link to="/leave" className="bg-blue-500 text-white px-4 py-2 rounded">
                        <FaPlus className="inline mr-2" /> Add Leave
                    </Link>
                </div>
            </div>

            <table {...getTableProps()} className="w-full border-collapse border border-gray-300">
                <thead className="bg-blue-600 text-white">
                    {headerGroups.map(hg => (
                        <tr {...hg.getHeaderGroupProps()}>
                            {hg.headers.map(col => (
                                <th {...col.getHeaderProps()} className="p-3 text-center border-b border-gray-300">
                                    {col.render("Header")}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()} className="border-b hover:bg-gray-50">
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()} className="p-3 text-center border-b border-gray-200">
                                        {cell.render("Cell")}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 border rounded-lg">
                <button
                    onClick={previousPage}
                    disabled={!canPreviousPage}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition 
                        ${canPreviousPage
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                >
                    Previous
                </button>

                <span className="text-sm font-semibold text-gray-700">
                    Page <span className="text-blue-600">{state.pageIndex + 1}</span>
                </span>

                <button
                    onClick={nextPage}
                    disabled={!canNextPage}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition 
                        ${canNextPage
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default LeaveTable;
