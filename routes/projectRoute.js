const express = require("express");
const projectRouter = express.Router();
const projectController = require("../controllers/projectController");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

projectRouter.post("/createproject",upload.single("projectDocument"), projectController.createProject);
projectRouter.get("/getallprojects/:id", projectController.getAllProjects);
projectRouter.get("/getprojectbyid/:id", projectController.getProjectById);
projectRouter.put("/updateprojectby/:id",upload.single("projectDocument"), projectController.updateProjectById);
projectRouter.delete("/deleteproject/:id", projectController.deleteProjectById);
projectRouter.get("/projectname", projectController.getProjectNames);
projectRouter.get('/totalprojects', projectController.getTotalProjects);


module.exports = projectRouter;

