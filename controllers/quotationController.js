const Quotation = require('../models/quotationmodel');
const { uploadImage } = require("../config/cloudinary");
exports.createQuotation = async (req, res) => {
    try {
        const quotationData = req.body;
        console.log("CREATE LEAVE REQUEST", quotationData);
        if (req.file) {
            quotationData.quotation = await uploadImage(req.file.buffer);
        }
        const quotation = new Quotation(quotationData);
        await quotation.save();
        res.status(201).json({ message: 'Quotation created successfully', quotation });
    } catch (error) {
        res.status(500).json({ error: 'Error creating quotation', details: error.message });
    }
};
exports.getAllQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find();
        res.status(200).json(quotations);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quotations', details: error.message });
    }
};
exports.getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
        res.status(200).json(quotation);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quotation', details: error.message });
    }
};
exports.updateQuotation = async (req, res) => {
    try {
        const { id } = req.params;
        const quotationData = req.body;
        console.log("Update LEAVE REQUEST", quotationData);
        if (req.file) {
            quotationData.quotation = await uploadImage(req.file.buffer);
        }
        const quotation = await Quotation.findByIdAndUpdate(id, quotationData, { new: true });
        if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
        res.status(200).json({ message: 'Quotation updated successfully', quotation });
    } catch (error) {
        console.error("Error updating Quotation:", error);
        res.status(500).json({ error: "Failed to update Quotation." });
      }
};
exports.deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndDelete(req.params.id);
        if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
        res.status(200).json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting quotation', details: error.message });
    }
};
