const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectDetails: [{
    projectName: { type: String },
    type: { type: String },
    requirements: { type: String },
    description: { type: String },
    category: { type: String },
    techStack: { type: String },
    domain: { type: String },
    designation: { type: String },
    addOnServices: { type: String },
    duration: { type: String },
    dependencies: { type: String },
    companyName: { type: String },
    task: { type: String },
  }],
  financialDetails: [{
    quotedValue: { type: String },
    approvedValue: { type: String },
    paymentTerms: { type: String },
    finalQuotation: { type: String },
    taxTerms: { type: String },
  }],
  additionalDetails: [{
    projectDocument: [],
    nda: { type: String },
    msa: { type: String },
    assignedTo: { type: String },
    status: { type: String },
    createdDate: { type: String },
  }],
}, { timestamps: true });


module.exports = mongoose.model("Project", projectSchema);
