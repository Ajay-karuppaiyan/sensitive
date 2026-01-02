import React, { useState, useEffect } from "react";
import axios from "axios";
import { employeename } from "../../api/services/projectServices";
import { useNavigate } from "react-router-dom";

function Leave() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const id = localStorage.getItem("empId");
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
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
    startTime: "",
    endTime: "",
  });

  const [currentDate, setCurrentDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const response = await employeename(`${id}`);
        console.log("Employees fetched:", response);

        if (response) {
          setEmployees(response.data);
          setError(null);

          if (role !== "Superadmin" && response.data.length > 0) {
            setLeave((prev) => ({ ...prev, employee: response.data[0].name }));
          }
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

    fetchEmployeeData();
    setCurrentDate(new Date().toISOString().split("T")[0]);
  }, [role, id]);


  const leaveTypes = ["Sick Leave", "Casual Leave", "Emergency Leave", "Sick Permission", "Casual Permission", "Emergency Permission", "Others",];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setLeave((prev) => ({ ...prev, [name]: files[0] }));
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
        } else {
          formData.append(key, leave[key]);
        }
      }
    });

    if (leave.attachment) {
      formData.append("attachment", leave.attachment);
    }

    try {
      const response = await axios.post(
        "https://sensitivetechcrm.onrender.com/leaves/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);

      if (response.status === 201) {
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
          startTime: "",
          endTime: "",
        });
        navigate("/leave-table");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("There was an error submitting the data.");
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
              <label className="block text-sm font-medium pb-4">Category:</label>
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
                  {leaveTypes
                    .filter(type => !type.includes("Permission"))
                    .map((type, index) => (
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
              <input
                type="file"
                name="attachment"
                onChange={handleFileChange}
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>


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

export default Leave;
