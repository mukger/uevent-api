const Router = require('express').Router;
const commentController = require('../Controllers/comment-controller');
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

router.post('/event/:eventId', authMiddleware, commentController.createCommentToEvent);
router.post('/company/:companyId', authMiddleware, commentController.createCommentToCompany);
router.get('/event/:eventId', commentController.getCommentsToEvent);
router.get('/company/:companyId', commentController.getCommentsToCompany);
router.patch('/:commentId', authMiddleware, commentController.changeCommentById);
router.delete('/:commentId', authMiddleware, commentController.deleteCommentById);

module.exports = router;