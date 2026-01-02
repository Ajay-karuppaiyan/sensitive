import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { FaPlus, FaFileDownload, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';

const LeadTable = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
      const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');
        const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await axios.get('https://sensitivetechcrm.onrender.com/leads/get-all');
                setLeads(response.data);
            } catch (err) {
                console.error("Error fetching leads:", err);
                setError('Failed to load lead data');
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const handleDelete = async (leadId) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                const response = await axios.delete(`https://sensitivetechcrm.onrender.com/leads/delete/${leadId}`);
                if (response.status === 200) {
                    setLeads(leads.filter((lead) => lead._id !== leadId));
                }
            } catch (err) {
                console.error("Error deleting lead:", err);
                setError('Failed to delete lead');
            }
        }
    };
    const handleEdit = (leadId) => {
        navigate(`/lead-edit/${leadId}`);
    };
    const exportToExcel = () => {
        const exportData = leads.map((lead, index) => ({
            'S.No': index + 1,
            'Name': lead.name,
            'Contact': lead.contact,
            'Email': lead.email,
            'Requirements': lead.requirements,
            'Company': lead.company,
            'Location': lead.location,
            'Links': lead.links,
            'Comments': lead.comments,
            'Status': lead.status,
            'Created Date-Time': new Date(lead.createdAt).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lead Records');
        XLSX.writeFile(workbook, `Lead_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const applyDateFilter = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    
        // Convert dates to Date objects for comparison
        const start = new Date(startDate.split('/').reverse().join('/'));
        const end = new Date(endDate.split('/').reverse().join('/'));
    
        const filteredLeads = leads.filter((lead) => {
            const leadDateParts = lead.createdAt.split('/');
            const leadDate = new Date(`20${leadDateParts[2]}-${leadDateParts[1]}-${leadDateParts[0]}`);
    
            return leadDate >= start && leadDate <= end;
        });
    
        setLeads(filteredLeads);
    };
    
    const columns = useMemo(() => [
        { Header: 'S.No', accessor: (row, index) => index + 1 },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Contact', accessor: 'contact' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Requirements', accessor: 'requirements' },
        { Header: 'Company', accessor: 'company' },
        { Header: 'Location', accessor: 'location' },
        { Header: 'Links', accessor: 'links' },
        { Header: 'Comments', accessor: 'comments' },
        { Header: 'Status', accessor: 'status' },
        {
            Header: 'Created Date & Time',
            accessor: 'createdAt',
            Cell: ({ value }) =>
                value ? (
                    <>
                        {new Date(value).toLocaleDateString('en-GB')}
                        <br />
                        {new Date(value).toLocaleTimeString()}
                    </>
                ) : (
                    'N/A'
                ),
            id: 'created_date_time',
        },
        {
            Header: 'Update Log',
            accessor: 'updateLog',
            Cell: ({ row }) => (
                // <Link 
                //     to={`/lead-edit/${row.original._id}`} // Link to Update Log page with leadId
                //     className="text-center truncate hover:bg-blue-600 mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                // >
                //     Update Log
                // </Link>
                <button className="text-center truncate hover:bg-blue-600 mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => handleEdit(row.original._id)}>
                    Update Log
                </button>
            )
        },

        {
            Header: 'Actions',
            accessor: '_id',
            Cell: ({ row }) => (
                <div className="flex justify-center space-x-2">
                    <button className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors" onClick={() => handleDelete(row.original._id)}>
                        <Trash2 size={20} />
                    </button>
                </div>
            )
        }
    ], [leads]);

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
            data: leads,
            initialState: { pageSize: 10 }
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const { globalFilter, pageIndex } = state;

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="mx-auto p-4">
            <h2 className="text-4xl font-bold mb-10 text-center mt-24">Enquires Details</h2>
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
                    <button onClick={exportToExcel} className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600">
                        <FaFileDownload className="mr-2" /> Export Data
                    </button>
                )}
                    <Link to="/lead-form" className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600">
                        <FaPlus className="mr-2" /> Add Lead
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                {leads.length === 0 ? (
                    <p className="text-center p-4">No lead records found.</p>
                ) : (
                    <>
                        <table {...getTableProps()} className="w-full">
                            <thead className="bg-[#2563eb] text-white border-b">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())} className="p-4 text-left cursor-pointer whitespace-nowrap">
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
                                <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
                                    Previous
                                </button>
                                <button onClick={() => nextPage()} disabled={!canNextPage} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
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

export default LeadTable;
