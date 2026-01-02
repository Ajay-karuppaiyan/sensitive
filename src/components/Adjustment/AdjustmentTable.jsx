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
import { getAllPayroll } from '../../api/services/projectServices';

const AdjustmentTable = () => {
    const [payroll, setPayroll] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const response = await getAllPayroll();
                console.log(response)
                if (response.status === 200) {
                    setPayroll(response.data);
                } else {
                    throw new Error("Failed to fetch payroll");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayrolls();
    }, []);

    const handleDelete = async (payrollId) => {
        if (window.confirm('Are you sure you want to delete this payroll?')) {
            try {
                const response = await axios.delete(`https://sensitivetechcrm.onrender.com/payroll/deletepayroll/${payrollId}`);
                if (response.status === 200) {
                    setPayroll(payroll.filter((payrollItem) => payrollItem._id !== payrollId));
                }
            } catch (err) {
                setError('Failed to delete payroll');
            }
        }
    };

    const handleEdit = (payrollId) => {
        navigate(`/adjustment-edit/${payrollId}`);
    };

    const handleView = (payroll) => {
        setSelectedPayroll(payroll);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayroll(null);
    };

    const exportToExcel = () => {
        const exportData = payroll.map((payrollItem, index) => ({
            'S.No': index + 1,
            'Payroll ID': payrollItem._id,
            'Employee ID': payrollItem.empId,
            'Type': payrollItem.type,
            'Amount': payrollItem.amount,
            'Note': payrollItem.note,
            'Date': payrollItem.createdAt,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Records");
        XLSX.writeFile(workbook, `Payroll_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        const filteredPayrolls = payroll.filter((Payroll) => {
            const PayrollDate = new Date(Payroll.createdAt);
            return PayrollDate >= start && PayrollDate <= end;
        });

        setPayroll(filteredPayrolls);
    };


    const columns = useMemo(() => [
        {
            Header: 'S.No',
            accessor: (row, index) => index + 1,
        },
        {
            Header: 'Employee ID',
            accessor: 'empId',
        },
        {
            Header: 'Type',
            accessor: 'type',
        },
        {
            Header: 'Month',
            accessor: 'month',
        },
        {
            Header: 'Amount',
            accessor: 'amount',
        },
        {
            Header: 'Note',
            accessor: 'note',
        },
        {
            Header: 'Created Date & Time',
            accessor: 'createdAt',
            Cell: ({ value }) => {
                const formattedDate = new Date(value).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                });
                return <span>{formattedDate}</span>;
            },
        },

        {
            Header: 'Actions',
            accessor: '_id',
            Cell: ({ row }) => (
                <div className="flex justify-center space-x-2">
                    <button
                        className="text-blue-500 hover:bg-blue-100 p-2 rounded-full transition-colors"
                        title="View Payroll"
                        onClick={() => handleView(row.original)}
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
                        title="Delete Payroll"
                        onClick={() => handleDelete(row.original._id)}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )
        }
    ], [payroll]);
    const customGlobalFilter = (rows, id, filterValue) => {
        const formattedFilterValue = formatDateForComparison(filterValue);

        return rows.filter(row => {
            const rowData = row.values;
            return Object.values(rowData).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(filterValue.toLowerCase());
                }
                if (typeof value === 'number') {
                    return value.toString().includes(filterValue);
                }
                if (value instanceof Date) {
                    const formattedRowDate = formatDateForComparison(value);
                    return formattedRowDate.includes(formattedFilterValue);
                }
                return false;
            });
        });
    };
    const formatDateForComparison = (dateInput) => {
        if (!dateInput) return '';

        const dateParts = dateInput.split('/');
        if (dateParts.length === 3) {
            return `${dateParts[0].padStart(2, '0')}/${dateParts[1].padStart(2, '0')}/${dateParts[2]}`;
        }

        const parsedDate = new Date(dateInput);
        if (!isNaN(parsedDate)) {
            const day = parsedDate.getDate().toString().padStart(2, '0');
            const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = parsedDate.getFullYear();
            return `${day}/${month}/${year}`;
        }

        return '';
    };

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
            data: payroll,
            initialState: { pageSize: 10 },
            globalFilter: customGlobalFilter,
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
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">Adjustments Details</h2>

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
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={exportToExcel}
                        className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600"
                    >
                        <FaFileDownload className="mr-2" />
                        Export Data
                    </button>

                    <Link
                        to="/adjustment-form"
                        className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
                    >
                        <FaPlus className="mr-2" />
                        Add Adjustments
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                {payroll.length === 0 ? (
                    <p className="text-center p-4">No payroll records found.</p>
                ) : (
                    <>
                        <table {...getTableProps()} className="w-full">
                            <thead className="bg-[#2563eb] text-white border-b">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                className="p-4 text-left cursor-pointer"
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-8 w-1/2">
                        <h2 className="text-2xl font-semibold mb-4">adjustment Details</h2>
                        {selectedPayroll && (
                            <div>
                                <p><strong>Employee ID:</strong> {selectedPayroll.empId}</p>
                                <p><strong>Type:</strong> {selectedPayroll.type}</p>
                                <p><strong>Amount:</strong> {selectedPayroll.amount}</p>
                                <p><strong>Note:</strong> {selectedPayroll.note}</p>
                                <p>
                                    <strong>Date:</strong>{' '}
                                    {new Date(selectedPayroll.createdAt).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: true,
                                    })}
                                </p>

                            </div>
                        )}
                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={() => handleEdit(selectedPayroll._id)}
                                className="bg-blue-500 text-white px-6 py-2 rounded"
                            >
                                Edit
                            </button>
                            <button onClick={closeModal} className="bg-red-500 text-white px-6 py-2 rounded">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdjustmentTable;
