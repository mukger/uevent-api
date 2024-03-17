const Router = require('express').Router;
const companyController = require('../Controllers/company-controller');
const authMiddleware = require('../Middlewares/auth-middleware');

const router = new Router();

router.get('/', companyController.getCompanyList);
router.post('/', authMiddleware, companyController.createCompany);
router.patch('/:companyId', authMiddleware, companyController.changeCompany);
router.get('/owner', authMiddleware, companyController.getCompanyByCurrentUser);
router.get('/user/:userId', authMiddleware, companyController.getCompanyByUserId);
router.get('/:companyId', companyController.getCompanyByCompanyId);
router.delete('/', authMiddleware, companyController.deleteCurrentUserCompany);
router.delete('/:companyId', authMiddleware, companyController.deleteCompanyById);

module.exports = router;