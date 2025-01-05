// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const contractorController = require('../controllers/contractorController');
const authenticateJWT = require('./../middleware');

router.get('/getContractors', authenticateJWT,contractorController.getAllContractors);


router.post('/addContractor',authenticateJWT, contractorController.addContractor);

router.delete('/deleteContractor/:id', authenticateJWT,contractorController.deleteContractor)

router.get('/getContractorsByLocation/:id', authenticateJWT,contractorController.getContractorsByLocation )

module.exports = router;
