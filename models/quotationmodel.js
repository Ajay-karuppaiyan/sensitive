const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
    name: { type: String, },
    contact: { type: String, },
    requirement: { type: String, },
    techStack: { type: String },
    company: { type: String },
    quote: { type: String, },
    note: { type: String },
    quotation: { type: String },
    status: { type: String, enum: ['Pending', 'Sent', 'Accepted', 'Rejected', 'In Negotiation'], default: 'Pending' },
    quotationDate: { type: String },
    updateLog: { type: String }
}, { timestamps: true });

const Quotation = mongoose.model('Quotation', QuotationSchema);

module.exports = Quotation;
