const Payroll = require("../models/payrollModel");
exports.createPayroll = async (req, res) => {
    try {
        const { empId, type, month, amount, note } = req.body;
        const payroll = new Payroll({ empId, type, month, amount, note });
        await payroll.save();
        res.status(201).json({ message: "Payroll entry created successfully", payroll });
    } catch (error) {
        res.status(500).json({ message: "Error creating payroll", error });
    }
};
exports.getPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find().populate("empId", "name");
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: "Error fetching payrolls", error });
    }
};
exports.getPayrollById = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate("empId", "name");
        if (!payroll) return res.status(404).json({ message: "Payroll not found" });
        res.json(payroll);
    } catch (error) {
        res.status(500).json({ message: "Error fetching payroll", error });
    }
};

exports.deletePayroll = async (req, res) => {
  const { id } = req.params;
  try {
    const payroll = await Payroll.findByIdAndDelete(id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }
    res.status(200).json({ message: "Payroll deleted successfully" });
  } catch (error) {
    console.error("Error deleting Payroll:", error);
    res.status(500).json({ message: "Error deleting Payroll" });
  }
};

exports.updatePayroll = async (req, res) => {
    const { id } = req.params;
    const { empId, type, amount, note } = req.body;

    try {
        const payroll = await Payroll.findByIdAndUpdate(
            id,
            { empId, type, amount, note },
            { new: true }
        ).populate("empId", "name");

        if (!payroll) {
            return res.status(404).json({ message: "Payroll not found" });
        }

        res.status(200).json({ message: "Payroll updated successfully", payroll });
    } catch (error) {
        console.error("Error updating payroll:", error);
        res.status(500).json({ message: "Error updating payroll", error });
    }
};
exports.getTotalPayrolls = async (req, res) => {
    try {
      const totalPayrolls = await Payroll.countDocuments();
  
      console.log("Total payrolls count:", totalPayrolls);
      res.status(200).json({ TotalPayrolls: totalPayrolls });
    } catch (error) {
      console.error("Error fetching total payrolls:", error);
      res.status(500).json({ message: error.message });
    }
  };
  