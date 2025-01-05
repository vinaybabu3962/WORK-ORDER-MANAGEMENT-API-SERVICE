
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityLocationController');
const authenticateJWT = require('./../middleware');

router.get('/getEntities',authenticateJWT, entityController.getAllEntities);


router.post('/addEntity', authenticateJWT,entityController.addEntity);

router.get('/getLocations', authenticateJWT,entityController.getLocations);


router.post('/addLocation', authenticateJWT, entityController.addLocation);

router.put('/updateLocation', authenticateJWT,entityController.updateLocation);

module.exports = router;
