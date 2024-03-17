const db = require('../db/db');

class Notification {
    addNotification(notification) {
        return db.query('INSERT INTO notification SET ?', notification);
    }

    deleteNotification(notification_id) {
        return db.query('DELETE FROM notification WHERE notification_id = ?', notification_id);
    }

    getNotificationsByUser(user_id) {
        return db.query('SELECT notification.*, event.event_name AS event_name, event.company_id AS event_company_id, company.cname AS company_name FROM notification ' + 
                        'LEFT OUTER JOIN event ON event.event_id = notification.event_id ' + 
                        'LEFT OUTER JOIN company ON company.company_id = notification.company_id WHERE notification.user_id = ?', user_id); 
    }

}

module.exports = new Notification()