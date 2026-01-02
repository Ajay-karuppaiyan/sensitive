import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { FaPlus, FaFileDownload, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';

const ClientTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('https://sensitivetechcrm.onrender.com/clients/get-all');
        console.log(response);
        setClients(response.data);


      } catch (err) {
        setError('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await axios.delete(`https://sensitivetechcrm.onrender.com/clients/delete/${clientId}`);

        if (response.status === 200) {
          setClients(clients.filter((client) => client._id !== clientId));
        }
      } catch (err) {
        setError('Failed to delete client');
      }
    }
  };

  const handleEdit = (clientId) => {
    navigate(`/client-edit/${clientId}`);
  };
  const exportToExcel = () => {
    const exportData = clients.map((client, index) => ({
      'S.No': index + 1,
      'Organization': client.organization,
      'Contact Person': client.contactPerson,
      'Contact Number': client.contactNumber,
      'Alternate Contact': client.alternateContact,
      'Email ID': client.emailId,
      'Alternate Mail ID': client.alternateMailId,
      'Business Category': client.businessCategory,
      'Office Location': `${client.officeLocation.addressLine}, ${client.officeLocation.area}, ${client.officeLocation.city}, ${client.officeLocation.state} - ${client.officeLocation.pincode}`,
      'Registered Address': `${client.registeredAddress.addressLine}, ${client.registeredAddress.area}, ${client.registeredAddress.city}, ${client.registeredAddress.state} - ${client.registeredAddress.pincode}`,
      'Status': client.status,
      'Created Date-Time': new Date(client.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Client Records');
    XLSX.writeFile(workbook, `Client_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredClients = clients.filter((client) => {
      const clientDate = new Date(client.createdAt);
      return clientDate >= start && clientDate <= end;
    });

    setClients(filteredClients);
  };

  const columns = useMemo(() => [
    { Header: 'S.No', accessor: (row, index) => index + 1 },
    { Header: 'Organization', accessor: 'organization' },
    { Header: 'Contact Person', accessor: 'contactPerson' },
    {
      Header: 'Contact',
      accessor: 'contactNumber',
      Cell: ({ value, row }) => (
        <div>
          <div>{value}</div>
          {row.original.alternateContact && (
            <div className="text-gray-700 text-sm mt-1">{row.original.alternateContact}</div>
          )}
        </div>
      )
    },
    {
      Header: 'Email ID',
      accessor: 'emailId',
      Cell: ({ value, row }) => (
        <div>
          <div>{value}</div>
          {row.original.alternateMailId && (
            <div className="text-gray-700 text-sm mt-1">{row.original.alternateMailId}</div>
          )}
        </div>
      )
    },
    { Header: 'Category', accessor: 'businessCategory' },
    { Header: 'Office Location', accessor: 'officeLocation', Cell: ({ value }) => `${value.addressLine}, ${value.area}, ${value.city}, ${value.state} - ${value.pincode}` },
    { Header: 'Registered Address', accessor: 'registeredAddress', Cell: ({ value }) => `${value.addressLine}, ${value.area}, ${value.city}, ${value.state} - ${value.pincode}` },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Created At', accessor: 'createdAt', Cell: ({ value }) => new Date(value).toLocaleString() },
    {
      Header: 'Actions',
      accessor: '_id',
      Cell: ({ row }) => (
        <div className="flex justify-center space-x-2">
          <button className="text-green-500 hover:bg-green-100 p-2 rounded-full transition-colors" onClick={() => handleEdit(row.original._id)}>
            <Edit size={20} />
          </button>
          <button className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors" onClick={() => handleDelete(row.original._id)}>
            <Trash2 size={20} />
          </button>
        </div>
      )
    }
  ], [clients]);

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
      data: clients,
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
    <div className="mx-auto p-4 ">
      <h2 className="text-4xl font-bold mb-10 text-center mt-24">Client Details</h2>

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
              className="border border-blue-500 p-2 rounded w-36"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-blue-500 p-2 rounded w-36"
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
          <button onClick={exportToExcel} className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600">
            <FaFileDownload className="mr-2" /> Export Data
          </button>
          <Link to="/client-form" className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600">
            <FaPlus className="mr-2" /> Add Client
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        {clients.length === 0 ? (
          <p className="text-center p-4">No client records found.</p>
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

export default ClientTable;
