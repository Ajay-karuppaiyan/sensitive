const Task = require("../models/taskSchema"); 
const { uploadImage } = require("../config/cloudinary");
const employeeSchema = require("../models/employeeSchema");

const createTask = async (req, res) => {
  try {
      const taskData = req.body;
      console.log("req.body", req.body);
      if (req.file) {
          taskData.attachments = await uploadImage(req.file.buffer);
      }
      const newTask = new Task(taskData); 

      await newTask.save();

      res.status(201).json({
          message: 'Task created successfully',
          task: newTask,  
      });
  } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
          message: 'Error creating task',
          error: error.message,
      });
  }
};
const getAllTasks = async (req, res) => {
  try{
    const {id} = req.params;
    console.log("User ID", id);
    const empdata = await employeeSchema.findOne({_id: id}, {role: 1, empId:1, name:1 });
      if(!empdata) {
        return res.status(404).json({message: "Employee not found"});

      }
      console.log("Employee Data:", empdata);
    let tasks;
    if(empdata.role === "Superadmin"){
      tasks = await Task.find()
      
    }else {
      tasks = await Task.find({
        "empId": empdata.name
      });
    }
    console.log("Task:", tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching Tasks:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};
const getTaskById = async (req, res) => {
  console.log("Edit task==>")
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    console.log("task",task)
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving task",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  console.log("Update task",req.body)

  try {
    const { id } = req.params;
    const updateData = req.body;
    if (req.file) {
      updateData.attachments = await uploadImage(req.file.buffer);
  }
   const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating task",
      error: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status }, 
      { new: true } 
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating task status",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting task",
      error: error.message,
    });
  }
};

const getTotalTasks = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();

    console.log("Total tasks count:", totalTasks);
    res.status(200).json({ TotalTasks: totalTasks });
  } catch (error) {
    console.error("Error fetching total tasks:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus, 
  deleteTask,
  getTotalTasks,
};
