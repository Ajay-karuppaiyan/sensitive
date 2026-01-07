const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    project: { type: String,},
    paymentType: { type: String,},
    amount: { type: Number,},
    mode: { type: String,},
    date: { type: Date,},
    tdsApplicable: { type: String,},
    taxApplicable: { type: String,},
    paymentReferenceNumber: { type: String,},
    paymentQuotation: { type: String },
    paymentProof: { type: String },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
