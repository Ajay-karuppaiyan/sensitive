import { useMemo, useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Eye, Trash } from 'lucide-react';
import { FaFileDownload, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { deleteQuotations, getTotalQuotations } from '../../api/services/projectServices';

const QuotationTable = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuotationData = async () => {
            try {
                const response = await getTotalQuotations();
                if (response.status === 200) {
                    const quotationData = Array.isArray(response.data) ? response.data : response.data.quotations || [];
                    setQuotations(quotationData);
                } else {
                    setError('Failed to load quotation data');
                }
            } catch (error) {
                setError('Failed to load quotation data');
            } finally {
                setLoading(false);
            }
        };
        fetchQuotationData();
    }, []);

    const handleEdit = (quotationId) => {
        navigate(`/quotation-edit/${quotationId}`);
    };

    const handleView = (quotation) => {
        setSelectedQuotation(quotation);
        setIsModalOpen(true);
    };

    const handleDelete = async (quotation) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this quotation?");
        if (!confirmDelete) return;
    
        try {
            await deleteQuotations(quotation._id);
            setQuotations(prevQuotations => prevQuotations.filter(q => q._id !== quotation._id));
            alert("Quotation deleted successfully!");
        } catch (error) {
            console.error("Error deleting quotation:", error);
            alert("Failed to delete quotation. Please try again.");
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedQuotation(null);
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(quotations);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Quotations");
        XLSX.writeFile(workbook, "quotations.xlsx");
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const filteredQuotations = quotations.filter((quotation) => {
            const quotationDate = new Date(quotation.quotationDate || quotation.createdAt);
            return quotationDate >= start && quotationDate <= end;
        });

        setQuotations(filteredQuotations);
    };
    const columns = useMemo(() => [
        { Header: 'S.No', accessor: (row, index) => index + 1 },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Contact', accessor: 'contact' },
        { Header: 'Company', accessor: 'company' },
        { Header: 'Requirement', accessor: 'requirement' },
        { Header: 'Tech Stack', accessor: 'techStack' },
        { Header: 'Quote', accessor: 'quote' },
        { Header: 'Note', accessor: 'note' },
        {
            Header: 'Quotation',
            accessor: 'quotation',
            Cell: ({ value }) => (
                value ? (
                    <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 underline"
                    >
                        {value.split('/').pop()} 
                    </a>
                ) : 'N/A'
            ),
        },
        { Header: 'Status', accessor: 'status' },
        {
            Header: 'Quotation Date & Time',
            accessor: 'quotationDate',
            Cell: ({ value }) =>
                value ? (
                    <>
                        {new Date(value).toLocaleDateString('en-GB')}
                       
                        {new Date(value).toLocaleTimeString()}
                    </>
                ) : (
                    'N/A'
                ),
            id: 'date_time',
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
                        title="View Quotation"
                        onClick={() => handleView(row.original)}
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                        title="Delete Quotation"
                        onClick={() => handleDelete(row.original)}
                    >
                        <Trash size={20} />
                    </button>
                </div>
            ),
        },
    ], []);

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
            data: quotations,
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
        <div className="mx-auto p-4 mt-12">
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">
                Quotation Table
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
                            onClick={() => navigate('/quotation-form')}
                            className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
                        >
                            Create Quotation
                        </button>
                        <button onClick={downloadExcel} className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600">
                            <FaFileDownload className="mr-2" /> Export Data
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    {quotations.length === 0 ? (
                        <p className="text-center p-4">No quotation records found.</p>
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
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white rounded-lg p-8 w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">Quotation Details</h2>
                            {selectedQuotation && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p><strong>Client Name:</strong> {selectedQuotation.name}</p>
                                        <p><strong>Contact:</strong> {selectedQuotation.contact}</p>
                                        <p><strong>Company:</strong> {selectedQuotation.company}</p>
                                        <p><strong>Requirement:</strong> {selectedQuotation.requirement}</p>
                                        <p><strong>Tech Stack:</strong> {selectedQuotation.techStack}</p>
                                    </div>
                                    <div>
                                        <p><strong>Quote Amount:</strong> {selectedQuotation.quote}</p>
                                        <p><strong>Status:</strong> {selectedQuotation.status}</p>
                                        <p><strong>Date:</strong> {new Date(selectedQuotation.quotationDate || selectedQuotation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
                                        <p><strong>Notes:</strong> {selectedQuotation.note}</p>
                                        <p><strong>Update Log:</strong> {selectedQuotation.updateLog}</p>
                                        {selectedQuotation.quotation && (
                                            <p>
                                                <strong>Quotation File:</strong> 
                                                <a 
                                                    href={selectedQuotation.quotation} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-500 underline"
                                                >
                                                    {selectedQuotation.quotation.split('/').pop()}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => handleEdit(selectedQuotation._id)}
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

export default QuotationTable;