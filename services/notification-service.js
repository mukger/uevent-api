const schedule = require('node-schedule');
const Notification = require("../Models/Notification");
const EventSubscription = require('../Models/EventSubscription');
const MailService = require('../services/mail-service');

class NotificationService {
    async createNotificationByEvent(eventId, execution_date, eventName, notification) {

        let execDate = new Date(execution_date + 'Z');

        schedule.scheduleJob(`${eventId}`, execDate, async (err) => {
            const [usersSubscribedToEvent] = await EventSubscription.getAllUsersSubscribedToEvent(eventId);

            let mailUsersArray = [];

            for(let i = 0; i < usersSubscribedToEvent.length; i++) {
                let addNotification = await Notification.addNotification(
                    {
                        ...notification,
                        user_id: usersSubscribedToEvent[i].user_id
                    }
                );
                mailUsersArray.push(usersSubscribedToEvent[i].email);
            }

            if(mailUsersArray.length !== 0) {
                await MailService.sendEventNotification(mailUsersArray, eventName)
            }
        });
        
    }

    async changeNotificationByEvent(eventId, execution_date, eventName, notification) {
        await this.deleteNotificationByEvent(eventId);
        await this.createNotificationByEvent(eventId, execution_date, eventName, notification);
    }

    async deleteNotificationByEvent(eventId) {
        schedule.cancelJob(`${eventId}`);
    }
}

module.exports = new NotificationService();
