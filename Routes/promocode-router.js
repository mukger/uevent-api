const Router = require('express').Router;
const promocodeController = require('../Controllers/promocode-controller');
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

router.post('/', authMiddleware, promocodeController.createPromocode);
router.post('/activate', authMiddleware, promocodeController.activatePromocodeByUser);
router.get('/', authMiddleware, promocodeController.getAllPromocodesActivatedByUser);
router.get('/company', authMiddleware, promocodeController.getAllPromocodesByCompany);
router.get('/used/:eventId', authMiddleware, promocodeController.getUsedPromocodeToEvent);
router.get('/:promocodeId', authMiddleware, promocodeController.getPromocodeById);
router.post('/extending/:promocodeId', authMiddleware, promocodeController.extendPromocodeExpirationDate);
router.delete('/:promocodeId', authMiddleware,  promocodeController.deletePromocode);

module.exports = router;