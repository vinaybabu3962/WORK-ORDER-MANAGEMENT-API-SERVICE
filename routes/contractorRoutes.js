// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const contractorController = require('../controllers/contractorController');


router.get('/getContractors', contractorController.getAllContractors);


router.post('/addContractor', contractorController.addContractor);

router.delete('/deleteContractor/:id', contractorController.deleteContractor)

module.exports = router;
