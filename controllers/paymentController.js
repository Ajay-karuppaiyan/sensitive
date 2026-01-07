const Payment = require('../models/paymentSchema');
const { uploadImage } = require("../config/cloudinary");
exports.createPayment = async (req, res) => {
    try {
        const paymentData = req.body;
        if (req.files) {
            if (req.files.paymentQuotation) {
                paymentData.paymentQuotation = await uploadImage(req.files.paymentQuotation[0].buffer);
            }
            if (req.files.paymentProof) {
                paymentData.paymentProof = await uploadImage(req.files.paymentProof[0].buffer);
            }
        }

        const newPayment = new Payment(paymentData);
        await newPayment.save();
        res.status(201).json({ message: 'Payment created successfully!', newPayment });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
};
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find();
        res.status(200).json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};
exports.getPaymentById = async (req, res) => {
    try {
        const paymentId = req.params.id;
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.status(200).json({ payment });
    } catch (error) {
        console.error('Error fetching payment by ID:', error);
        res.status(500).json({ error: 'Failed to fetch payment by ID' });
    }
};
exports.updatePaymentById = async (req, res) => {
    try {
        const paymentId = req.params.id;
        const updatedData = req.body;
        if (req.files) {
            if (req.files.paymentQuotation) {
                updatedData.paymentQuotation = await uploadImage(req.files.paymentQuotation[0].buffer);
            }
            if (req.files.paymentProof) {
                updatedData.paymentProof = await uploadImage(req.files.paymentProof[0].buffer);
            }
        }

        const updatedPayment = await Payment.findByIdAndUpdate(paymentId, updatedData, { new: true });

        if (!updatedPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.status(200).json({ message: 'Payment updated successfully!', updatedPayment });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Failed to update payment' });
    }
};
