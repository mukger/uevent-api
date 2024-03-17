const crypto = require('crypto');
const schedule = require('node-schedule');
const Event = require("../Models/Event");
const Location = require("../Models/Location");
const Company = require("../Models/Company");
const Promocode = require("../Models/Promocode");
const Ticket = require("../Models/Ticket");
const User = require("../Models/User");
const Notification = require("../Models/Notification");
const CompanySubscription = require("../Models/CompanySubscription");
const EventSubscription = require("../Models/EventSubscription");
const ApiError = require("../utils/ApiError");
const MailService = require('../services/mail-service');
const PdfService = require('../services/pdf-service');
const TicketService = require('../services/ticket-service');
const NotificationService = require('../services/notification-service');
const config = require("../config.json");
const moment = require('moment');
const {changeDateToUTC} = require("../utils/changeDateToUtc");


class EventController {
    async addEvent(req, res, next) {
        try {
            let eventData = req.body;
            if( !eventData.execution_date || !eventData.edescription ||
                (!eventData.notify_subscription && eventData.notify_subscription === undefined) ||
                (!eventData.show_subscribers  && eventData.show_subscribers === undefined) ||
                !eventData.format || !eventData.theme || !eventData.ticket_price || !eventData.ticket_count ||
                !eventData.ticket_limit || !eventData.latitude || !eventData.longitude || !eventData.name_place) {

                return next(ApiError.BadRequest("Check all fields"));
            }

            if(!req.query.utc) {
                return next(ApiError.BadRequest("You must set utc query param!"));
            }

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User didn't create company"));
            }

            let event = {
                company_id: userCompany[0].company_id,
                execution_date: changeDateToUTC(+req.query.utc, eventData.execution_date),
                edescription: eventData.edescription,
                notify_subscription: eventData.notify_subscription,
                show_subscribers: eventData.show_subscribers,
                publication_date: (eventData.publication_date)?(changeDateToUTC(+req.query.utc, eventData.publication_date)):(new Date().toJSON().slice(0, 19).replace('T', ' ')),
                format: eventData.format,
                theme: eventData.theme,
                ticket_price: eventData.ticket_price,
                ticket_count: eventData.ticket_count,
                ticket_limit: eventData.ticket_limit,
                picture: config.event.default_image,
                event_name: eventData.event_name
            }

            async function createEvent(event) {
                const resultEvent = await Event.addEvent(event);

                const locationData = await Location.addLocation(
                    { latitude: eventData.latitude,
                    longitude: eventData.longitude,
                    name_place: eventData.name_place,
                    event_id: resultEvent[0].insertId });

                let notification = {
                    event_id: resultEvent[0].insertId,
                    ndescription: `Event "${event.event_name}" you are subscribed to has started!`,
                    notification_date: event.execution_date
                };

                const addNotificationByEvent = await NotificationService.createNotificationByEvent(resultEvent[0].insertId, event.execution_date.replace(' ', 'T'), event.event_name, notification);

                return {event_id: resultEvent[0].insertId, ...event}
            }

            async function createCompanyNotification(userCompany, event) {
                let companyNotification = {
                    company_id: userCompany[0].company_id,
                    ndescription: `Company "${userCompany[0].cname}" you are subscribed to create new event "${event.event_name}"`,
                    notification_date: event.publication_date
                };
    
                const [getAllUsersSubscribedToCompany] = await CompanySubscription.getAllUsersSubscribedToCompany(userCompany[0].company_id);
    
                for(let i = 0; i < getAllUsersSubscribedToCompany.length; i++) {
                    let addNotification = await Notification.addNotification(
                        {
                            ...companyNotification,
                            user_id: getAllUsersSubscribedToCompany[i].user_id
                        }
                    );
                }
            }

            if(eventData.publication_date) {
                schedule.scheduleJob(`${req.user.id}u`, new Date(event.publication_date.replace(' ', 'T') + 'Z'), async (err) => {
                    await createCompanyNotification(userCompany, event);
                    await createEvent(event);
                });

                return res.status(202).json();
            }
            else {
                await createCompanyNotification(userCompany, event);
                return res.status(201).json(await createEvent(event));
            }
            
        } catch (e) {
            next(e);
        }
    }

    async getEventById(req, res, next) {
        try {
            const [event] = await Event.getEventById(req.params.id);
            if (event.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            return res.status(200).json(event[0]);
        } catch (e) {
            next(e);
        }
    }

    async getEventList(req, res, next) {
        try {
            let page = req.query.page ? Number(req.query.page) : 1;

            const [events] = await Event.getEventList(page, req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future);

            const [getAllEvents] = await Event.getAllEvents(req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future);

            res.set('X-Total-Count', getAllEvents.length);
            res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            return res.status(200).json(events);

        } catch (e) {
            next(e);
        }
    }

    async changeEvent(req, res, next) {
        try {
            const [event] = await Event.getEventById(req.params.id);
            if (event.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User not create company"));
            }

            if (userCompany[0].company_id !== event[0].company_id) {
                return next(ApiError.Forbidden("you are wrong"));
            }

            if(req.body.execution_date) {

                if(!req.query.utc) {
                    return next(ApiError.BadRequest("You must set utc query param if you want to change execution date of the event!"));
                }

                let notification = {
                    event_id: req.params.id,
                    ndescription: `Event "${(req.body.event_name)?(req.body.event_name):(event[0].event_name)}" you are subscribed to has started!`,
                    notification_date: changeDateToUTC(+req.query.utc, req.body.execution_date).replace(' ', 'T')
                };

                const changeNotificationByEvent = await NotificationService.changeNotificationByEvent(req.params.id, changeDateToUTC(+req.query.utc, req.body.execution_date).replace(' ', 'T'), event.event_name, notification);
            
                req.body.execution_date = changeDateToUTC(+req.query.utc, req.body.execution_date);
            }

            if(req.body.latitude || req.body.longitude || req.body.name_place) {
                let location = {};
                if(req.body.latitude) { location.latitude = req.body.latitude; delete req.body.latitude }
                if(req.body.longitude) { location.longitude = req.body.longitude; delete req.body.longitude }
                if(req.body.name_place) { location.name_place = req.body.name_place; delete req.body.name_place }
                const [changeLocationOfCompany] = await Location.changeLocationOfEvent(location, req.params.id);
            }

            let notificationOfChangeEvent = {
                event_id: req.params.id,
                ndescription: `Event "${event[0].event_name}" you was subscribed to has changed`,
                notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
            };

            const [usersSubscribedToEvent] = await EventSubscription.getAllUsersSubscribedToEvent(req.params.id);

            for(let i = 0; i < usersSubscribedToEvent.length; i++) {
                let addNotification = await Notification.addNotification(
                    {
                        ...notificationOfChangeEvent,
                        user_id: usersSubscribedToEvent[i].user_id
                    }
                );
            }

            const data = await Event.changeEventById(req.params.id, req.body);

            const [changedEvent] = await Event.getEventById(req.params.id);

            res.status(200).json(changedEvent[0]);

        } catch (e) {

        }
    }

    async addPicture(req, res, next) {
        try {
            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User not create company"));
            }

            const [event] = await Event.getEventById(req.params.id);
            if (event.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            if (userCompany[0].company_id !== event[0].company_id) {
                return next(ApiError.Forbidden("you are wrong"));
            }

            const data = await Event.addPicture(req.params.id, req.file.path);

            res.status(201).json(data);
        } catch (e) {
            next(e);
        }
    }

    async deleteEvent(req, res, next) {
        try {
            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0 && req.user.user_role !== 'admin') {
                return next(ApiError.Forbidden("User not create company"));
            }

            const [event] = await Event.getEventById(req.params.id);
            if (event.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            if (+userCompany[0].company_id !== +event[0].company_id && req.user.user_role !== 'admin') {
                return next(ApiError.Forbidden("you are wrong"));
            }

            let notificationOfCancelEvent = {
                event_id: req.params.id,
                ndescription: `The event you was subscribed to has cancelled`,
                notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
            };

            const [usersSubscribedToEvent] = await EventSubscription.getAllUsersSubscribedToEvent(req.params.id);

            for(let i = 0; i < usersSubscribedToEvent.length; i++) {
                let addNotification = await Notification.addNotification(
                    {
                        ...notificationOfCancelEvent,
                        user_id: usersSubscribedToEvent[i].user_id
                    }
                );
            }

            const data = await Event.deleteEventById(req.params.id);

            const deleteNotificationByEvent = await NotificationService.deleteNotificationByEvent(req.params.id);

            res.status(204).json();
        } catch (e) {
            next(e)
        }
    }

    async callback_pay(req, res, next) {
        try {
            console.log(req.body);

            let signature = crypto.createHash('sha1')
                .update(config.liqpay.private_key + req.body.data + config.liqpay.private_key)
                .digest('base64');

            console.log(signature);

            const paymentData = JSON.parse(Buffer
                .from(req.body.data, 'base64')
                .toString('utf8'));

            const userAndEventData = JSON.parse(Buffer
                .from(paymentData.description, 'base64')
                .toString('utf8'));

            console.log(userAndEventData);

            const [authorOfTheOrder] = await User.getUserById(userAndEventData.user_id);
            const [event] = await Event.getEventById(userAndEventData.event_id);
            const [company] = await Company.getCompanyByCompanyId(event[0].company_id);
            let currentDiscount = -1;
            if(userAndEventData.promocode_id.length !== 0) {
                const [promocode] = await Promocode.getPromocodeById(userAndEventData.promocode_id);
                if(promocode.length !== 0) {
                    currentDiscount = promocode[0].discount;
                }
            }

            if (event.length === 0) {
                return ApiError.BadRequest("This event not found");
            }

            if(+event[0].ticket_count <= 0) {
                return ApiError.Forbidden("Unable to buy a ticket at the moment");
            }

            if (signature !== req.body.signature) {
                await MailService.sendNotificationByFailedPayment(authorOfTheOrder[0].email, event[0].event_name);
                return next(ApiError.Forbidden("Incorrect signature liqpay!"));
            }

            if (paymentData.status !== 'success') {
                await MailService.sendNotificationByFailedPayment(authorOfTheOrder[0].email, event[0].event_name);
                return next(ApiError.Forbidden("Error of pay!!! Liqpay payment status = " + paymentData.status));
            }

            const [ticket] = await Ticket.getTicketById(paymentData.order_id);

            if (ticket.length === 0) {
                const ticketData = await TicketService.formTicketData(userAndEventData.event_id, userAndEventData.user_id);

                let pdfData = {
                    date: new Date(moment(ticketData.date).format("YYYY-MM-DD HH:mm:ss").replace(' ', 'T') + 'Z'),
                    user: ticketData.username,
                    place: ticketData.place,
                    ticketId: paymentData.order_id,
                    eventName: event[0].event_name,
                    executionDate: new Date(moment(event[0].execution_date).format("YYYY-MM-DD HH:mm:ss").replace(' ', 'T') + 'Z'),
                    companyName: company[0].cname,
                    ticketPrice: event[0].ticket_price,
                    totalTicketPrice: event[0].ticket_price
                };

                (currentDiscount !== -1)&&(pdfData.discount = currentDiscount, pdfData.totalTicketPrice =  event[0].ticket_price - event[0].ticket_price * currentDiscount / 100);

                let pdfOutput = await PdfService.createPdf(pdfData);
                await MailService.sendTicket(authorOfTheOrder[0].email, pdfOutput);
                await Event.changeEventById(userAndEventData.event_id, {ticket_count: +event[0].ticket_count - 1});

                let userTicket = {
                    ticket_id: paymentData.order_id,
                    user_id: userAndEventData.user_id,
                    event_id: userAndEventData.event_id,
                    purchase_date: ticketData.date,
                    show_visit: userAndEventData.show_visit
                };

                (userAndEventData.promocode_id.length !== 0)&&(userTicket.promocode_id = userAndEventData.promocode_id);

                const createdTicket = await Ticket.createTicket(userTicket);

                let notificationOfBuyingTicket = {
                    user_id: userAndEventData.user_id,
                    event_id: userAndEventData.event_id,
                    ndescription: `You have bought a ticket for the event`,
                    notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
                };
    
                const addNotifOfBuyingTicket = await Notification.addNotification(notificationOfBuyingTicket);

                //Может тут сделать не просто уведомление, а уведомление на почту. Но мне кажется глупо делать уведомление на почту,
                //при каждом новом юзере, который покупает билет на мероприятие

                let notificationOfSubscriptionToAuthor = {
                    user_id: event[0].user_id,
                    event_id: userAndEventData.event_id,
                    ndescription: `Someone has bought a ticket for your event`,
                    notification_date: new Date().toJSON().slice(0, 19).replace('T', ' ')
                }
    
                const addNotifToAuthor = await Notification.addNotification(notificationOfSubscriptionToAuthor);

                res.status(201).json(createdTicket);
            }
        } catch (e) {
            next(e);
        }
    }

    async getVisitorsOfTheEvent(req, res, next) {
        try {

            const [event] = await Event.getEventById(req.params.id);
            if (event.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            if(+event[0].show_subscribers === 1) {
                const [getVisitorsOfTheEvent] = await Event.getVisitorsOfTheEvent(req.params.id);

                return res.status(200).json(getVisitorsOfTheEvent);
            }
            else {
                const [getTicketToSpecEvent] = await Ticket.getTicketsToSpecificEventByUser(req.user.id, req.params.id);

                if(getTicketToSpecEvent.length === 0) {
                    return next(ApiError.BadRequest("Only a visitor of the event can see the rest of visitors of this event"));
                }
                else {
                    const [getVisitorsOfTheEvent] = await Event.getVisitorsOfTheEvent(req.params.id);

                    return res.status(200).json(getVisitorsOfTheEvent);
                }
            }

        } catch(e) {
            next(e);
        }
    }

    async getListEventsByCompanyId(req, res, next) {
        try {

            let page = req.query.page ? Number(req.query.page) : 1;

            const { companyId } = req.params;

            const [getCompanyByCompanyId] = await Company.getCompanyByCompanyId(companyId);
            if(getCompanyByCompanyId.length === 0) {
                return next(ApiError.BadRequest("Company with this id does not exist"));
            }

            const [events] = await Event.getListEventsByCompanyId(page, req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future, companyId);

            const [getAllEventsByCompanyId] = await Event.getAllEventsByCompanyId(req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future, companyId);

            res.set('X-Total-Count', getAllEventsByCompanyId.length);
            res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            return res.status(200).json(events);


        } catch(e) {
            next(e);
        }
    }

    async getAllEventsByCompanyInFuture(req, res, next) {
        try {

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User not create company"));
            }

            const [getAllEventsByCompanyInFuture] = await Event.getAllEventsByCompanyInFuture(userCompany[0].company_id);

            return res.status(200).json(getAllEventsByCompanyInFuture);

        } catch(e) {
            next(e);
        }
    }

    async getListEventsByCurUserCompanyId(req, res, next) {
        try {

            let page = req.query.page ? Number(req.query.page) : 1;

            const [userCompany] = await Company.getCompanyByUserId(req.user.id);
            if (userCompany.length === 0) {
                return next(ApiError.Forbidden("User not create company"));
            }

            const [events] = await Event.getListEventsByCompanyId(page, req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future, userCompany[0].company_id);

            const [getAllEventsByCompanyId] = await Event.getAllEventsByCompanyId(req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future, userCompany[0].company_id);

            res.set('X-Total-Count', getAllEventsByCompanyId.length);
            res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            return res.status(200).json(events);

        } catch(e) {
            next(e);
        }
    }

    async getListSimiLarEventsOfEvent(req, res, next) {
        try {

            const { id } = req.params;

            if(!req.query.format || !req.query.theme) {
                return next(ApiError.BadRequest("You must set format and theme query params!"));
            }
            
            const [event] = await Event.getEventById(id);
            if (event.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            let page = req.query.page ? Number(req.query.page) : 1;

            const [events] = await Event.getListSimilarEventsOfEvent(page, req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future, id);

            const[getAllSimilarEvents] = await Event.getAllSimilarEventsOfEvent(req.query.format, req.query.theme, req.query.date, req.query.search, req.query.sort, req.query.future, id);

            res.set('X-Total-Count', getAllSimilarEvents.length);
            res.set('Access-Control-Expose-Headers', 'X-Total-Count');

            return res.status(200).json(events);
            
        } catch(e) {
            next(e);
        }
    }

}

module.exports = new EventController();
