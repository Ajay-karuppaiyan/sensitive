const express = require('express');
const taskRouter = express.Router();
const taskController = require('../controllers/taskController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



taskRouter.get('/getalltask/:id', taskController.getAllTasks); 
taskRouter.get('/gettaskbyid/:id', taskController.getTaskById); 
taskRouter.put('/updatetask/:id', upload.single("attachments"), taskController.updateTask); 
taskRouter.delete('/deletetask/:id', taskController.deleteTask); 
taskRouter.post('/createtask',upload.single("attachments"), taskController.createTask);
taskRouter.put('/update-status/:id',taskController.updateTaskStatus); 
taskRouter.get('/totaltasks', taskController.getTotalTasks);
taskRouter.get("/employee/:empId", taskController.getTasksByEmployee);

module.exports = taskRouter;
