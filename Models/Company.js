const db = require('../db/db');
const config = require('../config.json');

class Company {
    addCompany(company) {
        return db.query('INSERT INTO company SET ?', company);
    }

    changeCompany(company) {
        return db.query('UPDATE company SET ? WHERE company_id = ?', [company, company.company_id]);
    }

    deleteCompanyByUserId(user_id) {
        return db.query('DELETE FROM company WHERE user_id = ?', user_id)
    }

    deleteCompanyByCompanyId(company_id) {
        return db.query('DELETE FROM company WHERE company_id = ?', company_id)
    }

    getCompanyByCompanyId(company_id) {
        return db.query('SELECT company.*, company_subscription.company_id AS company_subscription_id FROM company ' + 
        'LEFT OUTER JOIN company_subscription ON company_subscription.company_id = company.company_id WHERE company.company_id = ?', company_id);
    }

    getCompanyByUserId(user_id) {
        return db.query('SELECT * FROM company WHERE user_id = ?', user_id);
    }

    getCompanyByName(cname) {
        return db.query('SELECT * FROM company WHERE cname = ?', cname);
    }

    getCompanyByEmail(cemail) {
        return db.query('SELECT * FROM company WHERE cemail = ?', cemail);
    }

    getCompanyByAccount(company_account) {
        return db.query('SELECT * FROM company WHERE company_account = ?', company_account);
    }

    getAllCompanies() {
        return db.query('SELECT * FROM company');
    }

    getCompanyList() {
        return db.query('SELECT * FROM company');
    }

}

module.exports = new Company()