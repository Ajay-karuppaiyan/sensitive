import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Eye } from 'lucide-react';
import { FaFileDownload, FaFilter } from 'react-icons/fa';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { getTotalPayments } from '../../api/services/projectServices';

const PaymentTable = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const response = await getTotalPayments();
                console.log("total payment fetched:", response);

                if (response.status === 200) {
                    const paymentData = Array.isArray(response.data) ? response.data : response.data.payments || [];
                    setPayments(paymentData);
                } else {
                    console.error("Failed to fetch payment details:", response.status);
                }
            } catch (error) {
                console.error("Error fetching payment details:", error);
                setError('Failed to load payment data');
            } finally {
                setLoading(false);
            }
        };
        fetchPaymentData();
    }, []);

    const handleEdit = (paymentId) => {
        navigate(`/payments-edit/${paymentId}`);
    };

    const handleView = (payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(payments); 
        const workbook = XLSX.utils.book_new(); 
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, "payments.xlsx"); 
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        const filteredPayments = payments.filter((payment) => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= start && paymentDate <= end;
        });
    
        setPayments(filteredPayments);
    };
    
    const columns = useMemo(() => [
        { Header: 'S.No', accessor: (row, index) => index + 1 },
        { Header: 'Project', accessor: 'project' },
        { Header: 'Payment Type', accessor: 'paymentType' },
        { Header: 'Amount', accessor: 'amount' },
        { Header: 'Mode', accessor: 'mode' },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => new Date(value).toLocaleDateString('en-GB') // Format date
        },
        { Header: 'TDS Applicable', accessor: 'tdsApplicable' },
        { Header: 'Tax Applicable', accessor: 'taxApplicable' },
        { Header: 'Payment Ref. No.', accessor: 'paymentReferenceNumber' },
        {
            Header: 'Payment Quotation',
            accessor: 'paymentQuotation',
            Cell: ({ value }) => (
                <div>
                    {value ? (
                        <img
                            src={value}
                            alt="Payment Quotation"
                            className="w-10 h-10 object-cover rounded"
                        />
                    ) : (
                        <span>No Quotation</span>
                    )}
                </div>
            ),
        },
        {
            Header: 'Payment Proof',
            accessor: 'paymentProof',
            Cell: ({ value }) => (
                <div>
                    {value ? (
                        <img
                            src={value}
                            alt="Payment Proof"
                            className="w-10 h-10 object-cover rounded"
                        />
                    ) : (
                        <span>No Proof</span>
                    )}
                </div>
            ),
        },
        {
            Header: 'Created Date & Time',
            accessor: 'createdAt',
            Cell: ({ value }) =>
                value ? (
                    new Date(value).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                    }) +
                    ' ' +
                    new Date(value).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    })
                ) : 'N/A',
            id: 'created_date_time',
        },
        {
            Header: 'Updated Date & Time',
            accessor: 'updatedAt',
            Cell: ({ value }) =>
                value ? (
                    new Date(value).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                    }) +
                    ' ' +
                    new Date(value).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    })
                ) : 'N/A',
            id: 'updated_date_time',
        },
        
        
        { Header: 'Notes', accessor: 'notes' },
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
        }
    ], [payments]);

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
            data: payments,
            initialState: { pageSize: 10 }
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const { globalFilter, pageIndex } = state;
    console.log("Payments before rendering:", payments);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className=" mx-auto p-4 mt-12">
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">
             Payment Details
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
                            onClick={() => navigate('/payments-form')}
                            className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
                        >
                            Add Payment
                        </button>
                        <button onClick={downloadExcel} className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600">
                            <FaFileDownload className="mr-2" /> Export Data
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    {payments.length === 0 ? (
                        <p className="text-center p-4">No payment records found.</p>
                    ) : (
                        <>
                            <table {...getTableProps()} className="w-full">
                                <thead className="bg-[#2563eb] text-white border-b">
                                    {headerGroups.map(headerGroup => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                <th
                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    className="p-4 text-left cursor-pointer whitespace-nowrap"
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
                                                    <td {...cell.getCellProps()} className="p-4 whitespace-nowrap">{cell.render('Cell')}</td>
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
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center mt-20">
                        <div className="bg-white rounded-lg p-4 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-h-[500px] overflow-auto flex flex-col"> {/* Adjust width for mobile */}
                            <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
                            <div className="flex flex-row justify-between">
                                <div className="w-1/2 pr-4">
                                    {selectedPayment && (
                                        <div className="space-y-2">
                                            <p><strong>Project:</strong> {selectedPayment.project}</p>
                                            <p><strong>Payment Type:</strong> {selectedPayment.paymentType}</p>
                                            <p><strong>Amount:</strong> {selectedPayment.amount}</p>
                                            <p><strong>Mode:</strong> {selectedPayment.mode}</p>
                                            <p><strong>Date:</strong> {new Date(selectedPayment.date).toLocaleDateString('en-GB')}</p>
                                            <p><strong>TDS Applicable:</strong> {selectedPayment.tdsApplicable ? 'Yes' : 'No'}</p>
                                            <p><strong>Tax Applicable:</strong> {selectedPayment.taxApplicable ? 'Yes' : 'No'}</p>
                                            <p><strong>Payment Ref. No:</strong> {selectedPayment.paymentReferenceNumber}</p>
                                            <p><strong>Notes:</strong> {selectedPayment.notes}</p>
                                            <p><strong>Created Date&Time:</strong> {new Date(selectedPayment.createdAt).toLocaleString()}</p>
                                            <p><strong>Updated Date&Time:</strong> {selectedPayment.updatedAt ? new Date(selectedPayment.updatedAt).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="w-1/2 pl-4 flex flex-col justify-start">
                                    <div className="mb-2">
                                        <strong>Payment Quotation:</strong>
                                        {selectedPayment.paymentQuotation ? (
                                            <img
                                                src={selectedPayment.paymentQuotation}
                                                alt="Payment Quotation"
                                                className="w-24 h-24 object-cover rounded mt-2"
                                            />
                                        ) : (
                                            <span>No Quotation Available</span>
                                        )}
                                    </div>
                                    <div>
                                        <strong>Payment Proof:</strong>
                                        {selectedPayment.paymentProof ? (
                                            <img
                                                src={selectedPayment.paymentProof}
                                                alt="Payment Proof"
                                                className="w-24 h-24 object-cover rounded mt-2"
                                            />
                                        ) : (
                                            <span>No Proof Available</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => handleEdit(selectedPayment._id)}
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

export default PaymentTable;
