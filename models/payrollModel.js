const mongoose = require("mongoose");

const PayrollSchema = new mongoose.Schema({
    empId: { 
      type: String,
    },
    type: { type: String,  },
    month: { type: String },
    amount: { type: String, },
    note: { type: String },
 }, { timestamps: true });

module.exports = mongoose.model("Payroll", PayrollSchema);
