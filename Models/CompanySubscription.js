const db = require('../db/db');

class CompanySubscription {
    addCompanySubscription(companySubscription) {
        return db.query('INSERT INTO company_subscription SET ?', companySubscription);
    }

    deleteCompanySubscription(user_id, company_id) {
        return db.query('DELETE FROM company_subscription WHERE user_id = ? AND company_id = ?', [user_id, company_id]);
    }

    getCompanySubscriptionUser(user_id, company_id) {
        return db.query('SELECT * FROM company_subscription WHERE user_id = ? AND company_id = ?', [user_id, company_id]);
    }

    getAllUsersSubscribedToCompany(company_id) {
        return db.query('SELECT * FROM company_subscription LEFT OUTER JOIN users ON users.id = company_subscription.user_id WHERE company_id = ?', company_id);
    }

}

module.exports = new CompanySubscription()