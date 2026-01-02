import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FaFileDownload, FaFilter } from 'react-icons/fa';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';

const LeadEdit = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
  const [lead, setLead] = useState({
    disposition: "",
    notes: "",
  });

  const dispositionOptions = [
    "No requirements", "Callback", "Busy", "Disconnected", "RNR / Voicemail",
    "Not interested", "Request Quote", "Quotation Sent", "Follow up",
    "Invalid Number", "Taken outside", "Requirement on hold", "Escalated",
    "Schedule Meeting", "Deal Closed", "Others"
  ];
  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axios.get(
          "https://sensitivetechcrm.onrender.com/updatelog/getdispositions"
        );
        if (response.status === 200) {
          let data = response.data;

          if (role === "Lead") {
            const today = new Date().toISOString().split("T")[0];
            data = data.filter(lead => lead.createdAt.split("T")[0] === today);
          }

          setLeads(data);
        } else {
          console.error("Failed to fetch lead details:", response.status);
        }
      } catch (error) {
        console.error("Error fetching lead details:", error);
        setError("Failed to load lead data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [role]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const leadWithDateTime = { ...lead };

    try {
      const response = await axios.post(
        "https://sensitivetechcrm.onrender.com/updatelog/disposition",
        leadWithDateTime
      );

      if (response.status === 201) {
        alert("Lead data submitted successfully!");
        setLead({ disposition: "", notes: "" });
        setLeads((prev) => [...prev, response.data]);
      } else {
        alert(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting lead data:", error);
      alert(`Submission failed: ${error.message}`);
    }
  };
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(leads); 
    const workbook = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads"); 
    XLSX.writeFile(workbook, "leads.xlsx"); 
  };

  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log("Start Date:", start);
    console.log("End Date:", end);

    const filteredData = leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      const isWithinRange = leadDate >= start && leadDate <= end;

      console.log(`Checking lead: ${lead.createdAt} -> Parsed Date: ${leadDate}, In Range: ${isWithinRange}`);

      return isWithinRange;
    });

    console.log("Filtered Leads:", filteredData);

    setFilteredLeads(filteredData);
  };
  const columns = useMemo(() => [
    { Header: 'S.No', accessor: (row, index) => index + 1 },
    { Header: 'Disposition', accessor: 'disposition' },
    { Header: 'Notes', accessor: 'notes' },
    {
      Header: 'Date',
      accessor: 'createdAt',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-GB'),
      id: 'date'
    },
    {
      Header: 'Time',
      accessor: 'createdAt',
      Cell: ({ value }) => new Date(value).toLocaleTimeString(),
      id: 'time' 
    }
  ], [leads]);



  const tableData = filteredLeads.length > 0 ? filteredLeads : leads

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
      data: tableData, 
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex } = state;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className=" mx-auto p-4 mt-12">
      <h2 className="text-4xl font-bold mb-10 text-center mt-24">
        Call Logs
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-6 p-4 rounded bg-[#eff6ff] shadow-lg border border-gray-300 hover:border-gray-500 transition-all"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium pb-2">Disposition:</label>
          <select
            name="disposition"
            value={lead.disposition}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Select Disposition</option>
            {dispositionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium pb-2">Notes:</label>
          <textarea
            name="notes"
            value={lead.notes}
            onChange={handleChange}
            className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 transition-all"
            placeholder="Enter notes here..."
          />
        </div>

        <div className="flex items-center">
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
          >
            Submit
          </button>
        </div>
      </form>
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
          {role === "Superadmin" && (
            <button onClick={downloadExcel} className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600">
              <FaFileDownload className="mr-2" /> Export Data
            </button>
          )}
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
      </div>
    </div>

  );
};

export default LeadEdit;
