const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/image/:id', mapController.getImage);
router.get('/map-data/:companyId', mapController.getMapData);

module.exports = router;