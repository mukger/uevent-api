const Router = require('express').Router;
const eventController = require('../Controllers/event-controller');
const express = require("express");
const fileMiddleware = require("../Middlewares/file-middleware");
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

const urlencodedParser = express.urlencoded({extended: false});

router.post('/', authMiddleware, eventController.addEvent);
router.get('/', eventController.getEventList);
router.get('/:id/visitors', eventController.getVisitorsOfTheEvent);
router.get('/:id/similar', eventController.getListSimiLarEventsOfEvent);
router.get('/company/future', authMiddleware, eventController.getAllEventsByCompanyInFuture);
router.get('/company/:companyId', eventController.getListEventsByCompanyId);
router.get('/company', authMiddleware, eventController.getListEventsByCurUserCompanyId);
router.get('/:id', eventController.getEventById);
router.patch('/:id', authMiddleware, eventController.changeEvent);
router.patch('/:id/picture', authMiddleware, fileMiddleware.single('picture'), eventController.addPicture);
router.delete('/:id', authMiddleware, eventController.deleteEvent);
router.post('/callback_pay', urlencodedParser, eventController.callback_pay);

module.exports = router;