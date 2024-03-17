const db = require('../db/db');

class Promocode {
    addPromocode(promocode) {
        return db.query('INSERT INTO promocode SET ?', promocode);
    }

    getPromocodeById(promocode_id) {
        return db.query('SELECT * FROM promocode WHERE promocode_id = ?', promocode_id);
    }

    getPromocodeByPromocode(promocode) {
        return db.query('SELECT * FROM promocode WHERE promocode = ?', promocode);
    }

    getAllPromocodesActivatedByUser(user_id) {
        return db.query('SELECT promocode.*, user_promocode.activation_date FROM user_promocode LEFT OUTER JOIN' + 
                        ' promocode ON promocode.promocode_id = user_promocode.promocode_id WHERE user_promocode.user_id = ? ORDER BY promocode.expiration_date', user_id);
    }

    getUsedPromocodeToEvent(user_id, event_id) {
        return db.query('SELECT MAX(promocode.discount) AS discount, user_promocode.promocode_id ' +
                        'FROM user_promocode ' +
                        'LEFT OUTER JOIN promocode ON promocode.promocode_id = user_promocode.promocode_id ' +
                        'WHERE user_promocode.user_id = ? AND promocode.event_id = ? ' +
                        'GROUP BY promocode_id', [user_id, event_id]);
    }

    getUsedPromocodeToCompany(user_id, company_id) {
        return db.query('SELECT MAX(promocode.discount) AS discount, user_promocode.promocode_id ' +
                        'FROM user_promocode ' +
                        'LEFT OUTER JOIN promocode ON promocode.promocode_id = user_promocode.promocode_id ' +
                        'WHERE user_promocode.user_id = ? AND promocode.company_id = ? ' +
                        'GROUP BY promocode_id', [user_id, company_id]);
    }

    addUserPromocode(user_promocode) {
        return db.query('INSERT INTO user_promocode SET ?', user_promocode);
    }

    changeExpirationDateOfPromocode(promocode_id, expiration_date) {
        return db.query('UPDATE promocode SET expiration_date = ? WHERE promocode_id = ? ', [expiration_date, promocode_id]);
    }

    getUserPromocode(user_id, promocode_id) {
        return db.query('SELECT * FROM user_promocode WHERE user_id = ? AND promocode_id = ?', [user_id, promocode_id]);
    }

    getAllPromocodesByCompany(company_id) {
        return db.query('SELECT promocode.*, event.event_name FROM promocode LEFT OUTER JOIN event ON event.event_id = promocode.event_id WHERE promocode.company_id = ? OR event.company_id = ? ORDER BY promocode.promocode_id DESC', [company_id, company_id]);
    }

    deletePromocode(promocode_id) {
        return db.query('DELETE FROM promocode WHERE promocode_id = ?', promocode_id);
    }

}

module.exports = new Promocode()