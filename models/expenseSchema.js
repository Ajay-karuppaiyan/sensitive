const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    type: { type: String, },
    project: { type: String, default: "" },
    amount: { type: Number, },
    attachments: { type: String, default: "" },
    notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
