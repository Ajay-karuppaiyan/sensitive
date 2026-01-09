const attendanceModel = require("../models/attendanceModel");
const employeeSchema = require("../models/employeeSchema");
const { uploadImage } = require("../config/cloudinary"); 

/* =============================== CREATE ATTENDANCE (LOGIN) ================================ */ 
exports.createAttendance = async (req, res) => { 
    try { 
        console.log("CREATE Attendance", req.body); 
        const { employeeId } = req.body;

        // Validate employee 
        const empdata = await employeeSchema.findById(employeeId, { name: 1, empId: 1 }); 
        if (!empdata) { 
            return res.status(404).json({ message: "Employee not found" });
        } 

        const attendance = new attendanceModel({ 
            ...req.body, 
            employeeName: empdata.name, 
            employeeId: empdata._id, // ✅ MongoDB _id 
            empId: empdata.empId // optional, useful for display 
        }); 

        await attendance.save(); 
        res.status(201).json({ message: "Attendance record created successfully", attendance }); 
    } 
    catch (error) { 
        console.error("Error creating attendance:", error); 
        res.status(400).json({ message: error.message });
    } 
}; 

/* =============================== GET ALL ATTENDANCE ADMIN → ALL EMPLOYEE → OWN ================================ */ 
exports.getAllAttendance = async (req, res) => { 
    try { 
        const { id } = req.params; 
        const empdata = await employeeSchema.findById(id, { role: 1 }); 

        if (!empdata) { 
            return res.status(404).json({ message: "Employee not found" }); 
        } 

        let attendanceRecords; 
        if (empdata.role === "admin") { 
            attendanceRecords = await attendanceModel.find().sort({ createdAt: -1 }); 
        } else { 
            attendanceRecords = await attendanceModel.find({ employeeId: empdata._id }).sort({ createdAt: -1 }); 
        } 

        console.log("GET Attendance Records:", attendanceRecords); 
        res.status(200).json(attendanceRecords); 
    } 
    catch (error) { 
        console.error("Error fetching attendance:", error); 
        res.status(500).json({ message: error.message }); 
    } 
}; 

/* =============================== LOGOUT ATTENDANCE ================================ */ 
exports.logoutAttendance = async (req, res) => { 
    try { 
        const { id } = req.params; 
        const { logouttime, workReport } = req.body; 

        if (!logouttime) { 
            return res.status(400).json({ message: "Logout time is required" }); 
        } 

        if (!workReport) { 
            return res.status(400).json({ message: "Work report is required" }); 
        } 

        const updateData = { logouttime, workReport }; 

        // Upload attachment if exists 
        if (req.file) { 
            try { 
                updateData.attachment = await uploadImage(req.file.buffer); 
            } 
            catch (uploadError) { 
                console.error("Cloudinary upload failed:", uploadError); 
                return res.status(400).json({ message: "Attachment upload failed" }); 
            } 
        } 

        const updatedAttendance = await attendanceModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }); 
        if (!updatedAttendance) { 
            return res.status(404).json({ message: "Attendance record not found" }); 
        } 

        res.status(200).json({ message: "Logout successful", updatedAttendance }); 
    } 
    catch (error) { 
        console.error("Error updating logout:", error); 
        res.status(500).json({ message: error.message }); 
    } 
}; 

/* =============================== TOTAL ATTENDANCE COUNT ================================ */ 
exports.getTotalAttendance = async (req, res) => { 
    try { 
        const totalAttendance = await attendanceModel.countDocuments(); 
        res.status(200).json({ TotalAttendance: totalAttendance }); 
    } 
    catch (error) { 
        console.error("Error fetching total attendance:", error); 
        res.status(500).json({ message: error.message }); 
    } 
}; 

/* =============================== ADMIN: TOTAL PRESENT TODAY ================================ */ 
exports.getTodayPresentCount = async (req, res) => { 
    try { 
        // Get today's date in YYYY-MM-DD format 
        const today = new Date().toISOString().split("T")[0]; 

        // Count employees who logged in today 
        const presentCount = await attendanceModel.countDocuments({ date: today }); 
        res.status(200).json({ date: today, presentToday: presentCount || 0 }); 
    } 
    catch (error) { 
        console.error("Error fetching today's present count:", error); 
        res.status(500).json({ message: error.message }); 
    } 
}; 

/* =============================== EMPLOYEE: MONTHLY LOGIN COUNT ================================ */ 
// const getMyMonthlyAttendanceCount = async (req, res) => {
//   try {
//     // Get empId from login/session/token (example: from req.user or req.params)
//     const empId = req.params.empId; // or req.user.empId if using auth middleware

//     // Find employee document
//     const employee = await Employee.findOne({ empId: empId });
//     if (!employee) return res.status(404).json({ count: 0, message: "Employee not found" });

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

//     // Count attendance for this employee in current month
//     const count = await Attendance.countDocuments({
//       employee: employee._id,
//       date: { $gte: startOfMonth, $lte: endOfMonth },
//     });

//     return res.status(200).json({ count }); // returns only the number
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = getMyMonthlyAttendanceCount;

exports.getMonthlyAttendanceForEmployee = async (req, res) => {
  try {
    const { empId } = req.params;

    const employee = await employeeSchema.findOne(
      { empId },
      { empId: 1, name: 1 }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0, 0, 0, 0
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    const totalAttendance = await attendanceModel.countDocuments({
      employeeId: empId,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    res.status(200).json({
      empId: employee.empId,
      employeeName: employee.name,
      month: now.toLocaleString("default", { month: "long" }),
      year: now.getFullYear(),
      totalAttendance,
    });
  } catch (error) {
    console.error("Monthly Attendance Error:", error);
    res.status(500).json({ message: error.message });
  }
};