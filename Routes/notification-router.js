const Router = require('express').Router;
const notificationController = require('../Controllers/notification-controller');
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

router.get('/', authMiddleware, notificationController.getNotificationsByUser);

module.exports = router;