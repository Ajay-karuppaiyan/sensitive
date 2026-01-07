import React, { useState, useEffect } from "react";
import axios from "axios";
import { employeename } from "../../api/services/projectServices";
import { useNavigate } from "react-router-dom";

function Leave() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const id = localStorage.getItem("empId");
  const [role] = useState(localStorage.getItem("role") || "Superadmin");

  const [leave, setLeave] = useState({
    employee: "",
    leaveCategory: "",
    leaveType: "",
    customLeaveType: "",
    customPermissonType: "",
    permissionDate: "",
    startDate: "",
    endDate: "",
    remarks: "",
    attachment: "",
    startTime: "",
    endTime: "",
  });

  const [currentDate, setCurrentDate] = useState("");
  const navigate = useNavigate();

  /* ================= FETCH EMPLOYEE ================= */
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const response = await employeename(`${id}`);

        if (response) {
          setEmployees(response.data);

          if (role !== "Superadmin" && response.data.length > 0) {
            setLeave((prev) => ({
              ...prev,
              employee: response.data[0].name,
            }));
          }
        } else {
          throw new Error("Failed to fetch employees");
        }
      } catch (err) {
        setError("Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
    setCurrentDate(new Date().toISOString().split("T")[0]);
  }, [role, id]);

  const leaveTypes = [
    "Sick Leave",
    "Casual Leave",
    "Emergency Leave",
    "Sick Permission",
    "Casual Permission",
    "Emergency Permission",
    "Others",
  ];

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeave((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setLeave((prev) => ({ ...prev, attachment: e.target.files[0] }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ DATE VALIDATION (IMPORTANT)
    if (leave.leaveCategory === "Leave") {
      if (new Date(leave.endDate) < new Date(leave.startDate)) {
        alert("End date cannot be earlier than start date");
        return;
      }
    }

    if (leave.leaveCategory === "Permission") {
      if (new Date(leave.permissionDate) < new Date(currentDate)) {
        alert("Permission date cannot be in the past");
        return;
      }
    }

    const formData = new FormData();

    const finalLeaveType =
      leave.leaveType === "Others"
        ? leave.customLeaveType
        : leave.leaveType;

    Object.keys(leave).forEach((key) => {
      if (key !== "attachment") {
        if (key === "leaveType") {
          formData.append(
            "leaveType",
            finalLeaveType
          );
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
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 201) {
        alert("Leave applied successfully");
        navigate("/leave-table");
      }
    } catch (err) {
      alert("Error submitting leave");
    }
  };

  /* ================= LOADING / ERROR ================= */
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );

  /* ================= UI ================= */
  return (
    <div className="container mx-auto p-6 mt-12">
      <h2 className="text-4xl font-bold mb-10 text-center mt-20">
        Leave Application Form
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="border border-blue-500 p-6 rounded-lg space-y-6">
          {role === "Superadmin" ? (
            <div>
              <label className="block pb-2 font-medium">Select Employee</label>
              <select
                name="employee"
                value={leave.employee}
                onChange={handleChange}
                required
                className="border p-2 w-full rounded"
              >
                <option value="">Select</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block pb-2 font-medium">Employee</label>
              <input
                readOnly
                value={leave.employee}
                className="border p-2 w-full rounded bg-gray-100"
              />
            </div>
          )}

          {/* CATEGORY */}
          <div>
            <label className="block pb-2 font-medium">Category</label>
            <div className="flex gap-6">
              <label>
                <input
                  type="radio"
                  name="leaveCategory"
                  value="Leave"
                  checked={leave.leaveCategory === "Leave"}
                  onChange={handleChange}
                />{" "}
                Leave
              </label>
              <label>
                <input
                  type="radio"
                  name="leaveCategory"
                  value="Permission"
                  checked={leave.leaveCategory === "Permission"}
                  onChange={handleChange}
                />{" "}
                Permission
              </label>
            </div>
          </div>

          {/* LEAVE */}
          {leave.leaveCategory === "Leave" && (
            <>
              <select
                name="leaveType"
                value={leave.leaveType}
                onChange={handleChange}
                required
                className="border p-2 w-full rounded"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes
                  .filter((t) => !t.includes("Permission"))
                  .map((t, i) => (
                    <option key={i}>{t}</option>
                  ))}
              </select>

              <div className="flex gap-4">
                <input
                  type="date"
                  name="startDate"
                  min={currentDate}
                  value={leave.startDate}
                  onChange={handleChange}
                  required
                  className="border p-2 w-full rounded"
                />
                <input
                  type="date"
                  name="endDate"
                  min={leave.startDate || currentDate}
                  value={leave.endDate}
                  onChange={handleChange}
                  required
                  className="border p-2 w-full rounded"
                />
              </div>
            </>
          )}

          {/* PERMISSION */}
          {leave.leaveCategory === "Permission" && (
            <>
              <input
                type="date"
                name="permissionDate"
                min={currentDate}
                value={leave.permissionDate}
                onChange={handleChange}
                required
                className="border p-2 w-full rounded"
              />

              <div className="flex gap-4">
                <input
                  type="time"
                  name="startTime"
                  value={leave.startTime}
                  onChange={handleChange}
                  required
                  className="border p-2 w-full rounded"
                />
                <input
                  type="time"
                  name="endTime"
                  value={leave.endTime}
                  onChange={handleChange}
                  required
                  className="border p-2 w-full rounded"
                />
              </div>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="border border-blue-500 p-6 rounded-lg space-y-6">
          <textarea
            name="remarks"
            value={leave.remarks}
            onChange={handleChange}
            required
            placeholder="Remarks"
            className="border p-2 w-full rounded"
          />

          <input
            type="file"
            onChange={handleFileChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="col-span-2 flex justify-center">
          <button className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Leave;
