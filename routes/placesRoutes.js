const express = require('express');
const router = express.Router();
const { getNearbyPlaces } = require('../controllers/placesController');

router.get('/places', getNearbyPlaces);

module.exports = router;
