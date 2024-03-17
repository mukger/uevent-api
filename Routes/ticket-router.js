const Router = require('express').Router;
const ticketController = require('../Controllers/ticket-controller');
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

router.get('/', authMiddleware, ticketController.getAllTicketsByUser);
router.get('/user/:eventId', authMiddleware, ticketController.getTicketsToSpecificEventByUser);
router.get('/:eventId', authMiddleware, ticketController.getAllTicketsByEvent);

module.exports = router;