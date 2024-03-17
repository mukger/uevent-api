const Router = require('express').Router;
const companySubscriptionController = require('../Controllers/company-subscription-controller');
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

router.post('/:companyId', authMiddleware, companySubscriptionController.createCompanySubscription);
router.get('/:companyId', authMiddleware, companySubscriptionController.getSubscriptionCurUserToCompany);
router.delete('/:companyId', authMiddleware, companySubscriptionController.deleteCompanySubscription);

module.exports = router;