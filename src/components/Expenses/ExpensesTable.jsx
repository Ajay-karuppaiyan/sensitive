import React, { useState, useMemo, useEffect } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Trash2, Eye } from 'lucide-react';
import { FaFileDownload, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getTotalExpense } from '../../api/services/projectServices';

const ExpenseTable = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        const fetchExpenseData = async () => {
            try {
                const response = await getTotalExpense();
                if (response.status === 200) {
                    const expenseData = Array.isArray(response.data) ? response.data : response.data.expenses || [];
                    setExpenses(expenseData);
                } else {
                    setError('Failed to load expense data');
                }
            } catch (error) {
                setError('Failed to load expense data');
            } finally {
                setLoading(false);
            }
        };
        fetchExpenseData();
    }, []);
    const handleEdit = (expenseId) => {
        navigate(`/expense-edit/${expenseId}`);
    };

    const handleView = (expense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedExpense(null);
    };
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(expenses);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
        XLSX.writeFile(workbook, "expenses.xlsx");
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        const filteredExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.createdAt);
            return expenseDate >= start && expenseDate <= end;
        });

        setExpenses(filteredExpenses);
    };
    const columns = useMemo(() => [
        { Header: 'S.No', accessor: (row, index) => index + 1 },
        { Header: 'Type', accessor: 'type' },
        { Header: 'Project', accessor: 'project' },
        { Header: 'Amount', accessor: 'amount' },
        { Header: 'Notes', accessor: 'notes' },
        {
            Header: 'Attachments',
            accessor: 'attachments',
            Cell: ({ value }) => (
                <div>
                    {value ? (
                        <img src={value} alt="Attachment" className="w-10 h-10 object-cover rounded" />
                    ) : (
                        <span>No attachment</span>
                    )}
                </div>
            ),
        },
        {
            Header: 'Created Date & Time',
            accessor: 'createdAt',
            Cell: ({ value }) =>
                value ? (
                    <>
                        {new Date(value).toLocaleDateString('en-GB')}
                       
                        {new Date(value).toLocaleTimeString()}
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
                        className="text-blue-500 hover:bg-blue-100 p-2 rounded-full"
                        title="View Expense"
                        onClick={() => handleView(row.original)}
                    >
                        <Eye size={20} />
                    </button>
                </div>
            ),
        },
    ], [expenses]);
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
    } = useTable(
        {
            columns,
            data: expenses,
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
        <div className=" mx-auto p-4 mt-12">
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">
                Expense Table
            </h2>
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
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
                            onClick={() => navigate('/expense-form')}
                            className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
                        >
                            Add Expense
                        </button>
                        <button onClick={downloadExcel} className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600">
                            <FaFileDownload className="mr-2" /> Export Data
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    {expenses.length === 0 ? (
                        <p className="text-center p-4">No expense records found.</p>
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
                                                        <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
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
                                            <tr {...row.getRowProps()} className="border-b hover:bg-gray-50 transition-colors">
                                                {row.cells.map(cell => (
                                                    <td {...cell.getCellProps()} className="p-4">{cell.render('Cell')}</td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="flex justify-between items-center p-4">
                                <div>
                                    <span>
                                        Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
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
                            <h2 className="text-2xl font-semibold mb-4">Expense Details</h2>
                            {selectedExpense && (
                                <div className="flex flex-col md:flex-row md:space-x-4">
                                    <div className="flex-1">
                                        <p><strong>Employee ID:</strong> {selectedExpense.empId}</p>
                                        <p><strong>Type:</strong> {selectedExpense.type}</p>
                                        <p><strong>Project:</strong> {selectedExpense.project}</p>
                                        <p><strong>Amount:</strong> {selectedExpense.amount}</p>
                                        <p><strong>Note:</strong> {selectedExpense.notes}</p>
                                        <p><strong>Date:</strong> {new Date(selectedExpense.createdAt).toLocaleDateString('en-GB')}</p>
                                        <p><strong>Time:</strong> {new Date(selectedExpense.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex justify-end items-center">
                                        {selectedExpense.attachments && (
                                            <div>
                                                <strong>Attachment:</strong>
                                                <img src={selectedExpense.attachments} alt="Attachment" className="mt-2 w-40 h-40 object-cover rounded" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => handleEdit(selectedExpense._id)}
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
        </div>
    );
};

export default ExpenseTable;
