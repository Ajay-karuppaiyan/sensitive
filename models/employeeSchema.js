const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  addressLine: { type: String,  },
  area: { type: String,  },
  city: { type: String,  },
  state: { type: String,  },
  pincode: { type: String,  },
  landmark: { type: String, },
});

const EmployeeSchema = new mongoose.Schema({
  empId: { type: String, },
  role: {type: String,},
  empType: {type: String,},
  workMode: {type: String,},
  shiftType: {type: String,},
  salary: {type: String,},
  name: { type: String,  },
  gender: { type: String,  },
  dob: { type: Date,  },
  email: { type: String, },
  officeEmail: { type: String, },
  alternateEmail: { type: String, },
  contactNumber: { type: String,  },
  alternateContact: { type: String, },
  department: { type: String,  },
  designation: { type: String,  },
  idProofType: { type: String,  },
  idProofNumber: { type: String,  },
  idProofFile: { type: String, },
  qualification: { type: String,  },
  expertise: { type: String,  },
  experience: { type: String,  },
  resume: { type: String, },
  doj: { type: Date,  },
  maritalStatus: { type: String,  },
  presentAddress: { type: AddressSchema,  },
  permanentAddress: { type: AddressSchema,  },
  addressProofType: { type: String,  },
  addressProofNumber: { type: String,  },
  addressProofFile: { type: String, },
  profileImage:{ type: String, },
  password: { type: String,  },
  status: { type: String, default: "Active" },
  shiftStartTime: { type: String, required: true }, 
  shiftEndTime: { type: String, required: true }, 
}, { timestamps: true });                     


module.exports = mongoose.model("Employee", EmployeeSchema);
