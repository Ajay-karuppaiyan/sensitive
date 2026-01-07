const Disposition = require('../models/updatelogSchema');
const createOrUpdateDisposition = async (req, res) => {
    const { disposition, notes } = req.body;
    const { id } = req.params; 

    try {
        if (id) {
            const updatedDisposition = await Disposition.findByIdAndUpdate(id, { disposition, notes }, { new: true });

            if (!updatedDisposition) {
                return res.status(404).json({ message: 'Disposition not found' });
            }

            return res.status(200).json(updatedDisposition);
        } else {
            const newDisposition = new Disposition({ disposition, notes });
            await newDisposition.save();
            return res.status(201).json(newDisposition);
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const getAllDispositions = async (req, res) => {
    try {
        const dispositions = await Disposition.find();
        return res.status(200).json(dispositions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const getDispositionById = async (req, res) => {
    const { id } = req.params; 

    try {
        const disposition = await Disposition.findById(id); 

        if (!disposition) {
            return res.status(404).json({ message: 'Disposition not found' });
        }

        return res.status(200).json(disposition);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrUpdateDisposition, getAllDispositions, getDispositionById };
