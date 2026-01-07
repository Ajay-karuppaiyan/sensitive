const mongoose = require('mongoose');
const clientSchema = new mongoose.Schema({
  organization: { type: String },
  contactPerson: { type: String },
  contactNumber: { type: String },
  alternateContact: { type: String },
  emailId: { type: String },
  alternateMailId: { type: String },
  businessCategory: { type: String },
  officeLocation: {
    addressLine: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    landmark: { type: String },
  },
  registeredAddress: {
    addressLine: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    landmark: { type: String },
  },
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Clientmodel', clientSchema);
