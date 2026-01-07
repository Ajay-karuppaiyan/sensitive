const express = require('express');
const {
  createClient,
  getAllClients,
  getClientById,
  updateClientById,
  deleteClientById,
  updateClientStatus,
  getTotalClients,
} = require('../controllers/clientController');

const router = express.Router(); 

router.post('/create', createClient);
router.get('/get-all', getAllClients); 
router.get('/get/:id', getClientById); 
router.put('/update/:id', updateClientById);
router.delete('/delete/:id', deleteClientById); 
router.put('/update-status/:id',updateClientStatus); 
router.get('/totalclients', getTotalClients);


module.exports = router;
