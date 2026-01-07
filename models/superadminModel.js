const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  officeEmail: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {type: String,},
  adminType: {
    type: String,
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
