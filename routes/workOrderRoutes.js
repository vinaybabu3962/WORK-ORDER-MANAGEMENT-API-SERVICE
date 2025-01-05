// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');





router.post('/addWorkOrder', workOrderController.addWorkOrder);


router.get('/getAllWorkOrders',workOrderController.getAllWorkOrders);

module.exports = router;