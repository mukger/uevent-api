const Router = require('express').Router;
const locationController = require('../Controllers/location-controller');

const router = new Router();

router.get('/:id', locationController.getLocationById);
router.get('/event/:id', locationController.getLocationByEventId);
router.get('/company/:id', locationController.getLocationByCompanyId);

module.exports = router;