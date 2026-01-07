const express = require("express");
const multer = require("multer");
const employeeRouter = express.Router();
const Employee = require("../controllers/employeeController")


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
employeeRouter.post(
  "/createemployee",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "addressProofFile", maxCount: 1 },
    { name: "idProofFile", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  Employee.createEmployee
)

employeeRouter.get("/getallemployees", Employee.getAllEmployees)
employeeRouter.get("/getemployeesbyid/:id", Employee.getEmployeeById)
employeeRouter.patch(
  "/updateemployee/:id",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "addressProofFile", maxCount: 1 },
    { name: "idProofFile", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),

  Employee.updateEmployee
);
employeeRouter.delete("/deleteemployee/:id", Employee.deleteEmployee)
employeeRouter.get("/employename/:id", Employee.getEmployeeNames)
employeeRouter.get("/totalemployee", Employee.getTotalEmployees);

employeeRouter.get("/getaddressbypincode/:pincode", async (req, res) => {
  const { pincode } = req.params;

  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return res.status(400).json({ success: false, message: "Invalid pincode format." });
  }

  try {
    const addressDetails = await Employee.fetchAddressDetailsByPincode(pincode);

    if (addressDetails) {
      return res.status(200).json({ success: true, address: addressDetails });
    } else {
      return res.status(404).json({ success: false, message: "Address details not found." });
    }
  } catch (error) {
    console.error("Error fetching address details:", {
      pincode,
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

employeeRouter.get("/employeedetails/:id", Employee.getEmployeeDetailsById);
employeeRouter.get('/allemployeesdata', Employee.getAllEmployeesWithData);
employeeRouter.get('/employeedatabyid/:empId', Employee.getEmployeeDataById);
employeeRouter.put('/employeedataupdateid/:empId', Employee.updateEmployeeDataById);

module.exports = employeeRouter;
