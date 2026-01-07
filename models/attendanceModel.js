const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  photo: { type: String },                     
  employeeId: { type: String },                
  employeeName: { type: String },             
  date: { type: Date },                      
  status: { type: String },                    
  logintime: { type: String },                
  logouttime: { type: String },
  workReport: { type: String },
  attachment: { type: String },                
}, { timestamps: true });                     

module.exports = mongoose.models.AttendanceModel || mongoose.model('AttendanceModel', attendanceSchema);