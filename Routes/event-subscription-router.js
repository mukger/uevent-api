const Router = require('express').Router;
const eventSubscriptionController = require('../Controllers/event-subscription-controller');
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

router.post('/:eventId', authMiddleware, eventSubscriptionController.createEventSubscription);
router.get('/:eventId', authMiddleware, eventSubscriptionController.getSubscriptionCurUserToEvent);
router.delete('/:eventId', authMiddleware, eventSubscriptionController.deleteEventSubscription);

module.exports = router;