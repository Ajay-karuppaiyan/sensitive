const express = require('express');
const { createOrUpdateDisposition, getAllDispositions, getDispositionById } = require('../controllers/updatelogController');
const router = express.Router();

router.post('/disposition/:id?', createOrUpdateDisposition);


router.get('/getdispositions', getAllDispositions); 

router.get('/getdispositionbyid/:id', getDispositionById);

module.exports = router;
