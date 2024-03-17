const ApiError = require("../utils/ApiError");
const Ticket = require("../Models/Ticket");
const Event = require("../Models/Event");

class TicketController {
    async getAllTicketsByUser(req, res, next) {

        try {

            const [getUserTickets] = await Ticket.getUserTickets(req.user.id);

            return res.status(200).json(getUserTickets);

        } catch (e) {
            next(e);
        }
    }

    async getAllTicketsByEvent(req, res, next) {
        try {

            const { eventId } = req.params;

            const [getEventById] = await Event.getEventById(eventId);

            if (getEventById.length === 0) {
                return next(ApiError.BadRequest("Event not found"));
            }

            if(+req.user.id === +getEventById[0].user_id) {
                const [getEventTickets] = await Ticket.getEventTickets(eventId);

                return res.status(200).json(getEventTickets);
            }
            else {
                return next(ApiError.Forbidden("Only author of the event can see its ticket buyers"));
            }

        } catch (e) {
            next(e);
        }
    }

    async getTicketsToSpecificEventByUser(req, res, next) {
        try {

            const { eventId } = req.params;

            const [getTicketToSpecEvent] = await Ticket.getTicketsToSpecificEventByUser(req.user.id, eventId);

            return res.status(200).json(getTicketToSpecEvent);

        } catch(e) {
            next(e);
        }
    }

}

module.exports = new TicketController();
