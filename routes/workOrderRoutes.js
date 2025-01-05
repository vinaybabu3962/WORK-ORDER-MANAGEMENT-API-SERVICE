// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const authenticateJWT = require('./../middleware');




router.post('/addWorkOrder',authenticateJWT, workOrderController.addWorkOrder);


router.get('/getAllWorkOrders',authenticateJWT, workOrderController.getAllWorkOrders);

module.exports = router;