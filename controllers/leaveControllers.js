const leaveModel = require("../models/leaveModel");
const { uploadImage } = require("../config/cloudinary");
const employeeSchema = require("../models/employeeSchema");
exports.createLeaveRequest = async (req, res) => {
  try {
    const leaveData =  req.body;
    console.log("CREATE LEAVE REQUEST", leaveData);
    if (req.file) {
      leaveData.attachment = await uploadImage(req.file.buffer);
  }

    const leaveRequest = new leaveModel(leaveData);
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request created successfully', leaveRequest });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(400).json({ message: error.message });
  }
};
exports.getAllLeaveRequests = async (req, res) => {
  try{
    const {id} = req.params;
    console.log("User ID", id);
    const empdata = await employeeSchema.findOne({_id: id}, {role:1, empId:1, name:1});
    if(!empdata){
      return res.status(404).json({message: "Employee not found"});
    }
    console.log("Employee Data:", empdata);
    let leaves;
    if(empdata.role ==="Superadmin"){
      leaves = await leaveModel.find()
    }else{
      leaves = await leaveModel.find({
        "employee":empdata.name
      });
    }
    console.log("Leave:", leaves);
    res.status(200).json(leaves);
  } catch (error){
    console.error("Error fetching Leaves:", error);
    res.status(500).json({message: "Error fetching Leaves"});
  }
}

exports.getLeaveRequestById = async (req, res) => {
  try {
    console.log("Fetching leave request by ID", req.params.id);
    const leaveRequest = await leaveModel.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.status(200).json(leaveRequest);
  } catch (error) {
    console.error('Error fetching leave request by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (req.file) {
      updateData.attachment = await uploadImage(req.file.buffer); 
  }
  const leaveRequest = await leaveModel.findByIdAndUpdate(id, updateData, { new: true });

  if (!leaveRequest) {
      return res.status(404).json({ error: "Leave not found." });
  }

  res.status(200).json({ message: "Leave updated successfully.", leave: leaveRequest });
} catch (error) {
  console.error("Error updating Leave:", error);
  res.status(500).json({ error: "Failed to update Leave." });
}
};

exports.deleteLeaveRequestById = async (req, res) => {
  try {
    const leaveRequest = await leaveModel.findByIdAndDelete(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeaveRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const leaveRequest = await leaveModel.findByIdAndUpdate(
      id,
      { 
        status,
        statusChangeDate: new Date()
      },
      { new: true } 
    );

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ 
      message: 'Leave request status updated successfully', 
      leaveRequest 
    });

  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ message: error.message });
  }
};





// exports.updateLeaveRequestStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;
//   const userRole = req.user.role; // Assuming you're using authentication middleware

//   if (userRole !== "Superadmin") {
//     return res.status(403).json({ message: "You don't have permission to change the status" });
//   }

//   if (!status) {
//     return res.status(400).json({ message: 'Status is required' });
//   }

//   try {
//     const leaveRequest = await leaveModel.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );
//     if (!leaveRequest) {
//       return res.status(404).json({ message: 'Leave request not found' });
//     }
//     res.status(200).json({ message: 'Leave request status updated successfully', leaveRequest });
//   } catch (error) {
//     console.error('Error updating leave request status:', error);
//     res.status(500).json({ message: error.message });
//   }
// };



// Get total leave requests count

exports.getTotalLeaveRequests = async (req, res) => {
  try {
    const totalLeaveRequests = await leaveModel.countDocuments();

    console.log("Total leave requests count:", totalLeaveRequests);
    res.status(200).json({ TotalLeaveRequests: totalLeaveRequests });
  } catch (error) {
    console.error("Error fetching total leave requests:", error);
    res.status(500).json({ message: error.message });
  }
};
