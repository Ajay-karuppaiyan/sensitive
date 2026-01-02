import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Edit, X } from 'lucide-react';

const PayrollEmployee = () => {
  const loggedInUserId = localStorage.getItem("empId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [payrollData, setPayrollData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('current');
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
  const navigate = useNavigate();

  // Modal states
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    remainingDays: 0
  });
  const [dayFilter, setDayFilter] = useState('all');

  // Helper function to get day name from date
  const getDayName = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  useEffect(() => {
    if (payrollData.length > 0) {
      applyMonthFilter(activeFilter);
    }
  }, [payrollData, activeFilter]);

  const fetchPayrollData = async () => {
    try {
      const response = await axios.get('https://sensitivetechcrm.onrender.com/allemployeesdata');
      if (response.data.success) {
        console.log('Raw API data:', response.data.data);
        setPayrollData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    }
  };

  const fetchAttendanceDetails = async (selectedEmployeeEmpId) => {
    setModalLoading(true);
    try {
      const apiUserId = role === "Superadmin" ? loggedInUserId : loggedInUserId;
      
      const response = await axios.get(`https://sensitivetechcrm.onrender.com/attendance-all/${apiUserId}`);
      if (response.data) {
        const { firstDay, lastDay, totalDays } = getMonthDateRange(activeFilter === 'current' ? 0 : -1);
        
        let filteredRecords = response.data.filter(record => {
          const recordDate = new Date(record.date || record.createdAt);
          const dayMatch = dayFilter === 'all' || 
                         getDayName(record.date || record.createdAt) === dayFilter;
          
          return (
            recordDate >= firstDay &&
            recordDate <= lastDay &&
            dayMatch
          );
        });

        if (role === "Superadmin") {
          filteredRecords = filteredRecords.filter(record => 
            record.empId === selectedEmployeeEmpId || record.employeeId === selectedEmployeeEmpId
          );
        } else {
          filteredRecords = filteredRecords.filter(record => 
            record.empId === selectedEmployeeEmpId || record.employeeId === selectedEmployeeEmpId
          );
        }

        const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
        const absentCount = filteredRecords.filter(r => r.status === 'Absent').length;
        const remainingDays = totalDays - (presentCount + absentCount);

        setAttendanceSummary({
          present: presentCount,
          absent: absentCount,
          remainingDays: remainingDays > 0 ? remainingDays : 0
        });

        const recordsWithWorkingHours = filteredRecords.map(record => {
          let workingHours = 'N/A';
          
          if (record.logintime && record.logouttime) {
            const loginTime = convertTimeStringToDate(record.logintime);
            const logoutTime = convertTimeStringToDate(record.logouttime);
            
            if (loginTime && logoutTime) {
              const diffMs = logoutTime - loginTime;
              const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
              const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
              workingHours = `${diffHrs}h ${diffMins}m`;
            }
          }
          
          return {
            ...record,
            workingHours
          };
        });
        
        setAttendanceDetails(recordsWithWorkingHours);
      }
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      setError('Failed to load attendance details');
    } finally {
      setModalLoading(false);
    }
  };

  // Helper function to convert time string to Date object
  const convertTimeStringToDate = (timeStr) => {
    if (!timeStr) return null;
    
    // Remove AM/PM if present
    const cleanTimeStr = timeStr.replace(/[AP]M/i, '').trim();
    const [hours, minutes] = cleanTimeStr.split(':').map(Number);
    
    // Create a date object with today's date (we only care about time)
    const date = new Date();
    date.setHours(hours, minutes || 0, 0, 0);
    
    // Adjust for PM if needed
    if (timeStr.toUpperCase().includes('PM') && hours < 12) {
      date.setHours(hours + 12);
    }
    
    return date;
  };

  const getMonthDateRange = (monthOffset = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Set time to beginning and end of day respectively
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);

    return { 
      firstDay, 
      lastDay, 
      totalDays: lastDay.getDate() 
    };
  };

  const openModal = async (employee) => {
    setSelectedEmployee(employee);
    setModalIsOpen(true); // Show modal immediately
    // Start loading data after modal is shown
    await fetchAttendanceDetails(employee.empId);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEmployee(null);
    setAttendanceDetails([]);
    setAttendanceSummary({
      present: 0,
      absent: 0,
      remainingDays: 0
    });
    setDayFilter('all');
  };

  const applyMonthFilter = (filter) => {
    let result = [];

    if (filter === 'current') {
      result = payrollData
        .filter(employee => employee.currentMonth)
        .map((employee, index) => ({
          serial: index + 1,
          name: employee.name || '',
          empId: employee.empId || '',
          department: employee.department || '',
          totalDays: employee.currentMonth?.totalDays || 0,
          workingDays: employee.currentMonth?.workingDays || 0,
          salary: employee.salary || 0,
          present: employee.currentMonth?.present || 0,
          absent: employee.currentMonth?.absent || 0,
          lateDays: employee.currentMonth?.lateDays || 0,
          lateTime: employee.currentMonth?.lateTime || '0h 0m',
          allowances: employee.currentMonth?.totalAllowances || 0,
          deductions: employee.currentMonth?.totalDeductions || 0,
          advances: employee.currentMonth?.totalAdvances || 0,
          payable: employee.currentMonth?.payable || 0
        }));
    } else if (filter === 'previous') {
      result = payrollData
        .filter(employee => employee.previousMonth)
        .map((employee, index) => ({
          serial: index + 1,
          name: employee.name || '',
          empId: employee.empId || '',
          department: employee.department || '',
          totalDays: employee.previousMonth?.totalDays || 0,
          workingDays: employee.previousMonth?.workingDays || 0,
          salary: employee.salary || 0,
          present: employee.previousMonth?.present || 0,
          absent: employee.previousMonth?.absent || 0,
          lateDays: employee.previousMonth?.lateDays || 0,
          lateTime: employee.previousMonth?.lateTime || '0h 0m',
          allowances: employee.previousMonth?.totalAllowances || 0,
          deductions: employee.previousMonth?.totalDeductions || 0,
          advances: employee.previousMonth?.totalAdvances || 0,
          payable: employee.previousMonth?.payable || 0
        }));
    }

    console.log(`Filtered ${filter} month data:`, result);
    setFilteredData(result);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleCurrentMonth = () => {
    setActiveFilter('current');
  };

  const handlePreviousMonth = () => {
    setActiveFilter('previous');
  };

  const exportToExcel = () => {
    const monthLabel = activeFilter === 'current' ? 'Current' : 'Previous';

    const exportData = filteredData.map(item => ({
      'Name': item.name,
      'Employee ID': item.empId,
      'Department': item.department,
      'Working Days': item.workingDays || 0,
      'Total Days': item.totalDays || 0,
      'Salary': item.salary || 0,
      'Present': item.present || 0,
      'Absent': item.absent || 0,
      'Late Days': item.lateDays || 0,
      'Late Time': item.lateTime || '0h 0m',
      'Allowances': item.allowances || 0,
      'Deductions': item.deductions || 0,
      'Advance': item.advances || 0,
      'Payable': item.payable || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${monthLabel} Month Payroll`);
    XLSX.writeFile(workbook, `Payroll_Data_${monthLabel}_Month_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getMonthName = (monthOffset = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    return date.toLocaleString('default', { month: 'long' });
  };

  const currentMonthName = getMonthName(0);
  const previousMonthName = getMonthName(1);

  const handleEdit = (empId, e) => {
    e.stopPropagation();
    navigate(`/payroll-form/${empId}`);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    if (!timeStr.includes(" ")) return timeStr;

    const [time, modifier] = timeStr.split(" ");
    return `${time} ${modifier}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4 mt-24">
        <h1 className="text-2xl font-semibold text-gray-800">
          Payroll Table - {activeFilter === 'current' ? currentMonthName : previousMonthName}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousMonth}
            className={`px-4 py-2 rounded ${activeFilter === 'previous' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {previousMonthName}
          </button>
          <button
            onClick={handleCurrentMonth}
            className={`px-4 py-2 rounded ${activeFilter === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {currentMonthName}
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Export Data
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">S.No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Total Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Present</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Absent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Late Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Late Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Allowances</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Deductions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Advance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Payable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => openModal(row)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{row.serial}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div>
                        <span className="font-medium">{row.name}</span>
                        <br />
                        <span className="text-xs text-gray-700">EMPID: {row.empId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.totalDays}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.salary}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.present}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.absent}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.lateDays}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.lateTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.allowances}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.deductions}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.advances}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.payable}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button
                      onClick={(e) => handleEdit(row.empId, e)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="px-6 py-4 text-center text-sm text-gray-500">
                  No data available for {activeFilter === 'current' ? 'current' : 'previous'} month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Modal */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Attendance Details for {selectedEmployee?.name} ({activeFilter === 'current' ? currentMonthName : previousMonthName})
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Attendance Summary */}
            <div className="bg-blue-50 p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex justify-around flex-1">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Days</p>
                    <p className="text-lg font-semibold">{selectedEmployee?.totalDays || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-lg font-semibold text-green-600">{attendanceSummary.present}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Remaining Days</p>
                    <p className="text-lg font-semibold text-yellow-600">{attendanceSummary.remainingDays}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {modalLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="ml-4 text-gray-600">Loading attendance details...</p>
                </div>
              ) : attendanceDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Day</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Login Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Logout Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Working Hours</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceDetails.map((record, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatDate(record.date || record.createdAt)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {getDayName(record.date || record.createdAt)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatTime(record.logintime) || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatTime(record.logouttime) || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {record.workingHours || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No attendance records found for this period.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollEmployee;