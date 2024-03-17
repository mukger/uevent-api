const db = require('../db/db');

class Location {
    addLocation(location) {
        return db.query('INSERT INTO location SET ?', location);
    }

    getLocationById(id) {
        return db.query('SELECT * FROM location WHERE location_id = ?', id);
    }

    getLocationByEventId(id) {
        return db.query('SELECT * FROM location WHERE event_id = ?', id);
    }

    getLocationByCompanyId(company_id) {
        return db.query('SELECT * FROM location WHERE company_id = ?', company_id);
    }

    changeLocationOfCompany(location, company_id) {
        return db.query('UPDATE location SET ? WHERE company_id = ?', [location, company_id]);
    }

    changeLocationOfEvent(location, event_id) {
        return db.query('UPDATE location SET ? WHERE event_id = ?', [location, event_id]);
    }

    deleteLocationByCompanyId(company_id) {
        return db.query('DELETE FROM location WHERE company_id = ?', company_id);
    }
}

module.exports = new Location();