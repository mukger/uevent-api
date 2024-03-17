const db = require('../db/db');
const FilterSortService = require('../services/FilterSort-service');
const config = require('../config.json');

class Event {
    addEvent(event) {
        return db.query('INSERT INTO event SET ?', event);
    }

    getEventById(event_id) {
        return db.query('SELECT event.*, location.name_place, location.latitude, location.longitude, company.cname, company.user_id, company.company_account, ' + 
                        'event_subscription.event_id AS subscription_event_id FROM event LEFT OUTER JOIN company ON company.company_id = event.company_id ' +
                        'LEFT OUTER JOIN location ON location.event_id = event.event_id ' +
                        'LEFT OUTER JOIN event_subscription ON event_subscription.event_id = event.event_id WHERE event.event_id = ?', event_id);
    }

    getEventList(page, format, theme, date, search, sort, future) {
        const maxEventOnPage = config.event.maxEventOnPage;

        const startingLimit = (page - 1) * maxEventOnPage;

        return db.query(FilterSortService.eventFilterSort(format, theme, date, search, sort, future) +
            ` LIMIT ${db.escape(startingLimit)}, ${db.escape(maxEventOnPage)} `);
    }

    getAllEvents(format, theme, date, search, sort, future) {
        return db.query(FilterSortService.eventFilterSort(format, theme, date, search, sort, future));
    }

    changeEventById(event_id, data) {
        return db.query('UPDATE event SET ? WHERE event_id = ? ', [data, event_id]);
    }

    addPicture(event_id, path) {
        return db.query('UPDATE event SET picture = ? WHERE event_id = ? ', ['/' + path, event_id]);
    }

    deleteEventById(event_id) {
        return db.query('DELETE FROM event WHERE event_id = ?', event_id);
    }

    getVisitorsOfTheEvent(event_id) {
        return db.query('SELECT * FROM ticket LEFT OUTER JOIN users ON users.id = ticket.user_id' + 
          ' WHERE event_id = ? AND show_visit = 1', event_id);
    }

    getListEventsByCompanyId(page, format, theme, date, search, sort, future, company_id) {
        const maxEventOnPage = config.event.maxEventOnPage;

        const startingLimit = (page - 1) * maxEventOnPage;

        return db.query(FilterSortService.eventFilterSort(format, theme, date, search, sort, future, '', company_id) +
            ` LIMIT ${db.escape(startingLimit)}, ${db.escape(maxEventOnPage)} `);
    }

    getAllEventsByCompanyId(format, theme, date, search, sort, future, company_id) {
        return db.query(FilterSortService.eventFilterSort(format, theme, date, search, sort, future, '', company_id));
    }

    getAllEventsByCompanyInFuture(company_id) {
        return db.query('SELECT event_id, event_name FROM event WHERE company_id = ? && execution_date > UTC_TIMESTAMP()', company_id);
    }

    getListSimilarEventsOfEvent(page, format, theme, date, search, sort, future, event_id) {
        const maxEventOnPage = config.event.maxEventOnPage;

        const startingLimit = (page - 1) * maxEventOnPage;

        return db.query(FilterSortService.eventFilterSort(format, theme, date, search, sort, future, event_id, '')  +
            ` LIMIT ${db.escape(startingLimit)}, ${db.escape(maxEventOnPage)} `);
    }

    getAllSimilarEventsOfEvent(format, theme, date, search, sort, future, event_id) {
        return db.query(FilterSortService.eventFilterSort(format, theme, date, search, sort, future, event_id, ''));
    }
}

module.exports = new Event();