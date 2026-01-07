const Expense = require("../models/expenseSchema");
const { uploadImage } = require("../config/cloudinary");
exports.createExpense = async (req, res) => {
    try {
        const expenseData = req.body;
        if (req.file) {
            expenseData.attachments = await uploadImage(req.file.buffer);
        }
        const newExpense = new Expense(expenseData); 
        await newExpense.save();

        res.status(201).json({ message: "Expense created successfully.", expense: newExpense });
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: "Failed to create expense." });
    }
};
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Failed to fetch expenses." });
    }
};
exports.updateExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (req.file) {
            updateData.attachments = await uploadImage(req.file.buffer);
        }
        const updatedExpense = await Expense.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedExpense) {
            return res.status(404).json({ error: "Expense not found." });
        }

        res.status(200).json({ message: "Expense updated successfully.", expense: updatedExpense });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ error: "Failed to update expense." });
    }
};
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({ error: "Expense not found." });
        }

        res.status(200).json(expense);
    } catch (error) {
        console.error("Error fetching expense:", error);
        res.status(500).json({ error: "Failed to fetch expense." });
    }
};

