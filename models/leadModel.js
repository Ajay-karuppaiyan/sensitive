const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {type: String,},
    password: { type: String,  },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    requirements: { type: String },
    company: { type: String },
    location: { type: String },
    links: { type: String },
    comments: { type: String },
    status: { type: String, default: 'Pending' },
  },
  {
    timestamps: true, 
  }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
