const express = require('express');
const { 
    createQuotation, 
    getAllQuotations, 
    getQuotationById, 
    updateQuotation, 
    deleteQuotation 
} = require('../controllers/quotationController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/quotationcreate',upload.single("quotation"), createQuotation);
router.get('/allquotation', getAllQuotations);
router.get('/quotationbyid/:id', getQuotationById);
router.put('/quotationupdate/:id', upload.single("quotation"), updateQuotation);
router.delete('/quotationdelete/:id', deleteQuotation);

module.exports = router;
