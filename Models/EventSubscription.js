const db = require('../db/db');

class EventSubscription {
    addEventSubscription(eventSubscription) {
        return db.query('INSERT INTO event_subscription SET ?', eventSubscription);
    }

    deleteEventSubscription(user_id, event_id) {
        return db.query('DELETE FROM event_subscription WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
    }

    getEventSubscriptionUser(user_id, event_id) {
        return db.query('SELECT * FROM event_subscription WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
    }

    getAllUsersSubscribedToEvent(event_id) {
        return db.query('SELECT * FROM event_subscription LEFT OUTER JOIN users ON users.id = event_subscription.user_id WHERE event_id = ?', event_id);
    }

}

module.exports = new EventSubscription()