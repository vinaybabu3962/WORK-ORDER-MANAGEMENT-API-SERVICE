// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const authenticateJWT = require('./../middleware');




router.get('/getAllBills', authenticateJWT,billController.getBills);

router.get('/getBillPdf/:id', authenticateJWT,billController.getBillPdf);

router.post('/generateBill',authenticateJWT,billController.generateBillsForAllContractors);

module.exports = router;