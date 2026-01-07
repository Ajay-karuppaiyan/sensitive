const express = require('express');
const router = express.Router();
const { getPlaceDetails } = require('../controllers/placeDetailsController');

router.get('/:placeId', getPlaceDetails);

module.exports = router;
