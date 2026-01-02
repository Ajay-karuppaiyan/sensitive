import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { employeename, getLeaveById } from "../../api/services/projectServices";

function LeaveEdit() {
  const [leave, setLeave] = useState({
    employee: "",
    leaveCategory: "",
    leaveType: "",
    customLeaveType: "",
    customPermissonType: "",
    permissionDate: "",
    startDate: "",
    endDate: "",
    timeRange: "",
    remarks: "",
    attachment: "",
    status: "",
    startTime: "",
    endTime: "",
  });
  const [currentDate, setCurrentDate] = useState("");
  const taskid = localStorage.getItem("empId");
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const leaveTypes = ["Sick Leave", "Casual Leave", "Emergency Leave", "Others"];

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeename(`${taskid}`);
        if (response) {
          setEmployees(response.data);
          setError(null);
        } else {
          throw new Error("Failed to fetch employees.");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to fetch employees. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    setCurrentDate(new Date().toISOString().split("T")[0]);
  }, [role, taskid]);




  useEffect(() => {
    if (!id) return;

    const fetchLeaveDetails = async () => {
      try {
        const response = await getLeaveById(id);
        if (response.status === 200) {
          const fetchedLeave = response.data;
          setLeave({
            ...fetchedLeave,
            startDate: formatDateForInput(fetchedLeave.startDate),
            endDate: formatDateForInput(fetchedLeave.endDate),
            permissionDate: formatDateForInput(fetchedLeave.permissionDate),
          });
        } else {
          console.error("Failed to fetch leave details:", response.status);
        }
      } catch (error) {
        console.error("Error fetching leave details:", error);
      }
    };

    fetchLeaveDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setLeave((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      const response = await axios.put(
        `https://sensitivetechcrm.onrender.com/leaves/update-status/${leaveId}`,
        {
          status: newStatus,
          statusChangeDate: new Date().toISOString(),
        }
      );

      if (response.status === 200) {
        setLeave((prev) => ({
          ...prev,
          status: newStatus,
          statusChangeDate: new Date().toISOString(),
        }));
        alert("Status updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const finalLeaveType =
      leave.leaveType === "Others" ? leave.customLeaveType : leave.leaveType;

    const finalPermissionType =
      leave.leaveType === "Others" ? leave.customPermissionType : leave.leaveType;
    Object.keys(leave).forEach((key) => {
      if (key !== "attachment") {
        if (key === "leaveType") {
          formData.append("leaveType", leave.leaveCategory === "Leave" ? finalLeaveType : finalPermissionType);
        } else if (leave[key]) {
          formData.append(key, leave[key]); 
        }
      }
    });

    if (leave.attachment) {
      formData.append("attachment", leave.attachment);
    }

    try {
      const response = id
        ? await axios.put(`https://sensitivetechcrm.onrender.com/leaves/update/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        : await axios.post("https://sensitivetechcrm.onrender.com/leaves/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      if (response.status === 200 || response.status === 201) {
        alert("Leave data submitted successfully!");
        setLeave({
          employee: "",
          leaveCategory: "",
          leaveType: "",
          customLeaveType: "",
          customPermissonType: "", 
          permissionDate: "",
          startDate: "",
          endDate: "",
          timeRange: "",
          remarks: "",
          attachment: "",
          status: "",
          startTime: "",
          endTime: "",
        });
        navigate("/leave-table");
      } else {
        alert(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(`Submission failed: ${error.message}`);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-12">
      <h2 className="text-4xl font-bold mb-10 text-center mt-20">Leave Application Form</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="border border-blue-500 p-6 rounded-lg">
          <div className="space-y-8 pb-4">
            {role === "Superadmin" ? (
              <div>
                <label className="block text-sm font-medium pb-4">Select Employee:</label>
                <select
                  name="employee"
                  value={leave.employee}
                  onChange={handleChange}
                  required
                  className="border border-blue-300 p-2 w-full rounded"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium pb-4">Employee Name:</label>
                <input
                  type="text"
                  value={leave.employee}
                  readOnly
                  className="border border-blue-300 p-2 w-full rounded bg-gray-100"
                />
              </div>
            )}
            <div className="pb-4">
              <label className="block text-sm font-medium pb-4">Leave or Permission:</label>
              <div className="flex space-x-4">
                <div>
                  <input
                    type="radio"
                    id="leave"
                    name="leaveCategory"
                    value="Leave"
                    onChange={handleChange}
                    checked={leave.leaveCategory === "Leave"}
                    className="mr-2"
                  />
                  <label htmlFor="leave">Leave</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="permission"
                    name="leaveCategory"
                    value="Permission"
                    onChange={handleChange}
                    checked={leave.leaveCategory === "Permission"}
                    className="mr-2"
                  />
                  <label htmlFor="permission">Permission</label>
                </div>
              </div>
            </div>
            {leave.leaveCategory === "Leave" && (
              <div>
                <label className="block text-sm font-medium pb-4">Leave Type:</label>
                <select
                  name="leaveType"
                  value={leave.leaveType}
                  onChange={handleChange}
                  required
                  className="border border-blue-300 p-2 w-full rounded"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {leave.leaveType === "Others" && leave.leaveCategory === "Leave" && (
              <div>
                <label className="block text-sm font-medium pb-4">Specify Leave Type:</label>
                <textarea
                  name="customLeaveType"
                  value={leave.customLeaveType}
                  onChange={handleChange}
                  className="border border-blue-300 p-2 w-full rounded"
                  placeholder="Enter custom leave type"
                />
              </div>
            )}
            {leave.leaveCategory === "Leave" && (
              <div>
                <label className="block text-sm font-medium pb-4">Leave Dates:</label>
                <div className="flex space-x-4">
                  <input
                    type="date"
                    name="startDate"
                    value={leave.startDate}
                    onChange={handleChange}
                    className="border border-blue-300 p-2 w-full rounded"
                    required
                    min={currentDate}
                  />
                  <span className="pt-2">to</span>
                  <input
                    type="date"
                    name="endDate"
                    value={leave.endDate}
                    onChange={handleChange}
                    className="border border-blue-300 p-2 w-full rounded"
                    required
                    min={currentDate}
                  />
                </div>
              </div>
            )}
            {leave.leaveCategory === "Permission" && (
              <div>
                <label className="block text-sm font-medium pb-4">Permission Type:</label>
                <select
                  name="leaveType"
                  value={leave.leaveType}
                  onChange={handleChange}
                  required
                  className="border border-blue-300 p-2 w-full rounded"
                >
                  <option value="">Select Permission Type</option>
                  {leaveTypes
                    .filter(type => type.includes("Permission") || type === "Others")
                    .map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {leave.leaveType === "Others" && leave.leaveCategory === "Permission" && (
              <div>
                <label className="block text-sm font-medium pb-4">Specify Permission Type:</label>
                <textarea
                  name="customPermissionType"
                  value={leave.customPermissonType}
                  onChange={handleChange}
                  className="border border-blue-300 p-2 w-full rounded"
                  placeholder="Enter custom permission type"
                />
              </div>
            )}
            {leave.leaveCategory === "Permission" && (
              <div>
                <label className="block text-sm font-medium pb-4">Permission Date:</label>
                <input
                  type="date"
                  name="permissionDate"
                  value={leave.permissionDate}
                  onChange={handleChange}
                  className="border border-blue-300 p-2 w-full rounded"
                  required
                  min={currentDate}
                />
              </div>
            )}
            {leave.leaveCategory === "Permission" && (
              <div>
                <label className="block text-sm font-medium pb-4">Time Range:</label>
                <div className="flex space-x-4">
                  <input
                    type="time"
                    name="startTime"
                    value={leave.startTime}
                    onChange={handleChange}
                    className="border border-blue-300 p-2 w-full rounded"
                    required
                  />
                  <span className="pt-2">to</span>
                  <input
                    type="time"
                    name="endTime"
                    value={leave.endTime}
                    onChange={handleChange}
                    className="border border-blue-300 p-2 w-full rounded"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border border-blue-500 p-6 rounded-lg">
          <div className="space-y-8 pb-4">
            <div>
              <label className="block text-sm font-medium pb-4">Remarks:</label>
              <textarea
                name="remarks"
                value={leave.remarks}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
                placeholder="Add any remarks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium pb-4">Attachment:</label>
              {leave.attachment && (
                <div>
                  <img
                    src={leave.attachment}
                    alt="Attachment"
                    className="w-32 h-32 object-cover rounded mb-4"
                  />
                </div>
              )}
              <input
                type="file"
                name="attachment"
                onChange={handleFileChange}
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium pb-4">Status:</label>
              <select
                name="status"
                value={leave.status}
                onChange={(e) => handleStatusChange(id, e.target.value)}
                required
                className="border border-blue-300 p-2 w-full rounded"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div> */}
          </div>
        </div>
        <div className="col-span-2 flex justify-center mt-6">
          <button
            type="submit"
            className="bg-[#2563eb] text-white border border-black px-8 py-2 rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default LeaveEdit;

