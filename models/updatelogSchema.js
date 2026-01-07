const mongoose = require('mongoose');
const dispositionSchema = new mongoose.Schema({
    disposition: {
        type: String,
        enum: [
            'No requirements', 
            'Callback', 
            'Busy', 
            'Disconnected', 
            'RNR / Voicemail', 
            'Not interested', 
            'Request Quote', 
            'Quotation Sent', 
            'Follow up', 
            'Invalid Number', 
            'Taken outside', 
            'Requirement on hold', 
            'Escalated', 
            'Schedule Meeting', 
            'Deal Closed', 
            'Others'
        ], 
        trim: true
    },
    notes: {
        type: String,
    }
}, {
    timestamps: true, 
});
const Disposition = mongoose.model('Disposition', dispositionSchema);

module.exports = Disposition;
