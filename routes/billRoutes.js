// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');





router.get('/getAllBills', billController.getBills);

router.get('/getBillPdf/:id', billController.getBillPdf);

router.post('/generateBill',billController.generateBillsForAllContractors);

module.exports = router;