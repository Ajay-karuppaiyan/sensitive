const express = require("express");
const expenseRouter = express.Router();
const expenseController = require("../controllers/expenseController");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

expenseRouter.post("/createexpense", upload.single("attachments"), expenseController.createExpense);
expenseRouter.get("/getallexpense", expenseController.getAllExpenses);
expenseRouter.get("/getexpense/:id", expenseController.getExpenseById);
expenseRouter.put("/updateexpense/:id", upload.single("attachments"), expenseController.updateExpenseById);

module.exports = expenseRouter;
