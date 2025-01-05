// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityLocationController');


router.get('/getEntities', entityController.getAllEntities);


router.post('/addEntity', entityController.addEntity);

router.get('/getLocations', entityController.getLocations);


router.post('/addLocation', entityController.addLocation);

router.put('/updateLocation', entityController.updateLocation);

module.exports = router;
