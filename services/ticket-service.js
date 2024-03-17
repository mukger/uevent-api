const Ticket = require("../Models/Ticket");
const Location = require("../Models/Location");
const Event = require("../Models/Event");
const User = require("../Models/User");
const ApiError = require("../utils/ApiError");

class TicketService {
    async formTicketData(event_id, user_id) {
        const [userData] = await User.getUserById(user_id);
        if (userData.length === 0) {
            throw ApiError.BadRequest("This user not found");
        }

        const [locationData] = await Location.getLocationByEventId(event_id);
        if (locationData.length === 0) {
            throw ApiError.BadRequest("This location not found");
        }

        return {
            username: userData[0].login,
            date: new Date().toJSON().slice(0, 19).replace('T', ' '),
            place: locationData[0].name_place
        }
    }
}

module.exports = new TicketService();