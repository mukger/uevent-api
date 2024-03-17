const Router = require('express').Router;
const userController = require('../Controllers/user-controller');
const authMiddleware = require('../Middlewares/auth-middleware');
const fileMiddleware = require('../Middlewares/file-middleware');

const router = new Router();

router.patch('/avatar', authMiddleware, fileMiddleware.single('avatar'), userController.addAvatar);
router.get('/', authMiddleware, userController.getCurrentUserInformation);
router.patch('/', authMiddleware, userController.changeCurrentUserData);
router.delete('/', authMiddleware, userController.deleteCurrentUser);

module.exports = router;