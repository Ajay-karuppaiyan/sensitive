const express = require("express");
const payrollRouter = express.Router();
const payrollController = require("../controllers/payrollController");

payrollRouter.post("/createpayroll", payrollController.createPayroll);
payrollRouter.get("/getpayroll", payrollController.getPayrolls);
payrollRouter.get("/getpayrollbyid/:id", payrollController.getPayrollById);
payrollRouter.delete("/deletepayroll/:id", payrollController.deletePayroll);
payrollRouter.put("/updatepayroll/:id", payrollController.updatePayroll);
payrollRouter.get("/totalpayrolls", payrollController.getTotalPayrolls);

module.exports = payrollRouter;
