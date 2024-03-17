const Router = require('express').Router;
const authController = require('../Controllers/auth-controller');

const router = new Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;