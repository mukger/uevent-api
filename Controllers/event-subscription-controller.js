const ApiError = require("../utils/ApiError");
const Event = require("../Models/Event");
const Notification = require("../Models/Notification");
const EventSubscription = require("../Models/EventSubscription");

class EventSubscriptionController {
    async createEventSubscription(req, res, next) {
        try {

            const { eventId } = req.params;

            const [getEventById] = await Event.getEventById(eventId);
            if(getEventById.length < 1) {
                return next(ApiError.BadRequest("Event with this id does not exist"));
            }

            const [subscriptionUserToEvent] = await EventSubscription.getEventSubscriptionUser(req.user.id, eventId);

            if(subscriptionUserToEvent.length > 0) {
                return next(ApiError.BadRequest("The user with the given id is already subscribed to the event"));
            }

            let subscription = {
                user_id: req.user.id,
                event_id: eventId
            }

            const addSubscription = await EventSubscription.addEventSubscription(subscription);

            let notificationOfSubscriptionToUser = {
                user_id: req.user.id,
                event_id: eventId,
                ndescription: `You have subscribed to the event`,
                notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
            };

            const addNotificationToUser = await Notification.addNotification(notificationOfSubscriptionToUser);
            
            return res.status(201).json(
                {
                    ...subscription
                });

        } catch (e) {
            next(e);
        }
    }

    async getSubscriptionCurUserToEvent(req, res, next) {
        try {

            const { eventId } = req.params;

            const [eventById] = await Event.getEventById(eventId);
            if(eventById.length < 1) {
                return next(ApiError.BadRequest("Event with this id does not exist"));
            }

            const [subscriptionUserToEvent] = await EventSubscription.getEventSubscriptionUser(req.user.id, eventId);

            return res.status(200).json(subscriptionUserToEvent[0]);

        } catch(e) {
            next(e);
        }
    }

    async deleteEventSubscription(req, res, next) {
        try {
            const { eventId } = req.params;

            const [getEventById] = await Event.getEventById(eventId);
            if(getEventById.length < 1) {
                return next(ApiError.BadRequest("Event with this id does not exist"));
            }

            const [subscriptionUserToEvent] = await EventSubscription.getEventSubscriptionUser(req.user.id, eventId);

            if(subscriptionUserToEvent.length > 0) {
                const deleteSubscription = await EventSubscription.deleteEventSubscription(req.user.id, eventId);

                let notificationOfUnsubscription = {
                    user_id: req.user.id,
                    event_id: eventId,
                    ndescription: `You unsubscribed from the event`,
                    notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
                };

                const addNotification = await Notification.addNotification(notificationOfUnsubscription);
            }

            return res.status(204).json();

        } catch (e) {
            next(e);
        }
    }
}

module.exports = new EventSubscriptionController();
