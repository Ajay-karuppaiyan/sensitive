const attendanceModel = require("../models/attendanceModel");
const employeeSchema = require("../models/employeeSchema");
const { uploadImage } = require("../config/cloudinary");

exports.createAttendance = async (req, res) => {
  try {
    console.log("CREATE Attendance", req.body);
    const empdata = await employeeSchema.findOne({ _id: req.body.employeeId }, { name: 1, empId: 1 })

    const attendance = new attendanceModel(req.body);
    attendance.employeeName = empdata.name
    attendance.employeeId = empdata.empId

    await attendance.save();

    res.status(201).json({ message: "Attendance record created successfully", attendance });
  } catch (error) {
    console.error("Error creating attendance record:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const { id } = req.params
    console.log(id)
    const empdata = await employeeSchema.findOne({ _id: id }, { role: 1,empId:1 })
    console.log("empdata puja", empdata)
    let attendanceRecords

    if (id == "6779360b3fb6809073b96ef4") {
      attendanceRecords = await attendanceModel.find();
    }
    else {
      attendanceRecords = await attendanceModel.find({ employeeId: empdata.empId });
    }
    console.log("GET all attendance records", attendanceRecords);
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: error.message });
  }
};
// exports.logoutAttendance = async (req, res) => {
//   try {
//     const { id } = req.params;  
//     const { logouttime } = req.body;
//     if (!logouttime) {
//       return res.status(400).json({ message: "Logout time is required" });
//     }
//     const updatedAttendance = await attendanceModel.findByIdAndUpdate(
//       id,
//       { logouttime: logouttime },
//       { new: true }
//     );

//     if (!updatedAttendance) {
//       return res.status(404).json({ message: "Attendance record not found" });
//     }

//     console.log("Updated logout time for attendance record:", updatedAttendance);
//     res.status(200).json({ message: "Logout time updated successfully", updatedAttendance });
//   } catch (error) {
//     console.error("Error updating logout time:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


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
    
    // Build update object
    const updateData = {
      logouttime: logouttime,
      workReport: workReport
    };
    
    // Upload attachment to Cloudinary if file exists
    if (req.file) {
      try {
        updateData.attachment = await uploadImage(req.file.buffer);
      } catch (uploadError) {
        console.error("Error uploading attachment to Cloudinary:", uploadError);
        return res.status(400).json({ message: "Failed to upload attachment" });
      }
    }
    
    const updatedAttendance = await attendanceModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    console.log("Updated logout time and work report for attendance record:", updatedAttendance);
    res.status(200).json({ 
      message: "Logout time and work report updated successfully", 
      updatedAttendance 
    });
    
  } catch (error) {
    console.error("Error updating logout time:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalAttendance = async (req, res) => {
  try {
    const totalAttendance = await attendanceModel.countDocuments();

    console.log("Total attendance count:", totalAttendance);
    res.status(200).json({ TotalAttendance: totalAttendance });
  } catch (error) {
    console.error("Error fetching total attendance:", error);
    res.status(500).json({ message: error.message });
  }
};