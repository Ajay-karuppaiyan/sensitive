const express = require('express');
const superadminRouter = express.Router();
const superadminController = require('../controllers/superadminControllers'); 
superadminRouter.get('/getallsuperadmins', superadminController.getAllSuperAdmins);
superadminRouter.post('/createsuperadmin', superadminController.createSuperAdmin); 
superadminRouter.put('/updatesuperadmin', superadminController.updateSuperAdmin); 


module.exports = superadminRouter;
