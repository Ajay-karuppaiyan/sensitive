import React, { useState, useMemo, useEffect } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaFileDownload, FaFilter } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";
import { useTable, useGlobalFilter, useSortBy, usePagination } from "react-table";
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-2xl w-full m-4">
        {children}
      </div>
    </div>
  );
};
const EmployeeDetailsModal = ({ isOpen, onClose, employee }) => {
  if (!employee) return null;
  const combinedShiftTime = `${employee.shiftStartTime} to ${employee.shiftEndTime}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Employee Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 flex justify-center">
            <img
              src={employee.profileImage}
              alt={employee.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
            />
          </div>

          <div className="space-y-4 col-span-2">
            <div className="grid grid-cols-2 gap-4 ">
              <DetailItem label="Employee ID" value={employee.empId} />
              <DetailItem label="Name" value={employee.name} />
              {/* <DetailItem label="Email" value={(employee.email)} /> */}
              <DetailItem label="Designation" value={employee.designation} />
              <DetailItem label="Department" value={employee.department} />
              <DetailItem label="Date of Birth" value={formatDate(employee.dob)} />
              <DetailItem label="Date of Joining" value={formatDate(employee.doj)} />
              {/* <DetailItem label="Status" value={employee.status} /> */}
              <DetailItem label="Created Date" value={formatDateTime(employee.createdAt)} />
              <DetailItem label="Shift Time" value={combinedShiftTime} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);


const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB").split('/').join('/');
};


const formatDateTime = (dateString) => {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return "N/A";
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }) + ", " + date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
;
const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://sensitivetechcrm.onrender.com/getallemployees");
        console.log(response.data);
        setEmployees(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);
  const columns = useMemo(
    () => [
      {
        Header: "S.No",
        accessor: (row, index) => index + 1,
      },
      {
        Header: "Profile Picture",
        accessor: "profileImage",
        Cell: ({ value }) => (
          <img
            src={value}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
        ),
      },
      {
        Header: "Emp ID",
        accessor: "empId",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Role",
        accessor: "role",
      },
      {
        Header: "Designation",
        accessor: "designation",
      },
      {
        Header: "Department",
        accessor: "department",
      },
      {
        Header: "DOB",
        accessor: "dob",
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "DOJ",
        accessor: "doj",
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${value === "Active"
              ? "bg-green-100 text-green-800"
              : value === "On Leave"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Created Date",
        accessor: "createdAt",
        Cell: ({ value }) => formatDateTime(value),
      },

      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ row }) => (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => {
                setSelectedEmployee(row.original);
                setIsModalOpen(true);
              }}
              className="text-blue-500 hover:bg-blue-100 p-2 rounded-full transition-colors"
              title="View Details"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={() => navigate(`/employee-edit/${row.original._id}`)}
              className="text-green-500 hover:bg-green-100 p-2 rounded-full transition-colors"
              title="Edit Employee"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={() => handleEmployeeDelete(row.original._id)}
              className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
              title="Delete Employee"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ),
      },
    ],
    []
  );
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
      data: employees,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex } = state;
  const handleEmployeeDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`https://sensitivetechcrm.onrender.com/deleteemployee/${id}`);
        setEmployees((prevEmployees) =>
          prevEmployees.filter((employee) => employee._id !== id)
        );
        alert("Employee deleted successfully!");
      } catch (err) {
        alert("Failed to delete employee.");
      }
    }
  };
  const exportToExcel = () => {
    const exportData = employees.map((employee, index) => ({
      "S.No": index + 1,
      "Emp ID": employee.empId,
      "Name": employee.name,
      "Designation": employee.designation,
      "Department": employee.department,
      "DOB": employee.dob,
      "DOJ": employee.doj,
      "Status": employee.status,
      "Created Date": employee.createdDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Records");
    XLSX.writeFile(workbook, `Employee_Records_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredPayrolls = employees.filter((Employees) => {
      const PayrollDate = new Date(employees.createdAt);
      return PayrollDate >= start && PayrollDate <= end;
    });

    setEmployees(filteredPayrolls);
  };

  if (loading) {
    return <div className="text-center mt-20">Loading employee data...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mx-auto p-4">
      <h2 className="text-4xl font-bold mb-10 text-center mt-20">
        Employee Details
      </h2>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            value={globalFilter || ""}
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
            to="/employee-form"
            className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
          >
            <FaPlus className="mr-2" />
            Add Employee
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg border">
        <table {...getTableProps()} className="w-full table-auto">
          <thead className="bg-[#2563eb] text-white border-b">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="p-4 text-left font-semibold text-white whitespace-nowrap"
                  >
                    <div className="flex items-center">
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="border-b hover:bg-gray-50">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="p-2 whitespace-nowrap">
                      {cell.render("Cell")}
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
              Page{" "}
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
      </div>
      <EmployeeDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default EmployeeTable;
