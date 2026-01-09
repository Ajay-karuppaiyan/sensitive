const Project = require("../models/pojectSchema");
const employeeSchema = require("../models/employeeSchema");

const createProject = async (req, res) => {
  try {
    const { projectDetails, financialDetails, additionalDetails } = req.body;
    console.log("Received Data:", req.body); 
    const newProject = new Project({
      projectDetails,
      financialDetails,
      additionalDetails,
    });
    await newProject.save();

    res.status(201).json({ message: "Project created successfully", newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const { id } = req.params; 
    console.log("User  ID:", id);
    const empdata = await employeeSchema.findOne({ _id: id }, { role: 1, empId: 1, name: 1 });
    if (!empdata) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Employee Data:", empdata);

    let projects;
      if (empdata.role === "Superadmin") {
      projects = await Project.find();
    } else {
      projects = await Project.find({
        "additionalDetails.assignedTo": empdata.name
      });
    }

    console.log("Projects:", projects);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};

const getProjectById = async (req, res) => {
  const { id } = req.params;
  console.log("id ",id)
  try {
    const project = await Project.findOne(
      { _id: id },
      {
        "projectDetails._id": 0,
        "financialDetails._id": 0,
        "additionalDetails._id": 0
      }
    ).lean();
    

    
    console.log(project);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({ message: "Error fetching project" });
  }
};

const updateProjectById = async (req, res) => {
  const { id } = req.params;
  const { projectDetails, financialDetails, additionalDetails } = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { projectDetails, financialDetails, additionalDetails },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project updated successfully", updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};

const deleteProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
};

const getProjectNames = async(req,res) => {
  try {
    const projects = await Project.find({},{_id:1, "projectDetails.projectName":1})
    console.error("projects", projects);
  
    res.json(projects);
  } catch (error) {
    res.status(500).json({message: "Error Fetching projects"});
  }
};

const getTotalProjects = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();

    console.log("Total projects count:", totalProjects);
    res.status(200).json({ TotalProjects: totalProjects });
  } catch (error) {
    console.error("Error fetching total projects:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ===================== GET PROJECTS BY EMPLOYEE ===================== */
const getProjectsByEmployee = async (req, res) => {
  try {
    const { empId } = req.params;

    if (!empId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const employee = await employeeSchema.findOne({ empId });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const projects = await Project.find({
      additionalDetails: {
        $elemMatch: {
          $or: [
            { empId: empId },
            { assignedTo: employee.name }
          ]
        }
      }
    }).sort({ createdAt: -1 });

    if (!projects.length) {
      return res.status(404).json({
        success: false,
        message: "No projects assigned to this employee"
      });
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
  getProjectNames,
  getTotalProjects,
  getProjectsByEmployee
};

