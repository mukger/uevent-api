const db = require('../db/db');

class Ticket {
    createTicket(ticket) {
        return db.query('INSERT INTO ticket SET ?', ticket);
    }

    getTicketById(ticket_id) {
        return db.query('SELECT * FROM ticket WHERE ticket_id = ?', ticket_id);
    }

    getUserTickets(user_id) {
        return db.query('SELECT ticket.*, event.event_name, event.execution_date, event.ticket_price, location.name_place, company.cname, promocode.discount FROM ticket ' +
                        'LEFT OUTER JOIN users ON users.id = ticket.user_id ' + 
                        'LEFT OUTER JOIN event ON event.event_id = ticket.event_id ' +
                        'LEFT OUTER JOIN location ON location.event_id = event.event_id ' +
                        'LEFT OUTER JOIN company ON company.company_id = event.company_id ' +
                        'LEFT OUTER JOIN promocode ON promocode.promocode_id = ticket.promocode_id ' +
                        'WHERE ticket.user_id = ?', user_id);
    }

    getEventTickets(event_id) {
        return db.query('SELECT * FROM ticket WHERE event_id = ?', event_id);
    }

    getTicketsToSpecificEventByUser(user_id, event_id) {
        return db.query('SELECT * FROM ticket WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
    }
}

module.exports = new Ticket();